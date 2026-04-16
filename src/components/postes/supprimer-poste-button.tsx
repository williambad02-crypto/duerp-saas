'use client'

import { useState } from 'react'
import { supprimerPoste } from '@/app/dashboard/postes/actions'
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
import { Button } from '@/components/ui/button'

interface SupprimerPosteButtonProps {
  posteId: string
  nomPoste: string
  /** Mode contrôlé : si fourni, la modale est gérée par le parent. */
  open?: boolean
  /** Callback de changement d'état (mode contrôlé). */
  onOpenChange?: (open: boolean) => void
  /** Si true, ne rend pas le bouton trigger interne. */
  hideTrigger?: boolean
}

export function SupprimerPosteButton({ posteId, nomPoste, open, onOpenChange, hideTrigger }: SupprimerPosteButtonProps) {
  const [ouvertInterne, setOuvertInterne] = useState(false)
  const [chargement, setChargement] = useState(false)

  // Mode contrôlé si `open` est fourni, sinon fallback state local
  const estControle = open !== undefined
  const ouvert = estControle ? open : ouvertInterne
  const setOuvert = (v: boolean) => {
    if (estControle) onOpenChange?.(v)
    else setOuvertInterne(v)
  }

  async function handleSupprimer() {
    setChargement(true)
    await supprimerPoste(posteId)
  }

  return (
    <>
      {!hideTrigger && (
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => setOuvert(true)}
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Supprimer
        </Button>
      )}

      <AlertDialog open={ouvert} onOpenChange={setOuvert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer &laquo;&nbsp;{nomPoste}&nbsp;&raquo;&nbsp;?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera le poste et <strong>toutes ses opérations et évaluations associées</strong>.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSupprimer}
              disabled={chargement}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {chargement ? 'Suppression...' : 'Supprimer définitivement'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
