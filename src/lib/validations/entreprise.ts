import { z } from 'zod'

export const entrepriseSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  secteur_activite: z.string().min(1, 'Sélectionnez un secteur'),
  effectif: z
    .number()
    .int()
    .min(1, "L'effectif doit être au moins 1")
    .max(9999, "L'effectif ne peut pas dépasser 9999"),
  siret: z
    .string()
    .regex(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres')
    .optional()
    .or(z.literal('')),
  adresse: z.string().max(200).optional().or(z.literal('')),
})

export type EntrepriseFormData = z.infer<typeof entrepriseSchema>
