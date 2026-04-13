'use client'

import React, { useState } from 'react'
import { creerOperation } from '@/app/dashboard/postes/actions'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { OperationForm } from './operation-form'

interface NouvelleOperationModalProps {
  posteId: string
  estTransversale?: boolean
  desactive?: boolean
  children: React.ReactElement
}

export function NouvelleOperationModal({
  posteId,
  estTransversale = false,
  desactive = false,
  children,
}: NouvelleOperationModalProps) {
  const [ouvert, setOuvert] = useState(false)
  const router = useRouter()

  // Si désactivé, on rend l'enfant tel quel (bouton disabled géré par le parent)
  const trigger = desactive
    ? children
    : React.cloneElement(
        children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
        { onClick: () => setOuvert(true) }
      )

  return (
    <>
      {trigger}
      {!desactive && (
        <Dialog open={ouvert} onOpenChange={setOuvert}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {estTransversale ? 'Ajouter "Toutes opérations"' : 'Nouvelle opération'}
              </DialogTitle>
            </DialogHeader>
            <OperationForm
              estTransversale={estTransversale}
              onSubmit={(formData) => creerOperation(posteId, formData)}
              onSucces={() => {
                setOuvert(false)
                router.refresh()
              }}
              labelBouton={estTransversale ? "Ajouter l'opération transversale" : "Créer l'opération"}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
