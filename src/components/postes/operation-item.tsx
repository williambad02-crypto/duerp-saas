'use client'

import { useState } from 'react'
import { modifierOperation, supprimerOperation } from '@/app/dashboard/postes/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { OperationForm } from './operation-form'

interface OperationItemProps {
  operation: {
    id: string
    nom: string
    description?: string
    est_transversale: boolean
    nbEvaluations: number
  }
  posteId: string
}

export function OperationItem({ operation, posteId }: OperationItemProps) {
  const [editOuvert, setEditOuvert] = useState(false)
  const [suppressionOuverte, setSuppressionOuverte] = useState(false)
  const [suppressionChargement, setSuppressionChargement] = useState(false)
  const router = useRouter()

  async function handleSupprimer() {
    setSuppressionChargement(true)
    await supprimerOperation(operation.id, posteId)
    router.refresh()
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-4 bg-white ${
        operation.est_transversale
          ? 'border-purple-200 bg-purple-50/30'
          : 'border-gray-200'
      }`}
    >
      {/* Icône */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          operation.est_transversale ? 'bg-purple-100' : 'bg-gray-100'
        }`}
      >
        {operation.est_transversale ? (
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-900">{operation.nom}</span>
          {operation.est_transversale && (
            <Badge variant="secondary" className="text-purple-700 bg-purple-100 border-0 text-xs">
              Transversale
            </Badge>
          )}
        </div>
        {operation.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{operation.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">
          {operation.nbEvaluations} module{operation.nbEvaluations !== 1 ? 's' : ''} évalué{operation.nbEvaluations !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Bouton Évaluer */}
        <Link
          href={`/dashboard/postes/${posteId}/operations/${operation.id}/risques`}
          className={buttonVariants({ variant: 'outline', size: 'sm', className: 'text-blue-600 border-blue-200 hover:bg-blue-50' })}
        >
          Évaluer
        </Link>

        {/* Modifier — pas disponible pour "Toutes opérations" */}
        {!operation.est_transversale && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setEditOuvert(true)}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="sr-only">Modifier</span>
            </Button>

            <Dialog open={editOuvert} onOpenChange={setEditOuvert}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Modifier l&apos;opération</DialogTitle>
                </DialogHeader>
                <OperationForm
                  valeurDefaut={{ nom: operation.nom, description: operation.description }}
                  onSubmit={(formData) => modifierOperation(operation.id, posteId, formData)}
                  onSucces={() => {
                    setEditOuvert(false)
                    router.refresh()
                  }}
                  labelBouton="Enregistrer les modifications"
                />
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Supprimer */}
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
          onClick={() => setSuppressionOuverte(true)}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="sr-only">Supprimer</span>
        </Button>

        <AlertDialog open={suppressionOuverte} onOpenChange={setSuppressionOuverte}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer &laquo;&nbsp;{operation.nom}&nbsp;&raquo;&nbsp;?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette opération et toutes ses évaluations seront définitivement supprimées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSupprimer}
                disabled={suppressionChargement}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {suppressionChargement ? 'Suppression...' : 'Supprimer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
