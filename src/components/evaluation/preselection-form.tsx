'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { sauvegarderPreselection } from '@/app/dashboard/postes/[id]/operations/[opId]/risques/actions'
import { CodeModule } from '@/types'
import { QuestionPreselection } from '@/lib/constants/preselection'

interface PreselectFormProps {
  operationId: string
  posteId: string
  codeModule: CodeModule
  nomModule: string
  questions: QuestionPreselection[]
}

export function PreselectForm({
  operationId,
  posteId,
  codeModule,
  nomModule,
  questions,
}: PreselectFormProps) {
  const [reponses, setReponses] = useState<Record<1 | 2 | 3, boolean | null>>({
    1: null,
    2: null,
    3: null,
  })
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const router = useRouter()

  const toutesRepondues = reponses[1] !== null && reponses[2] !== null && reponses[3] !== null

  async function handleSubmit() {
    if (!toutesRepondues) return
    setChargement(true)
    setErreur(null)

    const resultat = await sauvegarderPreselection(operationId, posteId, codeModule, {
      q1: reponses[1] as boolean,
      q2: reponses[2] as boolean,
      q3: reponses[3] as boolean,
    })

    if ('erreur' in resultat) {
      setErreur(String(resultat.erreur))
      setChargement(false)
      return
    }

    // Rafraîchit la page server-component pour afficher le bon état
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Explication */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">Questions de présélection — {nomModule}</p>
            <p className="text-sm text-blue-700 mt-1">
              Répondez honnêtement. Si aucune réponse n&apos;est OUI, le risque est non significatif
              pour cette opération et la criticité sera automatiquement fixée à 1.
            </p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question) => {
          const reponse = reponses[question.id]
          return (
            <div
              key={question.id}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
              <p className="text-sm font-medium text-gray-900 mb-3">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-xs font-bold text-gray-600 mr-2">
                  {question.id}
                </span>
                {question.texte}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setReponses((r) => ({ ...r, [question.id]: true }))
                  }
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                    reponse === true
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {reponse === true && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  OUI
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setReponses((r) => ({ ...r, [question.id]: false }))
                  }
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                    reponse === false
                      ? 'border-gray-500 bg-gray-100 text-gray-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {reponse === false && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  NON
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {erreur && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          {erreur}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-gray-400">
          {[reponses[1], reponses[2], reponses[3]].filter((r) => r !== null).length}/3 question
          {[reponses[1], reponses[2], reponses[3]].filter((r) => r !== null).length !== 1 ? 's' : ''}{' '}
          répondue{[reponses[1], reponses[2], reponses[3]].filter((r) => r !== null).length !== 1 ? 's' : ''}
        </p>
        <Button
          onClick={handleSubmit}
          disabled={!toutesRepondues || chargement}
        >
          {chargement ? 'Enregistrement...' : 'Valider la présélection'}
        </Button>
      </div>
    </div>
  )
}
