import Link from 'next/link'
import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll'

export const metadata = {
  title: "L'outil — SafeAnalyse.",
  description: "Découvrez comment SafeAnalyse. guide les PME dans leur évaluation des risques professionnels : modules, cotation, PDF, tableau APR.",
}

const fonctionnalites = [
  {
    titre: "Wizard guidé pas à pas",
    desc: "L'outil vous pose les bonnes questions dans le bon ordre. Pas besoin de connaître la réglementation HSE : chaque module vous explique ce qu'il faut évaluer et pourquoi.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    titre: "Modules de risques normés",
    desc: "Chaque risque (bruit, TMS, RPS, vibrations…) suit sa propre méthode d'évaluation, conforme aux normes INRS et ANSES. Les grilles de cotation sont intégrées directement.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    ),
  },
  {
    titre: "Cotation Gravité × Probabilité",
    desc: "Système de cotation standardisé G×P (score 1 à 20) avec code couleur : vert (acceptable), jaune (à planifier), orange (prioritaire), rouge (action immédiate).",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    ),
  },
  {
    titre: "Plan de maîtrise intégré",
    desc: "Pour chaque risque, saisissez les mesures de prévention déjà en place et le coefficient d'efficacité. L'outil calcule automatiquement la criticité résiduelle.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    ),
  },
  {
    titre: "Tableau APR de synthèse",
    desc: "Vue d'ensemble de tous les risques évalués, triés par criticité résiduelle décroissante. Identifiez immédiatement les priorités d'action dans votre entreprise.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    ),
  },
  {
    titre: "Export PDF officiel",
    desc: "Générez en un clic votre DUERP complet en PDF : page de garde, sommaire, évaluations par poste, tableau APR, plan de maîtrise et programme annuel de prévention.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
  {
    titre: "Versioning sur 40 ans",
    desc: "Chaque version de votre DUERP est conservée automatiquement. Obligation légale respectée — l'article R4121-4 impose une conservation des versions pendant 40 ans minimum.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    titre: "Interface adaptée terrain",
    desc: "Conçue pour être utilisée sur tablette depuis un atelier ou un chantier. Interface simple, sans jargon, pensée pour les dirigeants de PME — pas pour des experts HSE.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    ),
  },
]

const modules = [
  { code: "M01", nom: "Bruit", statut: "actif", desc: "Exposition sonore, niveaux d'action, protection auditive" },
  { code: "M02", nom: "Vibrations", statut: "bientot", desc: "Vibrations main-bras, corps entier, valeurs limites" },
  { code: "M03", nom: "TMS", statut: "bientot", desc: "Troubles musculo-squelettiques, cotation RULA/REBA" },
  { code: "M04", nom: "Charge physique", statut: "bientot", desc: "Port de charges, manutentions manuelles (ED6161)" },
  { code: "M05", nom: "Risques psychosociaux", statut: "bientot", desc: "Stress, harcèlement, conditions de travail" },
  { code: "M06", nom: "Chimique / CMR", statut: "bientot", desc: "Produits chimiques, cancérogènes, mutagènes" },
  { code: "M07", nom: "Biologique", statut: "bientot", desc: "Agents biologiques, risques infectieux" },
  { code: "M08", nom: "Thermique", statut: "bientot", desc: "Chaleur, froid, ambiances thermiques" },
  { code: "M09", nom: "Rayonnements", statut: "bientot", desc: "UV, ionisants, electromagnétiques" },
]

