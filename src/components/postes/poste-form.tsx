'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { posteSchema, type PosteFormData } from '@/lib/validations/poste'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface PosteFormProps {
  valeurDefaut?: { nom: string; description?: string }
  onSubmit: (formData: FormData) => Promise<{ erreur?: string } | undefined>
  onSucces: () => void
  labelBouton?: string
}

export function PosteForm({ valeurDefaut, onSubmit, onSucces, labelBouton = 'Enregistrer' }: PosteFormProps) {
  const [erreurServeur, setErreurServeur] = useState<string | null>(null)
  const [chargement, setChargement] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PosteFormData>({
    resolver: zodResolver(posteSchema),
    defaultValues: valeurDefaut,
  })

  async function soumettre(donnees: PosteFormData) {
    setChargement(true)
    setErreurServeur(null)

    const formData = new FormData()
    formData.set('nom', donnees.nom)
    if (donnees.description) formData.set('description', donnees.description)

    const resultat = await onSubmit(formData)

    if (resultat?.erreur) {
      setErreurServeur(resultat.erreur)
      setChargement(false)
    } else {
      onSucces()
    }
  }

  return (
    <form onSubmit={handleSubmit(soumettre)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nom-poste">Nom du poste *</Label>
        <Input
          id="nom-poste"
          placeholder="ex : Soudeur, Cariste, Secrétaire..."
          {...register('nom')}
        />
        {errors.nom && (
          <p className="text-xs text-red-500">{errors.nom.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description-poste">
          Description{' '}
          <span className="text-gray-400 font-normal">(optionnel)</span>
        </Label>
        <Textarea
          id="description-poste"
          placeholder="Contexte du poste, conditions de travail..."
          rows={3}
          {...register('description')}
        />
      </div>

      {erreurServeur && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {erreurServeur}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={chargement}>
        {chargement ? 'Enregistrement...' : labelBouton}
      </Button>
    </form>
  )
}
