"use server"

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const schemaContact = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
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
  }

  const resultat = schemaContact.safeParse(brut)
  if (!resultat.success) {
    return { statut: "erreur", message: resultat.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("contacts").insert({
    nom: resultat.data.nom,
    email: resultat.data.email,
    message: resultat.data.message,
  })

  if (error) {
    console.error("[contact] Supabase insert error:", error)
    return { statut: "erreur", message: "Une erreur est survenue. Veuillez réessayer." }
  }

  return { statut: "succes" }
}
