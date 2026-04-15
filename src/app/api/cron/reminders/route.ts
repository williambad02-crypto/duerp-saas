import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { envoyerRappel, type TypeRappel } from '@/lib/email/reminders'

export async function GET(req: NextRequest) {
  // Sécurisation par header secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const j7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const todayDay = new Date().getDate()

  // Charger toutes les actions non terminées avec contact + évaluation + poste
  const { data: actions } = await supabase
    .from('actions_plan')
    .select(`
      id,
      description,
      echeance,
      statut,
      rappels_actifs,
      coefficient_pm_cible,
      evaluations!inner (
        danger,
        criticite_brute,
        operations!inner (
          nom,
          postes!inner (
            nom
          )
        )
      ),
      contacts_entreprise:contact_id (
        prenom,
        email,
        rappels_actifs
      )
    `)
    .neq('statut', 'termine')
    .not('contact_id', 'is', null)
    .not('echeance', 'is', null)

  if (!actions) return NextResponse.json({ sent: 0, skipped: 0 })

  let sent = 0
  let skipped = 0

  for (const action of actions as any[]) {
    const contact = action.contacts_entreprise
    if (!contact || !contact.email) { skipped++; continue }

    // Double vérification des toggles
    if (!action.rappels_actifs || !contact.rappels_actifs) { skipped++; continue }

    const echeance = action.echeance // YYYY-MM-DD
    const evaluation = action.evaluations
    const poste = evaluation?.operations?.postes?.nom ?? ''
    const operation = evaluation?.operations?.nom ?? ''

    let type: TypeRappel | null = null
    if (echeance === j7) type = 'j_moins_7'
    else if (echeance === today) type = 'jour_j'
    else if (echeance < today && todayDay === 1) type = 'mensuel'

    if (!type) { skipped++; continue }

    try {
      await envoyerRappel({
        destinataire: { prenom: contact.prenom, email: contact.email },
        action: {
          description: action.description ?? 'Action préventive',
          danger: evaluation?.danger ?? '',
          poste,
          operation,
          echeance,
          criticite: evaluation?.criticite_brute ?? 0,
        },
        type,
      })
      sent++
    } catch (err) {
      console.error(`Erreur envoi email pour action ${action.id}:`, err)
      skipped++
    }
  }

  return NextResponse.json({ sent, skipped, date: today })
}
