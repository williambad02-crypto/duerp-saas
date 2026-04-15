import Link from 'next/link'
import {
  SectionReveal,
  BentoGrid,
  BentoCard,
} from '@/components/marketing/ui'
import { HeroOutilTitle } from '@/components/marketing/hero-outil-title'
import { RisquesMethodes } from '@/components/marketing/risques-methodes'
import { ParcoursTimeline } from '@/components/marketing/parcours-timeline'
import {
  ArrowRight,
  Wand2,
  Layers,
  Gauge,
  ClipboardCheck,
  Table2,
  FileText,
  History,
  TabletSmartphone,
} from 'lucide-react'

export const metadata = {
  title: "L'outil — SafeAnalyse.",
  description:
    "Tout ce qu'il vous faut pour faire votre DUERP : modules normés INRS, cotation G×P, tableau APR et export PDF officiel. Sans expertise HSE préalable.",
}

const fonctionnalites = [
  { icon: Wand2, titre: 'Wizard guidé pas à pas', desc: "L'outil vous pose les bonnes questions dans le bon ordre. Chaque module explique ce qu'il faut évaluer et pourquoi.", size: 'md' as const },
  { icon: Layers, titre: 'Modules de risques normés', desc: 'Chaque risque (bruit, TMS, RPS, vibrations…) suit sa méthode INRS intégrée. Les grilles de cotation sont calculées automatiquement.', size: 'md' as const },
  { icon: Gauge, titre: 'Cotation G×P et G×DE', desc: 'Score 1 à 20, code couleur immédiat : vert (acceptable), jaune (à planifier), orange (prioritaire), rouge (action immédiate).', size: 'sm' as const },
  { icon: ClipboardCheck, titre: 'Plan de maîtrise intégré', desc: "Saisissez vos mesures de prévention existantes. Le coefficient d'efficacité calcule automatiquement la criticité résiduelle.", size: 'sm' as const },
  { icon: Table2, titre: 'Tableau APR de synthèse', desc: "Tous vos risques triés par criticité résiduelle décroissante. Identifiez vos priorités d'action en un coup d'œil.", size: 'sm' as const },
  { icon: FileText, titre: 'Export PDF officiel', desc: 'DUERP complet en PDF : page de garde, sommaire, évaluations par poste, tableau APR, plan de maîtrise et programme annuel.', size: 'sm' as const },
  { icon: History, titre: 'Versioning 40 ans automatique', desc: "Chaque mise à jour est horodatée et conservée. L'obligation légale R4121-4 (conservation 40 ans) est respectée sans action de votre part.", size: 'sm' as const },
  { icon: TabletSmartphone, titre: 'Interface adaptée terrain', desc: 'Pensée pour une tablette depuis un atelier ou un chantier. Simple, sans jargon, pour les dirigeants de PME — pas pour les experts HSE.', size: 'sm' as const },
]

export default function OutilPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── Hero — style landing : navy deep, texte cream/gold ──────── */}
      <section className="relative -mt-20 bg-brand-navy-deep min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-brand-navy-deep via-brand-navy-deep to-brand-navy-deep/90" />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <HeroOutilTitle />
          <p className="animate-hero-sub text-lg text-brand-cream/70 max-w-2xl mx-auto leading-relaxed mb-10">
            SafeAnalyse. n&apos;est pas un formulaire à remplir. C&apos;est un guide interactif qui vous
            accompagne module par module, avec des grilles de cotation normées et un langage accessible.
          </p>
          <div className="animate-hero-cta flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-brand-gold-light text-brand-navy-deep hover:bg-brand-gold font-semibold px-7 py-3 rounded-xl text-base transition-all hover:shadow-[0_4px_20px_rgba(184,134,11,0.4)] hover:scale-[1.02]"
            >
              Demander un échange
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tarifs"
              className="inline-flex items-center gap-2 border border-brand-cream/30 text-brand-cream hover:bg-brand-cream/10 font-medium px-7 py-3 rounded-xl text-base transition-all"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* ── Parcours utilisateur — timeline animée ───────────────────── */}
      <section className="py-24 bg-brand-cream-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="text-center mb-16">
              <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">
                Parcours
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mt-3">De l&apos;inscription au PDF signé</h2>
              <p className="mt-3 text-brand-bronze max-w-xl mx-auto">
                En quelques heures, pas en quelques jours.
              </p>
            </div>
          </SectionReveal>

          <ParcoursTimeline />
        </div>
      </section>

      {/* ── Fonctionnalités — BentoGrid (reflet bleu au hover) ──────── */}
      <section className="py-20 bg-brand-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="text-center mb-14">
              <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">
                Fonctionnalités
              </span>
              <h2 className="text-3xl font-bold text-brand-navy mt-3">Ce que vous obtenez</h2>
              <p className="mt-3 text-brand-bronze max-w-xl mx-auto">
                Tout ce dont vous avez besoin pour réaliser un DUERP conforme, sans expertise HSE préalable.
              </p>
            </div>
          </SectionReveal>

          <BentoGrid>
            {fonctionnalites.map((f, i) => {
              const Icon = f.icon
              return (
                <BentoCard
                  key={f.titre}
                  index={i}
                  size={f.size}
                  icon={<Icon className="w-6 h-6" />}
                  title={f.titre}
                  description={f.desc}
                />
              )
            })}
          </BentoGrid>
        </div>
      </section>

      {/* ── Risques & méthodes — flip cards Aigu / Chronique ────────── */}
      <section className="grain py-24 bg-brand-cream-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="text-center mb-8">
              <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">
                Risques & méthodes
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mt-3">
                Les 20 risques ED 840
              </h2>
              <p className="mt-3 text-brand-bronze max-w-2xl mx-auto">
                Référentiel INRS. Cliquez sur une carte pour découvrir la définition et la méthode associée.
              </p>
            </div>
          </SectionReveal>

          <SectionReveal variant="fade-up" delay={0.1}>
            <RisquesMethodes />
          </SectionReveal>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-navy-deep text-center">
        <div className="max-w-xl mx-auto px-4">
          <SectionReveal variant="fade-up">
            <h2 className="text-2xl font-bold text-brand-cream mb-4">
              Une question avant de vous lancer ?
            </h2>
            <p className="text-brand-cream/60 mb-8">
              Je réponds personnellement à chaque message, sous 24 heures ouvrées.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-brand-gold-light text-brand-navy-deep hover:bg-brand-gold font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-[0_4px_20px_rgba(184,134,11,0.3)]"
              >
                Demander un échange
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tarifs"
                className="inline-flex items-center gap-2 border border-brand-cream/40 text-brand-cream/80 hover:bg-brand-cream/10 font-medium px-8 py-3 rounded-xl transition-all"
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
