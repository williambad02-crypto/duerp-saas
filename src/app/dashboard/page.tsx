import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MODULE_PAR_CODE } from '@/lib/constants/modules'
import { CodeModule } from '@/types'
import { GenererPDFButton } from '@/components/dashboard/generer-pdf-button'

function getCouleurScore(score: number, module: CodeModule): 'vert' | 'jaune' | 'orange' | 'rouge' {
  if (module === 'M01_BRUIT') {
    if (score <= 2) return 'vert'
    if (score <= 4) return 'jaune'
    if (score <= 8) return 'orange'
    return 'rouge'
  }
  if (score <= 4) return 'vert'
  if (score <= 9) return 'jaune'
  if (score <= 14) return 'orange'
  return 'rouge'
}

const COULEURS_BG = {
  vert: 'bg-green-100 text-green-800 border-green-200',
  jaune: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  rouge: 'bg-red-100 text-red-800 border-red-200',
}

const COULEURS_DOT = {
  vert: 'bg-green-500',
  jaune: 'bg-yellow-500',
  orange: 'bg-orange-500',
  rouge: 'bg-red-500',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: entreprise } = await supabase
    .from('entreprises')
    .select('id, nom, effectif')
    .eq('user_id', user.id)
    .single()

  if (!entreprise) redirect('/dashboard/onboarding')

  // Charger toutes les données en parallèle
  const [
    { data: postes },
    { data: operations },
    { data: evaluations },
    { data: versions },
  ] = await Promise.all([
    supabase.from('postes').select('id').eq('entreprise_id', entreprise.id),
    supabase
      .from('operations')
      .select('id, postes!inner(entreprise_id)')
      .eq('postes.entreprise_id', entreprise.id as string),
    supabase
      .from('evaluations')
      .select(`
        id, code_module, criticite_brute, statut,
        donnees_module,
        operations!inner(
          id, nom,
          postes!inner(id, nom)
        ),
        plans_maitrise(criticite_residuelle, coefficient_pm)
      `)
      .neq('statut', 'brouillon'),
    supabase
      .from('versions_duerp')
      .select('id, numero_version, date_generation')
      .eq('entreprise_id', entreprise.id)
      .order('date_generation', { ascending: false })
      .limit(5),
  ])

  const nbPostes = postes?.length ?? 0
  const nbOperations = operations?.length ?? 0

  // Évaluations terminées uniquement (ignorer brouillons)
  const evalsTerminees = (evaluations ?? []).filter((e) => e.statut === 'termine')
  const nbEvaluations = evalsTerminees.length

  // Répartition par zone de criticité
  const repartition = { vert: 0, jaune: 0, orange: 0, rouge: 0 }
  const top5: Array<{
    id: string
    posteNom: string
    operationNom: string
    operationId: string
    posteId: string
    nomModule: string
    codeModule: CodeModule
    scoreResid: number
    couleur: 'vert' | 'jaune' | 'orange' | 'rouge'
  }> = []

  for (const ev of evalsTerminees) {
    const donnees = ev.donnees_module as Record<string, unknown> | null
    if (donnees?.module_ignore) continue

    const pmArr = ev.plans_maitrise as unknown as Array<{
      criticite_residuelle: number | null
      coefficient_pm: number
    }>
    const pm = pmArr?.[0] ?? null
    const score = pm?.criticite_residuelle ?? ev.criticite_brute
    if (score == null) continue

    const couleur = getCouleurScore(score, ev.code_module as CodeModule)
    repartition[couleur]++

    const op = ev.operations as unknown as {
      id: string
      nom: string
      postes: { id: string; nom: string }
    }
    top5.push({
      id: ev.id,
      posteNom: op?.postes?.nom ?? '—',
      operationNom: op?.nom ?? '—',
      operationId: op?.id ?? '',
      posteId: op?.postes?.id ?? '',
      nomModule: MODULE_PAR_CODE[ev.code_module as CodeModule]?.nom ?? ev.code_module,
      codeModule: ev.code_module as CodeModule,
      scoreResid: score,
      couleur,
    })
  }

  // Trier et garder les 5 plus critiques
  top5.sort((a, b) => b.scoreResid - a.scoreResid)
  const top5Risques = top5.slice(0, 5)

  // Dernière mise à jour DUERP (dernière évaluation)
  const { data: derniereEval } = await supabase
    .from('evaluations')
    .select('updated_at')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  const dateMAJ = derniereEval?.updated_at
    ? new Date(derniereEval.updated_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500">
          DUERP — {entreprise.nom}
          {dateMAJ && (
            <span className="ml-2 text-xs text-gray-400">Dernière activité : {dateMAJ}</span>
          )}
        </p>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Postes de travail</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{nbPostes}</p>
            <Link href="/dashboard/postes" className="mt-1 text-xs text-blue-600 hover:underline">
              Gérer les postes →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Opérations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{nbOperations}</p>
            <p className="mt-1 text-xs text-gray-400">sur {nbPostes} poste{nbPostes !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Évaluations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{nbEvaluations}</p>
            <Link href="/dashboard/apr" className="mt-1 text-xs text-blue-600 hover:underline">
              Voir le tableau APR →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Répartition des risques */}
      {nbEvaluations > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              Répartition des risques évalués
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {(
                [
                  { couleur: 'rouge', label: 'Critique' },
                  { couleur: 'orange', label: 'Élevé' },
                  { couleur: 'jaune', label: 'Modéré' },
                  { couleur: 'vert', label: 'Faible' },
                ] as const
              ).map(({ couleur, label }) => (
                <div
                  key={couleur}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 ${COULEURS_BG[couleur]}`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${COULEURS_DOT[couleur]}`} />
                  <span className="text-sm font-bold">{repartition[couleur]}</span>
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>

            {/* Barre proportionnelle */}
            {nbEvaluations > 0 && (
              <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-gray-100">
                {(['rouge', 'orange', 'jaune', 'vert'] as const).map((c) => {
                  const pct = (repartition[c] / nbEvaluations) * 100
                  if (pct === 0) return null
                  return (
                    <div
                      key={c}
                      className={`${COULEURS_DOT[c]} transition-all`}
                      style={{ width: `${pct}%` }}
                      title={`${c}: ${repartition[c]}`}
                    />
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Top 5 risques critiques */}
      {top5Risques.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900">
                Risques prioritaires
              </CardTitle>
              <Link href="/dashboard/apr" className="text-xs text-blue-600 hover:underline">
                Voir tout →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {top5Risques.map((risque) => (
                <Link
                  key={risque.id}
                  href={`/dashboard/postes/${risque.posteId}/operations/${risque.operationId}/risques/${risque.codeModule}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  {/* Score */}
                  <span
                    className={`inline-flex items-center justify-center w-9 h-7 rounded-full text-xs font-bold shrink-0 ${COULEURS_BG[risque.couleur]}`}
                  >
                    {risque.scoreResid}
                  </span>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {risque.posteNom} — {risque.operationNom}
                    </p>
                    <p className="text-xs text-gray-500">{risque.nomModule}</p>
                  </div>

                  {/* Indicateur criticité */}
                  <span
                    className={`text-xs font-medium capitalize shrink-0 ${
                      risque.couleur === 'rouge'
                        ? 'text-red-600'
                        : risque.couleur === 'orange'
                        ? 'text-orange-600'
                        : risque.couleur === 'jaune'
                        ? 'text-yellow-700'
                        : 'text-green-700'
                    }`}
                  >
                    {risque.couleur === 'rouge'
                      ? 'Critique'
                      : risque.couleur === 'orange'
                      ? 'Élevé'
                      : risque.couleur === 'jaune'
                      ? 'Modéré'
                      : 'Faible'}
                  </span>

                  <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA si démarrage */}
      {nbPostes === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <div className="text-blue-500 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Pour commencer votre DUERP</p>
                <p className="text-sm text-blue-700 mt-1">
                  Créez vos premiers postes de travail, puis décomposez-les en opérations
                  pour démarrer l&apos;évaluation des risques module par module.
                </p>
                <Link
                  href="/dashboard/postes"
                  className="inline-block mt-3 text-sm font-medium text-blue-600 hover:text-blue-500 underline"
                >
                  Créer un poste de travail →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export PDF du DUERP */}
      {nbEvaluations > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">
                  Document Unique (DUERP)
                </CardTitle>
                <p className="mt-0.5 text-xs text-gray-500">
                  Génère un PDF horodaté conforme à la loi du 2 août 2021 (conservation 40 ans).
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <GenererPDFButton />

            {/* Historique des versions */}
            {(versions?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Versions générées</p>
                <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-gray-50 text-sm">
                  {versions!.map((v) => (
                    <div key={v.id} className="flex items-center justify-between px-4 py-2">
                      <span className="font-medium text-gray-700">
                        Version {v.numero_version}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(v.date_generation).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progression si données existent */}
      {nbPostes > 0 && nbEvaluations === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <div className="text-amber-500 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900">Postes créés — évaluations à compléter</p>
                <p className="text-sm text-amber-700 mt-1">
                  Vous avez {nbPostes} poste{nbPostes !== 1 ? 's' : ''} et {nbOperations} opération{nbOperations !== 1 ? 's' : ''}.
                  Cliquez sur &laquo; Évaluer &raquo; pour commencer à coter les risques.
                </p>
                <Link
                  href="/dashboard/postes"
                  className="inline-block mt-3 text-sm font-medium text-amber-700 hover:text-amber-600 underline"
                >
                  Aller aux postes →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
