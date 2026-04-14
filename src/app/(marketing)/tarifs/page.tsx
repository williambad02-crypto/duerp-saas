import Link from 'next/link'
import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll'

export const metadata = {
  title: "Tarifs — SafeAnalyse.",
  description: "Un seul plan tout inclus à 39 €/mois ou 390 €/an. 14 jours d'essai gratuit. Comparez SafeAnalyse. avec un cabinet HSE, les outils gratuits et les templates.",
}

const fonctionnalites = [
  "Postes et opérations illimités",
  "Tous les modules de risques actifs",
  "Grilles de cotation normées (INRS)",
  "Tableau APR de synthèse",
  "Plan de maîtrise intégré",
  "Export PDF DUERP conforme",
  "Versioning sur 40 ans",
  "Interface tablette optimisée",
  "Support par email",
  "Mises à jour incluses",
]

const comparatif = [
  {
    critere: "Prix annuel",
    sa: "390 €/an",
    cabinet: "500–2 000 € / DUERP",
    gratuit: "Gratuit",
    template: "Gratuit",
  },
  {
    critere: "Guidé pas à pas",
    sa: true,
    cabinet: true,
    gratuit: false,
    template: false,
  },
  {
    critere: "Interface moderne",
    sa: true,
    cabinet: null,
    gratuit: false,
    template: null,
  },
  {
    critere: "Autonome après la 1ère année",
    sa: true,
    cabinet: false,
    gratuit: true,
    template: true,
  },
  {
    critere: "Méthodes normées INRS",
    sa: true,
    cabinet: true,
    gratuit: "Partiel",
    template: false,
  },
  {
    critere: "Export PDF structuré",
    sa: true,
    cabinet: true,
    gratuit: "Basique",
    template: true,
  },
  {
    critere: "Versioning 40 ans",
    sa: true,
    cabinet: "Variable",
    gratuit: false,
    template: false,
  },
  {
    critere: "Accompagnement humain",
    sa: "En option",
    cabinet: true,
    gratuit: false,
    template: false,
  },
  {
    critere: "Mise à jour annuelle simple",
    sa: true,
    cabinet: false,
    gratuit: "Difficile",
    template: false,
  },
]

function Cell({ val }: { val: boolean | string | null }) {
  if (val === true) {
    return (
      <td className="px-4 py-3 text-center">
        <svg className="w-5 h-5 text-green-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </td>
    )
  }
  if (val === false) {
    return (
      <td className="px-4 py-3 text-center">
        <svg className="w-5 h-5 text-red-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </td>
    )
  }
  if (val === null) {
    return <td className="px-4 py-3 text-center text-brand-sand-dark text-sm">—</td>
  }
  return <td className="px-4 py-3 text-center text-xs text-brand-bronze">{val}</td>
}

const faq = [
  {
    q: "L'essai gratuit est-il vraiment gratuit ?",
    r: "Oui, totalement. Aucune carte bancaire n'est demandée lors de l'inscription. Vous avez 14 jours d'accès complet à toutes les fonctionnalités. À l'issue de l'essai, vous choisissez si vous souhaitez vous abonner.",
  },
  {
    q: "Que se passe-t-il après les 14 jours ?",
    r: "Votre compte passe en mode consultation : vous pouvez voir vos données mais ne pouvez plus modifier ni exporter. Dès que vous vous abonnez, tout redevient accessible immédiatement.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    r: "Oui. L'abonnement mensuel peut être annulé à tout moment, sans préavis. Vous conservez l'accès jusqu'à la fin de la période payée. Pour l'abonnement annuel, l'annulation prend effet à la date de renouvellement.",
  },
  {
    q: "La prestation consulting est-elle séparée du SaaS ?",
    r: "La prestation consulting inclut 1 an d'abonnement SafeAnalyse. Vous n'avez rien à payer en plus. L'année suivante, vous renouvelez l'abonnement SaaS seul (390 €/an) ou commandez une nouvelle prestation.",
  },
  {
    q: "Comment fonctionne la facturation ?",
    r: "Paiement par carte bancaire via Stripe (sécurisé). Facturation mensuelle ou annuelle selon votre choix. Facture disponible dans votre espace client.",
  },
]

