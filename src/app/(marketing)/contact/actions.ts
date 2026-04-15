"use server"

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const schemaContact = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
  // Champs optionnels — concaténés dans le message
  entreprise: z.string().optional(),
  taille: z.string().optional(),
  secteur: z.string().optional(),
  telephone: z.string().optional(),
  rgpd: z.string().optional(),
})

export type EtatContact =
  | { statut: "idle" }
  | { statut: "succes" }
  | { statut: "erreur"; message: string }

export async function envoyerContact(
  _etatPrecedent: EtatContact,
  formData: FormData
): Promise<EtatContact> {
  const brut = {
    nom: formData.get("nom") as string,
    email: formData.get("email") as string,
    message: formData.get("message") as string,
    entreprise: (formData.get("entreprise") as string) || "",
    taille: (formData.get("taille") as string) || "",
    secteur: (formData.get("secteur") as string) || "",
    telephone: (formData.get("telephone") as string) || "",
    rgpd: (formData.get("rgpd") as string) || "",
  }

  // Vérifier le consentement RGPD
  if (!brut.rgpd) {
    return { statut: "erreur", message: "Veuillez accepter la politique de confidentialité pour envoyer votre message." }
  }

  const resultat = schemaContact.safeParse(brut)
  if (!resultat.success) {
    return { statut: "erreur", message: resultat.error.issues[0].message }
  }

  // Construire le message enrichi avec les champs supplémentaires
  const contextLines: string[] = []
  if (resultat.data.entreprise) contextLines.push(`Entreprise : ${resultat.data.entreprise}`)
  if (resultat.data.taille) contextLines.push(`Taille : ${resultat.data.taille}`)
  if (resultat.data.secteur) contextLines.push(`Secteur : ${resultat.data.secteur}`)
  if (resultat.data.telephone) contextLines.push(`Téléphone : ${resultat.data.telephone}`)

  const messageComplet = contextLines.length > 0
    ? `${contextLines.join("\n")}\n\n---\n\n${resultat.data.message}`
    : resultat.data.message

  const supabase = await createClient()
  const { error } = await supabase.from("contacts").insert({
    nom: resultat.data.nom,
    email: resultat.data.email,
    message: messageComplet,
  })

  if (error) {
    console.error("[contact] Supabase insert error:", error)
    return { statut: "erreur", message: "Une erreur est survenue. Veuillez réessayer." }
  }

  return { statut: "succes" }
}
