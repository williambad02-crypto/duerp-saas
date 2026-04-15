import Link from 'next/link'
import { SectionReveal, BentoGrid, BentoCard } from '@/components/marketing/ui'
import { HeroComparatifTitle } from '@/components/marketing/hero-comparatif-title'
import { ComparatifTable } from '@/components/marketing/comparatif-table'
import { ArrowRight, Building2, Briefcase, FileSpreadsheet, Check } from 'lucide-react'

export const metadata = {
  title: "Comparatif DUERP — SafeAnalyse. vs Cabinet HSE, Seirich, Excel",
  description: "Comparez SafeAnalyse. avec un cabinet HSE, les outils gratuits (Seirich, OiRA) et les templates Word/Excel. Trouvez la solution adaptée à votre PME.",
}

const quandChoisir = [
  {
    titre: 'SafeAnalyse.',
    sous: 'Pour vous si…',
    points: [
      'Vous êtes une PME entre 1 et 250 salariés',
      'Vous voulez être autonome sur votre DUERP',
      "Vous avez besoin d'un outil sérieux sans budget cabinet",
      'Vous avez une mise à jour annuelle à faire',
      "Vous voulez un PDF prêt pour l'inspection du travail",
    ],
    icon: 'sa' as const,
  },
  {
    titre: 'Cabinet HSE',
    sous: 'Pour vous si…',
    points: [
      "Vous n'avez personne en interne pour piloter le DUERP",
      'Votre secteur est très réglementé (nucléaire, chimie…)',
      'Vous avez un budget conséquent',
      "Obligation contractuelle d'expert certifié",
    ],
    icon: 'cabinet' as const,
  },
  {
    titre: 'Seirich / OiRA',
    sous: 'Pour vous si…',
    points: [
      'Vous êtes une TPE avec très peu de risques',
      'Votre secteur est couvert par un module OiRA',
      "Budget nul et temps à y consacrer",
    ],
    icon: 'free' as const,
  },
  {
    titre: 'Template Word/Excel',
    sous: 'Pour vous si…',
    points: [
      'Micro-entreprise avec 1-2 salariés',
      'Base solide existante à mettre en forme',
      'Pas besoin de cotation automatique',
    ],
    icon: 'template' as const,
  },
]

function IconForChoix({ kind }: { kind: 'sa' | 'cabinet' | 'free' | 'template' }) {
  if (kind === 'sa') return <Check className="w-7 h-7" />
  if (kind === 'cabinet') return <Briefcase className="w-7 h-7" />
  if (kind === 'free') return <Building2 className="w-7 h-7" />
  return <FileSpreadsheet className="w-7 h-7" />
}

