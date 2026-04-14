import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { APRTable } from '@/components/apr/apr-table'
import { MODULE_PAR_CODE } from '@/lib/constants/modules'
import { CodeModule } from '@/types'

export const metadata = { title: 'Tableau APR — DUERP' }

// Type de ligne APR normalisée
export interface LigneAPR {
  id: string
  posteId: string
  posteNom: string
  operationId: string
  operationNom: string
  estTransversale: boolean
  codeModule: CodeModule
  nomModule: string
  criticiteBrute: number | null
  coefficientPm: number | null
  criticiteResiduelle: number | null
  mesuresT: number // nb de mesures techniques
  mesuresO: number
  mesuresH: number
  mesuresEPI: number
  moduleIgnore: boolean
  statut: string
}

function parseMesures(raw: string | null): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default async function APRPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: entreprise } = await supabase
    .from('entreprises')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!entreprise) redirect('/dashboard/onboarding')

  // Charger toutes les évaluations avec leurs contextes
  const { data: evaluations } = await supabase
    .from('evaluations')
    .select(`
      id,
      code_module,
      statut,
      criticite_brute,
      donnees_module,
      operations!inner(
        id,
        nom,
        est_transversale,
        postes!inner(id, nom)
      ),
      plans_maitrise(
        coefficient_pm,
        criticite_residuelle,
        mesures_techniques,
        mesures_humaines,
        mesures_organisationnelles,
        mesures_epi
      )
    `)

  // Charger liste des postes distincts pour les filtres
  const { data: postes } = await supabase
    .from('postes')
    .select('id, nom')
    .eq('entreprise_id', entreprise.id)
    .order('ordre')

  // Normaliser les données
  const lignes: LigneAPR[] = (evaluations ?? []).map((ev) => {
    const op = ev.operations as unknown as {
      id: string
      nom: string
      est_transversale: boolean
      postes: { id: string; nom: string }
    }
    const pmArr = ev.plans_maitrise as unknown as Array<{
      coefficient_pm: number
      criticite_residuelle: number | null
      mesures_techniques: string | null
      mesures_humaines: string | null
      mesures_organisationnelles: string | null
      mesures_epi: string | null
    }>
    const pm = pmArr?.[0] ?? null

    const donnees = ev.donnees_module as Record<string, unknown> | null
    const moduleIgnore = donnees?.module_ignore === true

    const moduleInfo = MODULE_PAR_CODE[ev.code_module as CodeModule]

    return {
      id: ev.id,
      posteId: op?.postes?.id ?? '',
      posteNom: op?.postes?.nom ?? '—',
      operationId: op?.id ?? '',
      operationNom: op?.nom ?? '—',
      estTransversale: op?.est_transversale ?? false,
      codeModule: ev.code_module as CodeModule,
      nomModule: moduleInfo?.nom ?? ev.code_module,
      criticiteBrute: ev.criticite_brute ?? null,
      coefficientPm: pm?.coefficient_pm ?? null,
      criticiteResiduelle: pm?.criticite_residuelle ?? null,
      mesuresT: parseMesures(pm?.mesures_techniques ?? null).length,
      mesuresO: parseMesures(pm?.mesures_organisationnelles ?? null).length,
      mesuresH: parseMesures(pm?.mesures_humaines ?? null).length,
      mesuresEPI: parseMesures(pm?.mesures_epi ?? null).length,
      moduleIgnore,
      statut: ev.statut,
    }
  })

  // Trier par criticité résiduelle décroissante par défaut
  lignes.sort((a, b) => {
    const ra = a.criticiteResiduelle ?? a.criticiteBrute ?? 0
    const rb = b.criticiteResiduelle ?? b.criticiteBrute ?? 0
    return rb - ra
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau APR</h1>
        <p className="mt-1 text-sm text-gray-500">
          Analyse Préliminaire des Risques — toutes les évaluations de votre entreprise
        </p>
      </div>

      <APRTable
        lignes={lignes}
        postes={postes ?? []}
      />
    </div>
  )
}