export default function OutilPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-brand-cream py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-hero-badge inline-flex items-center gap-2 bg-brand-gold-pale border border-brand-sand rounded-full px-4 py-1.5 text-sm text-brand-bronze mb-6 font-medium">
            SaaS guidé · Modules normés INRS · Export PDF
          </div>
          <h1 className="animate-hero-title text-4xl sm:text-5xl font-extrabold text-brand-navy leading-tight mb-6">
            Un outil pensé pour<br />les dirigeants de terrain
          </h1>
          <p className="animate-hero-sub text-lg text-brand-bronze max-w-2xl mx-auto leading-relaxed">
            SafeAnalyse. n&apos;est pas un formulaire à remplir. C&apos;est un guide interactif qui vous accompagne module par module, avec des grilles de cotation normées et un langage accessible.
          </p>
        </div>
      </section>

      {/* ── Fonctionnalités ───────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-brand-navy">Ce que vous obtenez</h2>
              <p className="mt-3 text-brand-bronze max-w-xl mx-auto">Tout ce dont vous avez besoin pour réaliser un DUERP conforme, sans expertise HSE préalable.</p>
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fonctionnalites.map((f, i) => (
              <AnimateOnScroll key={i} delay={([0, 100, 200, 300, 0, 100, 200, 300] as const)[i]} animation="fade-up">
                <div className="bg-brand-off border border-brand-sand rounded-xl p-6 h-full shadow-[0_1px_3px_rgba(3,25,72,0.05)] hover:shadow-[0_4px_12px_rgba(3,25,72,0.08)] hover:-translate-y-0.5 transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-brand-gold-pale text-brand-gold flex items-center justify-center mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {f.icon}
                    </svg>
                  </div>
                  <h3 className="font-semibold text-brand-navy mb-2 text-sm">{f.titre}</h3>
                  <p className="text-xs text-brand-bronze leading-relaxed">{f.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modules ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-navy">Les modules de risques</h2>
              <p className="mt-3 text-brand-bronze max-w-xl mx-auto">
                V1 active avec le module Bruit. Les autres modules arrivent progressivement.
              </p>
            </div>
          </AnimateOnScroll>
          <div className="space-y-3">
            {modules.map((m, i) => (
              <AnimateOnScroll key={m.code} delay={([0, 100, 200, 0, 100, 200, 0, 100, 200] as const)[i]} animation="fade-right">
                <div className="flex items-center gap-4 bg-brand-off border border-brand-sand rounded-xl px-5 py-4">
                  <span className="text-xs font-bold text-brand-bronze/60 w-8 shrink-0">{m.code}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-brand-navy text-sm">{m.nom}</span>
                      {m.statut === 'actif' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Actif V1
                        </span>
                      ) : (
                        <span className="text-xs font-medium bg-brand-gold-pale text-brand-bronze border border-brand-sand px-2 py-0.5 rounded-full">
                          Bientôt
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-bronze">{m.desc}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Flux utilisateur ─────────────────────────────────────────── */}
      <section className="py-20 bg-brand-cream-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-navy">Comment ça se passe</h2>
              <p className="mt-3 text-brand-bronze">Du compte à la signature du PDF, en quelques heures.</p>
            </div>
          </AnimateOnScroll>
          <div className="space-y-4">
            {[
              { n: "1", t: "Créez votre compte", d: "Inscription gratuite, 14 jours d'accès complet. Aucune carte bancaire requise." },
              { n: "2", t: "Saisissez votre entreprise", d: "SIRET, effectif, secteur d'activité, adresse. 2 minutes." },
              { n: "3", t: "Déclarez vos postes de travail", d: "Listez chaque poste (opérateur machine, caissier, cariste…) et décomposez-les en opérations concrètes." },
              { n: "4", t: "Évaluez chaque opération", d: "Pour chaque couple opération × risque, l'outil vous pose 3 questions de présélection puis vous guide dans la cotation complète si nécessaire." },
              { n: "5", t: "Consultez le tableau APR", d: "Vue synthétique de tous vos risques, triés par niveau de criticité. Identifiez vos priorités d'action en un coup d'œil." },
              { n: "6", t: "Exportez votre DUERP", d: "Générez le PDF officiel : page de garde, évaluations, plan de maîtrise, programme annuel. Prêt à signer et à présenter à l'inspection du travail." },
            ].map((step, i) => (
              <AnimateOnScroll key={i} delay={0} animation="fade-up">
                <div className="flex gap-4 bg-brand-off border border-brand-sand rounded-xl p-5">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-brand-navy text-brand-cream flex items-center justify-center text-sm font-bold mt-0.5">
                    {step.n}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy mb-1">{step.t}</p>
                    <p className="text-sm text-brand-bronze leading-relaxed">{step.d}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-navy text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-brand-cream mb-4">Prêt à commencer ?</h2>
          <p className="text-brand-cream/70 mb-8">14 jours d&apos;essai complet, sans carte bancaire.</p>
          <Link
            href="/auth/signup"
            className="inline-block bg-brand-gold hover:bg-brand-gold-light text-brand-off font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Créer mon compte gratuitement →
          </Link>
        </div>
      </section>

    </div>
  )
}