export default function ComparatifPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── Hero — navy deep full-screen ─────────────────────────────── */}
      <section className="relative -mt-20 bg-brand-navy-deep min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-brand-navy-deep via-brand-navy-deep to-brand-navy-deep/95" />
        <div aria-hidden className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-brand-accent/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <HeroComparatifTitle />
          <p className="animate-hero-sub text-lg text-brand-cream/70 max-w-2xl mx-auto leading-relaxed">
            Cabinet HSE, outils gratuits (Seirich, OiRA), template Word&nbsp;: chaque solution a ses avantages.
            Voici une comparaison <span className="text-brand-gold-light font-semibold">honnête</span> pour choisir ce qui vous correspond.
          </p>
        </div>
      </section>

      {/* ── Tableau comparatif — cream-light, header sticky ──────────── */}
      <section className="py-24 bg-brand-cream-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="text-center mb-12">
              <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">
                Comparatif détaillé
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mt-3">
                15 critères qui font la différence
              </h2>
              <p className="mt-3 text-brand-bronze max-w-xl mx-auto">
                Coût, fonctionnalités, autonomie, accompagnement — chaque option sur le banc d&apos;essai.
              </p>
            </div>
          </SectionReveal>

          <ComparatifTable />
        </div>
      </section>

      {/* ── Quand choisir quoi — navy deep ───────────────────────────── */}
      <section className="py-24 bg-brand-navy-deep">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="text-center mb-14">
              <span className="text-brand-gold-light text-xs font-bold uppercase tracking-widest">
                Guide de choix
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-cream mt-3">Quand choisir quoi ?</h2>
              <p className="mt-3 text-brand-cream/60 max-w-xl mx-auto">
                Chaque option est la bonne dans le bon contexte.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {quandChoisir.map((card, i) => (
              <SectionReveal key={card.titre} variant="fade-up" delay={i * 0.08}>
                <div className={`relative rounded-2xl p-7 h-full overflow-hidden ${
                  card.icon === 'sa'
                    ? 'bg-gradient-to-br from-brand-navy to-brand-navy-light border border-brand-gold/40 shadow-[0_20px_50px_-20px_rgba(184,134,11,0.35)]'
                    : 'bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors'
                }`}>
                  {card.icon === 'sa' && (
                    <div aria-hidden className="absolute -top-16 -right-12 w-48 h-48 rounded-full bg-brand-gold/15 blur-3xl pointer-events-none" />
                  )}
                  <div className="relative">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 ${
                      card.icon === 'sa'
                        ? 'bg-brand-gold/20 border border-brand-gold/40 text-brand-gold-light'
                        : 'bg-white/5 border border-white/10 text-brand-cream/70'
                    }`}>
                      <IconForChoix kind={card.icon} />
                    </div>
                    <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-1 ${
                      card.icon === 'sa' ? 'text-brand-gold-light' : 'text-brand-cream/50'
                    }`}>
                      {card.sous}
                    </p>
                    <h3 className="text-lg font-bold text-brand-cream mb-4">{card.titre}</h3>
                    <ul className="space-y-2.5">
                      {card.points.map((p) => (
                        <li key={p} className="flex items-start gap-2.5 text-sm text-brand-cream/80 leading-relaxed">
                          <Check className={`w-3.5 h-3.5 shrink-0 mt-1 ${card.icon === 'sa' ? 'text-brand-gold-light' : 'text-brand-cream/35'}`} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Un mot honnête — cream-light carte navy premium ─────────── */}
      <section className="py-24 bg-brand-cream-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="relative rounded-3xl p-[1.5px] bg-gradient-to-br from-brand-gold/70 via-brand-accent-dark/40 to-brand-gold/30 shadow-[0_30px_80px_-25px_rgba(184,134,11,0.25)]">
              <div className="relative bg-brand-navy rounded-[calc(1.5rem-1px)] px-8 py-10 md:px-12 md:py-12 overflow-hidden">
                <div aria-hidden className="absolute -top-16 -right-12 w-60 h-60 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />

                <p className="relative text-[10px] font-extrabold uppercase tracking-[0.25em] text-brand-gold-light mb-4">
                  Un mot honnête
                </p>
                <div className="relative space-y-4 text-brand-cream/85 leading-relaxed">
                  <p>
                    SafeAnalyse. n&apos;est pas fait pour tout le monde. Si vous gérez une micro-entreprise avec 1 salarié et peu de risques,
                    un template Word suffit. Si votre secteur est ultra-réglementé et que vous avez un budget cabinet, engagez un expert.
                  </p>
                  <p>
                    SafeAnalyse. est fait pour les PME qui veulent <span className="text-brand-gold-light font-semibold">maîtriser leur DUERP en interne</span>,
                    sans dépendre d&apos;un prestataire à chaque mise à jour, avec un outil sérieux et des méthodes INRS intégrées.
                  </p>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── CTA final — navy deep ────────────────────────────────────── */}
      <section className="py-24 bg-brand-navy-deep text-center">
        <div className="max-w-xl mx-auto px-4">
          <SectionReveal variant="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-cream mb-4">
              Convaincu ? <span className="text-brand-gold-light">Essayez 14 jours gratuits.</span>
            </h2>
            <p className="text-brand-cream/60 mb-8 leading-relaxed">
              Sans carte bancaire. Vos données restent les vôtres.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 bg-brand-gold-light text-brand-navy-deep hover:bg-brand-gold font-semibold px-8 py-3.5 rounded-xl transition-all hover:shadow-[0_10px_30px_-6px_rgba(184,134,11,0.6)]"
              >
                Démarrer l&apos;essai
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tarifs"
                className="inline-flex items-center justify-center gap-2 border border-brand-cream/30 text-brand-cream hover:bg-brand-cream/10 font-medium px-8 py-3.5 rounded-xl transition-all"
              >
                Voir les tarifs
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

    </div>
  )
}
