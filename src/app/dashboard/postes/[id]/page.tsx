import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { NouvelleOperationModal } from '@/components/postes/nouvelle-operation-modal'
import { OperationItem } from '@/components/postes/operation-item'
import { EditerPosteModal } from '@/components/postes/editer-poste-modal'
import { SupprimerPosteButton } from '@/components/postes/supprimer-poste-button'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PosteDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Vérifier que l'entreprise existe
  const { data: entreprise } = await supabase
    .from('entreprises')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!entreprise) redirect('/dashboard/onboarding')

  // Charger le poste avec ses opérations
  const { data: poste } = await supabase
    .from('postes')
    .select(`
      id,
      nom,
      description,
      operations (
        id,
        nom,
        description,
        est_transversale,
        ordre,
        evaluations (id)
      )
    `)
    .eq('id', id)
    .eq('entreprise_id', entreprise.id)
    .single()

  if (!poste) notFound()

  const aOperationTransversale = poste.operations?.some((o) => o.est_transversale) ?? false
  const operations = [...(poste.operations ?? [])].sort((a, b) => {
    // "Toutes opérations" toujours en dernier
    if (a.est_transversale) return 1
    if (b.est_transversale) return -1
    return a.ordre - b.ordre
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard/postes" className="hover:text-gray-700">
          Postes de travail
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{poste.nom}</span>
      </nav>

      {/* En-tête du poste */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{poste.nom}</h1>
            {poste.description && (
              <p className="mt-1 text-sm text-gray-500">{poste.description}</p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              {operations.length} opération{operations.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <EditerPosteModal poste={{ id: poste.id, nom: poste.nom, description: poste.description ?? '' }} />
            <SupprimerPosteButton posteId={poste.id} nomPoste={poste.nom} />
          </div>
        </div>
      </div>

      {/* Section opérations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-gray-900">Opérations</h2>
          <div className="flex items-center gap-2">
            {/* Bouton "Toutes opérations" — désactivé si déjà créée */}
            <NouvelleOperationModal
              posteId={poste.id}
              estTransversale
              desactive={aOperationTransversale}
            >
              <Button
                variant="outline"
                size="sm"
                disabled={aOperationTransversale}
                className="text-purple-700 border-purple-200 hover:bg-purple-50 disabled:opacity-40"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Toutes opérations
              </Button>
            </NouvelleOperationModal>

            <NouvelleOperationModal posteId={poste.id}>
              <Button size="sm">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter une opération
              </Button>
            </NouvelleOperationModal>
          </div>
        </div>

        {operations.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
            <p className="text-sm font-medium text-gray-700 mb-1">Aucune opération</p>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Décomposez ce poste en opérations. Une opération est une tâche distincte
              (ex&nbsp;: soudage à l&apos;arc, meulage, déplacement de pièces).
              Pour les risques qui touchent tout le poste (bruit ambiant, stress...),
              utilisez &laquo;&nbsp;Toutes opérations&nbsp;&raquo;.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {operations.map((operation) => (
              <OperationItem
                key={operation.id}
                operation={{
                  id: operation.id,
                  nom: operation.nom,
                  description: operation.description ?? undefined,
                  est_transversale: operation.est_transversale,
                  nbEvaluations: operation.evaluations?.length ?? 0,
                }}
                posteId={poste.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