export default function TarifsPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-brand-cream py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-hero-badge inline-flex items-center gap-2 bg-brand-gold-pale border border-brand-sand rounded-full px-4 py-1.5 text-sm text-brand-bronze mb-6 font-medium">
            14 jours gratuits · Sans carte bancaire · Sans engagement mensuel
          </div>
          <h1 className="animate-hero-title text-4xl sm:text-5xl font-extrabold text-brand-navy leading-tight mb-6">
            Un seul plan, tout inclus.
          </h1>
          <p className="animate-hero-sub text-lg text-brand-bronze max-w-xl mx-auto leading-relaxed">
            Pas de formule basique, pas d&apos;option cachée. Tout ce dont vous avez besoin pour un DUERP conforme, dès le premier jour.
          </p>
        </div>
      </section>

      {/* ── Plans ─────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">

              {/* Mensuel */}
              <div className="bg-brand-off border border-brand-sand rounded-2xl p-8 shadow-[0_1px_3px_rgba(3,25,72,0.05)] flex flex-col">
                <div className="text-sm font-medium text-brand-bronze mb-2">Mensuel</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-5xl font-extrabold text-brand-navy">39€</span>
                  <span className="text-brand-bronze">/mois</span>
                </div>
                <p className="text-xs text-brand-sand-dark mb-6">Sans engagement · Annulable à tout moment</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {fonctionnalites.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-brand-bronze">
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className="block text-center border border-brand-navy text-brand-navy hover:bg-brand-navy/5 font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Commencer l&apos;essai gratuit
                </Link>
              </div>

              {/* Annuel */}
              <div className="bg-brand-navy rounded-2xl p-8 shadow-lg flex flex-col relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-gold text-brand-off text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  RECOMMANDÉ — 1 MOIS OFFERT
                </div>
                <div className="text-sm font-medium text-brand-cream/70 mb-2">Annuel</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-5xl font-extrabold text-white">390€</span>
                  <span className="text-brand-cream/70">/an</span>
                </div>
                <p className="text-xs text-brand-cream/50 mb-6">Soit 32,50 €/mois — économisez 78 €</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {fonctionnalites.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-brand-cream/80">
                      <svg className="w-4 h-4 text-brand-gold-light shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className="block text-center bg-brand-gold hover:bg-brand-gold-light text-brand-off font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Commencer l&apos;essai gratuit →
                </Link>
              </div>

            </div>
          </AnimateOnScroll>

          {/* Consulting */}
          <AnimateOnScroll animation="fade-up">
            <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg bg-brand-gold-pale text-brand-gold flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-navy mb-1">Accompagnement sur site</h3>
                  <p className="text-brand-bronze text-sm">Je me déplace dans votre entreprise pour réaliser l&apos;évaluation avec vous, directement dans l&apos;outil.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { eff: "1-10 salariés", prix: "500 €", duree: "Demi-journée" },
                  { eff: "11-25 salariés", prix: "800 €", duree: "1 jour" },
                  { eff: "26-50 salariés", prix: "1 200 €", duree: "1-2 jours" },
                  { eff: "51-100 salariés", prix: "1 800 €", duree: "2-3 jours" },
                ].map((item) => (
                  <div key={item.eff} className="rounded-xl bg-brand-cream border border-brand-sand p-3 text-center">
                    <p className="text-xs text-brand-bronze mb-1">{item.eff}</p>
                    <p className="text-xl font-bold text-brand-navy">{item.prix}</p>
                    <p className="text-xs text-brand-bronze/60">{item.duree}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 text-xs text-brand-bronze/70">
                <svg className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>1 an d&apos;abonnement SafeAnalyse. inclus dans la prestation · Majoration +20 à 40 % pour BTP, industrie, chimie · 100+ salariés sur devis</span>
              </div>
              <Link
                href="/contact"
                className="mt-5 inline-block border border-brand-navy text-brand-navy hover:bg-brand-navy/5 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                Demander un devis →
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Comparatif ────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-navy">SafeAnalyse. vs les alternatives</h2>
              <p className="mt-3 text-brand-bronze max-w-xl mx-auto">Pourquoi choisir SafeAnalyse. plutôt qu&apos;un cabinet HSE, un outil gratuit ou un template Excel ?</p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up">
            <div className="overflow-x-auto rounded-2xl border border-brand-sand shadow-[0_1px_3px_rgba(3,25,72,0.05)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-brand-navy text-brand-cream">
                    <th className="text-left px-4 py-3 font-medium text-brand-cream/70 rounded-tl-2xl">Critère</th>
                    <th className="px-4 py-3 font-semibold text-brand-gold-light">SafeAnalyse.</th>
                    <th className="px-4 py-3 font-medium text-brand-cream/70">Cabinet HSE</th>
                    <th className="px-4 py-3 font-medium text-brand-cream/70">Seirich / Oira</th>
                    <th className="px-4 py-3 font-medium text-brand-cream/70 rounded-tr-2xl">Template Word</th>
                  </tr>
                </thead>
                <tbody>
                  {comparatif.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-t border-brand-sand/60 ${i % 2 === 0 ? 'bg-brand-off' : 'bg-brand-cream-light'}`}
                    >
                      <td className="px-4 py-3 font-medium text-brand-navy text-sm">{row.critere}</td>
                      <td className="px-4 py-3 text-center bg-brand-gold-pale/40">
                        {typeof row.sa === 'boolean' ? (
                          row.sa ? (
                            <svg className="w-5 h-5 text-green-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-red-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )
                        ) : (
                          <span className="text-xs font-semibold text-brand-navy">{row.sa}</span>
                        )}
                      </td>
                      <Cell val={row.cabinet} />
                      <Cell val={row.gratuit} />
                      <Cell val={row.template} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-cream-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <h2 className="text-3xl font-bold text-brand-navy text-center mb-12">Questions fréquentes</h2>
          </AnimateOnScroll>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <AnimateOnScroll key={i} delay={([0, 100, 200, 300, 400] as const)[i]} animation="fade-up">
                <div className="bg-brand-off border border-brand-sand rounded-xl p-6">
                  <p className="font-semibold text-brand-navy mb-2">{item.q}</p>
                  <p className="text-sm text-brand-bronze leading-relaxed">{item.r}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-navy text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-brand-cream mb-4">Commencez gratuitement</h2>
          <p className="text-brand-cream/70 mb-8">14 jours d&apos;essai complet. Aucune carte bancaire.</p>
          <Link
            href="/auth/signup"
            className="inline-block bg-brand-gold hover:bg-brand-gold-light text-brand-off font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Créer mon compte gratuit →
          </Link>
        </div>
      </section>

    </div>
  )
}
