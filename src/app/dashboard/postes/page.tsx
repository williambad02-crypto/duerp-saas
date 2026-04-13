import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PosteCard } from '@/components/postes/poste-card'
import { NouveauPosteModal } from '@/components/postes/nouveau-poste-modal'
import { Button } from '@/components/ui/button'

export default async function PostesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: entreprise } = await supabase
    .from('entreprises')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!entreprise) redirect('/dashboard/onboarding')

  // Charger les postes avec le compte d'opérations
  const { data: postes } = await supabase
    .from('postes')
    .select(`
      id,
      nom,
      description,
      ordre,
      operations (
        id,
        evaluations (
          id,
          criticite_brute,
          plans_maitrise (
            criticite_residuelle
          )
        )
      )
    `)
    .eq('entreprise_id', entreprise.id)
    .order('ordre', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Postes de travail</h1>
          <p className="mt-1 text-sm text-gray-500">
            {postes?.length ?? 0} poste{(postes?.length ?? 0) > 1 ? 's' : ''} configuré{(postes?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        <NouveauPosteModal>
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un poste
          </Button>
        </NouveauPosteModal>
      </div>

      {/* Liste des postes ou état vide */}
      {!postes || postes.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">Aucun poste de travail</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Commencez par créer vos postes de travail. Un poste regroupe les salariés exposés aux mêmes risques
            (ex&nbsp;: Soudeur, Cariste, Agent administratif).
          </p>
          <NouveauPosteModal>
            <Button>Créer mon premier poste</Button>
          </NouveauPosteModal>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {postes.map((poste) => (
            <PosteCard
              key={poste.id}
              poste={{
                id: poste.id,
                nom: poste.nom,
                description: poste.description ?? undefined,
                nbOperations: poste.operations?.length ?? 0,
                nbEvaluations: poste.operations?.flatMap((o) => o.evaluations ?? []).length ?? 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
