import { z } from 'zod'

export const operationSchema = z.object({
  nom: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long'),
  description: z.string().max(500).optional().or(z.literal('')),
  // Pas de .default() — on gère la valeur par défaut dans useForm
  est_transversale: z.boolean(),
})

export type OperationFormData = z.infer<typeof operationSchema>
