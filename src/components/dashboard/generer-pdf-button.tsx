'use client'

import { useState } from 'react'
import Link from 'next/link'

interface GenererPDFButtonProps {
  bloque?: boolean
}

export function GenererPDFButton({ bloque = false }: GenererPDFButtonProps) {
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  async function handleClick() {
    setEnCours(true)
    setErreur(null)

    try {
      const res = await fetch('/api/pdf/generer', { method: 'POST' })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setErreur(body.erreur ?? 'Erreur lors de la génération')
        return
      }

      // Extraire le nom du fichier depuis Content-Disposition
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const match = disposition.match(/filename="([^"]+)"/)
      const nomFichier = match?.[1] ?? 'DUERP.pdf'

      // Déclencher le téléchargement
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nomFichier
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setErreur('Impossible de contacter le serveur')
    } finally {
      setEnCours(false)
    }
  }

  if (bloque) {
    return (
      <div className="flex flex-col items-start gap-2">
        <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-400 cursor-not-allowed border border-gray-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Générer le DUERP (PDF)
        </div>
        <p className="text-xs text-gray-500">
          Disponible avec un abonnement actif.{' '}
          <Link href="/pricing" className="text-blue-600 hover:underline">
            Voir les offres →
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleClick}
        disabled={enCours}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {enCours ? (
          <>
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Génération en cours…
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            Générer le DUERP (PDF)
          </>
        )}
      </button>

      {erreur && (
        <p className="text-sm text-red-600">{erreur}</p>
      )}
    </div>
  )
}
