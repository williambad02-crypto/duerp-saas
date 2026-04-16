'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { creerPoste } from '@/app/dashboard/postes/actions'
import { posteSchema, type PosteFormData } from '@/lib/validations/poste'
import { TEMPLATES_METIER } from '@/lib/constants/templates-metier'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'

interface NouveauPosteModalProps {
  children: React.ReactElement
}

type Etape = 'infos' | 'template'

export function NouveauPosteModal({ children }: NouveauPosteModalProps) {
  const [ouvert, setOuvert] = useState(false)
  const [etape, setEtape] = useState<Etape>('infos')
  // null = "Partir de zéro"  |  string = code d'un template
  const [templateChoisi, setTemplateChoisi] = useState<string | null>(null)
  const [chargement, setChargement] = useState(false)
  const [erreurServeur, setErreurServeur] = useState<string | null>(null)

  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid },
    trigger: validerChamps,
  } = useForm<PosteFormData>({
    resolver: zodResolver(posteSchema),
    mode: 'onChange',
  })

  // Base UI ne supporte pas asChild — on clone le children pour lui injecter onClick
  const trigger = React.cloneElement(
    children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
    { onClick: () => setOuvert(true) }
  )

  function resetEtats() {
    setEtape('infos')
    setTemplateChoisi(null)
    setErreurServeur(null)
    setChargement(false)
    reset()
  }

  function onOpenChange(next: boolean) {
    setOuvert(next)
    if (!next) {
      // Reset à la fermeture pour repartir propre la prochaine ouverture
      resetEtats()
    }
  }

  async function allerEtapeTemplate() {
    // Valide les champs de l'étape 1 avant de passer à la suivante
    const ok = await validerChamps()
    if (!ok) return
    setEtape('template')
  }

  async function creer() {
    const donnees = getValues()
    setChargement(true)
    setErreurServeur(null)

    const formData = new FormData()
    formData.set('nom', donnees.nom)
    if (donnees.description) formData.set('description', donnees.description)
    if (templateChoisi) formData.set('templateCode', templateChoisi)

    const resultat = await creerPoste(formData)

    if (resultat?.erreur) {
      setErreurServeur(resultat.erreur)
      setChargement(false)
      return
    }

    // Succès : on ferme et on refresh
    setOuvert(false)
    resetEtats()
    router.refresh()
  }

  return (
    <>
      {trigger}
      <Dialog open={ouvert} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {etape === 'infos' ? 'Nouveau poste de travail' : 'Choisir un modèle'}
            </DialogTitle>
          </DialogHeader>

          {etape === 'infos' && (
            <form
              onSubmit={handleSubmit(allerEtapeTemplate)}
              className="space-y-4"
            >
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

              <Button type="submit" className="w-full" disabled={!isValid}>
                Suivant
              </Button>
            </form>
          )}

          {etape === 'template' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Commencez avec un modèle pré-rempli ou partez de zéro. Les
                risques pré-remplis seront à valider / ajuster selon votre
                contexte réel.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Carte "Partir de zéro" */}
                <button
                  type="button"
                  onClick={() => setTemplateChoisi(null)}
                  className={`p-4 border-2 rounded-xl text-left transition-colors ${
                    templateChoisi === null
                      ? 'border-brand-navy bg-brand-navy/5'
                      : 'border-gray-200 hover:border-brand-navy/40'
                  }`}
                >
                  <div className="text-2xl mb-2" aria-hidden>📋</div>
                  <div className="text-sm font-semibold text-brand-navy">
                    Partir de zéro
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Aucun risque pré-rempli
                  </div>
                </button>

                {/* Cartes templates métier */}
                {TEMPLATES_METIER.map((t) => (
                  <button
                    key={t.code}
                    type="button"
                    onClick={() => setTemplateChoisi(t.code)}
                    className={`p-4 border-2 rounded-xl text-left transition-colors ${
                      templateChoisi === t.code
                        ? 'border-brand-navy bg-brand-navy/5'
                        : 'border-gray-200 hover:border-brand-navy/40'
                    }`}
                  >
                    <div className="text-2xl mb-2" aria-hidden>
                      {t.icone}
                    </div>
                    <div className="text-sm font-semibold text-brand-navy">
                      {t.nom}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {t.risques.length} risques pré-remplis
                    </div>
                  </button>
                ))}
              </div>

              {erreurServeur && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {erreurServeur}
                </p>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEtape('infos')}
                  disabled={chargement}
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Retour
                </Button>
                <Button
                  type="button"
                  onClick={creer}
                  disabled={chargement}
                >
                  {chargement ? 'Création...' : 'Créer le poste'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
