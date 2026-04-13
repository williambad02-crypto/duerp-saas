import { z } from 'zod'

export const posteSchema = z.object({
  nom: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long'),
  description: z.string().max(500).optional().or(z.literal('')),
})

export type PosteFormData = z.infer<typeof posteSchema>
