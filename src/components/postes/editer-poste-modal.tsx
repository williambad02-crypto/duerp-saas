'use client'

import { useState } from 'react'
import { modifierPoste } from '@/app/dashboard/postes/actions'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PosteForm } from './poste-form'

interface EditerPosteModalProps {
  poste: { id: string; nom: string; description?: string }
  /** Mode contrôlé : si fourni, la modale est gérée par le parent. */
  open?: boolean
  /** Callback de changement d'état (mode contrôlé). */
  onOpenChange?: (open: boolean) => void
  /** Si true, ne rend pas le bouton trigger interne. */
  hideTrigger?: boolean
}

export function EditerPosteModal({ poste, open, onOpenChange, hideTrigger }: EditerPosteModalProps) {
  const [ouvertInterne, setOuvertInterne] = useState(false)
  const router = useRouter()

  // Mode contrôlé si `open` est fourni, sinon fallback state local
  const estControle = open !== undefined
  const ouvert = estControle ? open : ouvertInterne
  const setOuvert = (v: boolean) => {
    if (estControle) onOpenChange?.(v)
    else setOuvertInterne(v)
  }

  return (
    <>
      {!hideTrigger && (
        <Button variant="outline" size="sm" onClick={() => setOuvert(true)}>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Modifier
        </Button>
      )}

      <Dialog open={ouvert} onOpenChange={setOuvert}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le poste</DialogTitle>
          </DialogHeader>
          <PosteForm
            valeurDefaut={{ nom: poste.nom, description: poste.description ?? '' }}
            onSubmit={(formData) => modifierPoste(poste.id, formData)}
            onSucces={() => {
              setOuvert(false)
              router.refresh()
            }}
            labelBouton="Enregistrer les modifications"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
