'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { operationSchema, type OperationFormData } from '@/lib/validations/operation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface OperationFormProps {
  estTransversale?: boolean
  valeurDefaut?: { nom: string; description?: string }
  onSubmit: (formData: FormData) => Promise<{ erreur?: string } | undefined>
  onSucces: () => void
  labelBouton?: string
}

export function OperationForm({
  estTransversale = false,
  valeurDefaut,
  onSubmit,
  onSucces,
  labelBouton = 'Enregistrer',
}: OperationFormProps) {
  const [erreurServeur, setErreurServeur] = useState<string | null>(null)
  const [chargement, setChargement] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      nom: estTransversale ? 'Toutes opérations' : (valeurDefaut?.nom ?? ''),
      description: valeurDefaut?.description ?? '',
      est_transversale: estTransversale,
    },
  })

  async function soumettre(donnees: OperationFormData) {
    setChargement(true)
    setErreurServeur(null)

    const formData = new FormData()
    formData.set('nom', donnees.nom)
    if (donnees.description) formData.set('description', donnees.description)
    formData.set('est_transversale', String(estTransversale))

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
      {estTransversale ? (
        <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
          <p className="text-sm font-medium text-purple-800">Toutes opérations</p>
          <p className="text-xs text-purple-600 mt-0.5">
            Regroupe les risques transversaux au poste (bruit ambiant, stress, température...).
          </p>
          {/* Champ caché pour valider le nom */}
          <input type="hidden" {...register('nom')} />
          <input type="hidden" {...register('est_transversale')} />
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="nom-operation">Nom de l&apos;opération *</Label>
          <Input
            id="nom-operation"
            placeholder="ex : Soudage à l'arc, Meulage, Conduite chariot..."
            {...register('nom')}
          />
          {errors.nom && (
            <p className="text-xs text-red-500">{errors.nom.message}</p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="description-operation">
          Description{' '}
          <span className="text-gray-400 font-normal">(optionnel)</span>
        </Label>
        <Textarea
          id="description-operation"
          placeholder="Précisions sur l'opération, équipements utilisés..."
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
