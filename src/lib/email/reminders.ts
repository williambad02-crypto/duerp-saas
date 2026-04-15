// src/lib/email/reminders.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export type TypeRappel = 'j_moins_7' | 'jour_j' | 'mensuel'

interface ParamsRappel {
  destinataire: { prenom: string; email: string }
  action: {
    description: string
    danger: string
    poste: string
    operation: string
    echeance: string
    criticite: number
  }
  type: TypeRappel
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function sujetEmail(type: TypeRappel, description: string): string {
  if (type === 'j_moins_7') return `SafeAnalyse. — Action dans 7 jours : ${description.slice(0, 50)}`
  if (type === 'jour_j') return `SafeAnalyse. — Échéance aujourd'hui : ${description.slice(0, 50)}`
  return `SafeAnalyse. — Rappel mensuel : ${description.slice(0, 50)}`
}

function corps(p: ParamsRappel): string {
  const { destinataire, action, type } = p
  const delaiMsg =
    type === 'j_moins_7' ? "dans <strong>7 jours</strong>" :
    type === 'jour_j' ? "<strong>aujourd'hui</strong>" :
    "dépassée — rappel mensuel"

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #374151;">
      <div style="background: #031948; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <div style="color: #f5eee1; font-size: 18px; font-weight: 700;">SafeAnalyse.</div>
      </div>
      <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="margin: 0 0 16px; font-size: 15px;">Bonjour <strong>${destinataire.prenom}</strong>,</p>
        <p style="margin: 0 0 16px; font-size: 14px; color: #374151;">
          L'action préventive ci-dessous arrive à échéance ${delaiMsg} :
        </p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
          <div style="font-weight: 600; color: #031948; margin-bottom: 8px; font-size: 14px;">"${action.description}"</div>
          <div style="font-size: 12px; color: #64748b; line-height: 1.8;">
            <div>📍 Poste : ${action.poste} — ${action.operation}</div>
            <div>⚠️ Danger : ${action.danger} — Criticité : ${action.criticite}</div>
            <div>📅 Échéance : ${formatDate(action.echeance)}</div>
          </div>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://duerp-saas.vercel.app'}/dashboard/plan-action"
           style="display: inline-block; background: #031948; color: #f5eee1; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">
          Voir le plan d'action →
        </a>
        <p style="margin: 20px 0 0; font-size: 11px; color: #94a3b8;">
          Vous recevez cet email car vous êtes responsable de cette action dans SafeAnalyse.
        </p>
      </div>
    </div>
  `
}

export async function envoyerRappel(params: ParamsRappel): Promise<void> {
  await resend.emails.send({
    from: 'SafeAnalyse. <onboarding@resend.dev>',
    to: params.destinataire.email,
    subject: sujetEmail(params.type, params.action.description),
    html: corps(params),
  })
}
