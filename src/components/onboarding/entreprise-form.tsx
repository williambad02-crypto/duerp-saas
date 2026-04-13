'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { creerEntreprise } from '@/app/dashboard/onboarding/actions'
import { entrepriseSchema, type EntrepriseFormData } from '@/lib/validations/entreprise'
import { SECTEURS_ACTIVITE } from '@/lib/constants/secteurs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function EntrepriseForm() {
  const [erreurServeur, setErreurServeur] = useState<string | null>(null)
  const [chargement, setChargement] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EntrepriseFormData>({
    resolver: zodResolver(entrepriseSchema),
  })

  async function onSubmit(donnees: EntrepriseFormData) {
    setChargement(true)
    setErreurServeur(null)

    const formData = new FormData()
    formData.set('nom', donnees.nom)
    formData.set('secteur_activite', donnees.secteur_activite)
    formData.set('effectif', String(donnees.effectif))
    if (donnees.siret) formData.set('siret', donnees.siret)
    if (donnees.adresse) formData.set('adresse', donnees.adresse)

    const resultat = await creerEntreprise(formData)

    if (resultat?.erreur) {
      setErreurServeur(resultat.erreur)
      setChargement(false)
    }
    // Si succès → redirect géré côté serveur
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Nom de l'entreprise */}
      <div className="space-y-1.5">
        <Label htmlFor="nom">Nom de l&apos;entreprise *</Label>
        <Input
          id="nom"
          placeholder="Mon Entreprise SARL"
          {...register('nom')}
        />
        {errors.nom && (
          <p className="text-xs text-red-500">{errors.nom.message}</p>
        )}
      </div>

      {/* Secteur d'activité */}
      <div className="space-y-1.5">
        <Label htmlFor="secteur">Secteur d&apos;activité *</Label>
        <Select onValueChange={(val) => setValue('secteur_activite', val as string)}>
          <SelectTrigger id="secteur">
            <SelectValue placeholder="Sélectionnez un secteur" />
          </SelectTrigger>
          <SelectContent>
            {SECTEURS_ACTIVITE.map((secteur) => (
              <SelectItem key={secteur.valeur} value={secteur.valeur}>
                {secteur.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.secteur_activite && (
          <p className="text-xs text-red-500">{errors.secteur_activite.message}</p>
        )}
      </div>

      {/* Effectif */}
      <div className="space-y-1.5">
        <Label htmlFor="effectif">Effectif (nombre de salariés) *</Label>
        <Input
          id="effectif"
          type="number"
          min={1}
          max={9999}
          placeholder="ex : 12"
          {...register('effectif', { valueAsNumber: true })}
        />
        {errors.effectif && (
          <p className="text-xs text-red-500">{errors.effectif.message}</p>
        )}
      </div>

      {/* SIRET (optionnel) */}
      <div className="space-y-1.5">
        <Label htmlFor="siret">
          SIRET{' '}
          <span className="text-gray-400 font-normal">(optionnel — 14 chiffres)</span>
        </Label>
        <Input
          id="siret"
          placeholder="12345678901234"
          maxLength={14}
          {...register('siret')}
        />
        {errors.siret && (
          <p className="text-xs text-red-500">{errors.siret.message}</p>
        )}
      </div>

      {/* Adresse (optionnel) */}
      <div className="space-y-1.5">
        <Label htmlFor="adresse">
          Adresse du site évalué{' '}
          <span className="text-gray-400 font-normal">(optionnel)</span>
        </Label>
        <Input
          id="adresse"
          placeholder="12 rue de la Paix, 75001 Paris"
          {...register('adresse')}
        />
      </div>

      {erreurServeur && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {erreurServeur}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={chargement}>
        {chargement ? 'Enregistrement...' : 'Configurer mon entreprise →'}
      </Button>
    </form>
  )
}
