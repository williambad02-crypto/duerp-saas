'use client'

import React, { useState } from 'react'
import { creerPoste } from '@/app/dashboard/postes/actions'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PosteForm } from './poste-form'

interface NouveauPosteModalProps {
  children: React.ReactElement
}

export function NouveauPosteModal({ children }: NouveauPosteModalProps) {
  const [ouvert, setOuvert] = useState(false)
  const router = useRouter()

  // Base UI ne supporte pas asChild — on clone le children pour lui injecter onClick
  const trigger = React.cloneElement(
    children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
    { onClick: () => setOuvert(true) }
  )

  return (
    <>
      {trigger}
      <Dialog open={ouvert} onOpenChange={setOuvert}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau poste de travail</DialogTitle>
          </DialogHeader>
          <PosteForm
            onSubmit={creerPoste}
            onSucces={() => {
              setOuvert(false)
              router.refresh()
            }}
            labelBouton="Créer le poste"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
