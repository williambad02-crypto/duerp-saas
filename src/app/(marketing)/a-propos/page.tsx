import Link from 'next/link'
import Image from 'next/image'
import {
  SectionReveal,
  BentoGrid,
  BentoCard,
} from '@/components/marketing/ui'
import { HeroAproposTitle } from '@/components/marketing/hero-apropos-title'
import { ArrowRight, MapPin, Flame, GraduationCap, Factory, Target, Wrench, Shield } from 'lucide-react'

export const metadata = {
  title: 'Qui je suis — SafeAnalyse.',
  description:
    'William Maréchal, diplômé BUT HSE, a créé SafeAnalyse. pour simplifier le DUERP des PME industrielles. Un professionnel HSE qui code, pas un développeur qui a lu la loi.',
}

export default function AProposPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── Hero — navy deep full-screen + photo ─────────────────────── */}
      <section className="relative -mt-20 bg-brand-navy-deep min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-brand-navy-deep via-brand-navy-deep to-brand-navy-deep/95" />
        {/* Blurs décoratifs */}
        <div aria-hidden className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-20 -right-16 w-80 h-80 rounded-full bg-brand-accent/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3">
              <HeroAproposTitle />
              <p className="animate-hero-sub text-lg text-brand-cream/70 leading-relaxed max-w-2xl">
                SafeAnalyse. n&apos;est pas né dans une salle de réunion. Il est né de la frustration
                de terrain : les outils existants sont trop techniques, trop chers, ou trop génériques
                pour les PME industrielles.
              </p>
            </div>
            <div className="lg:col-span-2 flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl overflow-hidden border-2 border-brand-gold/30 shadow-[0_30px_80px_-20px_rgba(184,134,11,0.35)]">
                  <Image
                    src="/marketing/william-portrait-large.jpeg"
                    alt="William Maréchal — fondateur SafeAnalyse."
                    width={288}
                    height={288}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-brand-gold text-brand-navy-deep text-xs font-extrabold px-3 py-1.5 rounded-full shadow-[0_4px_12px_-2px_rgba(184,134,11,0.6)] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Morbihan · FR
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Parcours — BentoGrid ─────────────────────────────────────── */}
      <section className="py-24 bg-brand-cream-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="text-center mb-14">
              <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">
                Parcours
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mt-3">Un pied dans chaque monde</h2>
              <p className="mt-3 text-brand-bronze max-w-xl mx-auto">
                Formation, terrain, intervention d&apos;urgence — la prévention vue sous trois angles.
              </p>
            </div>
          </SectionReveal>

          <BentoGrid>
            <BentoCard
              index={0}
              size="md"
              icon={<GraduationCap className="w-7 h-7" />}
              title="BUT HSE — diplômé septembre 2026"
              description="Formation en 3 ans couvrant tous les risques professionnels : physiques, chimiques, biologiques, psychosociaux. Méthodes INRS, réglementation du travail, ergonomie, toxicologie."
            />
            <BentoCard
              index={1}
              size="md"
              icon={<Factory className="w-7 h-7" />}
              title="2 ans en PME agroalimentaire"
              description="Alternance chez MGD Nature (Morbihan) : évaluations de risques, rédaction de DUERP, suivi des plans de maîtrise sur les postes de production, conditionnement et logistique."
            />
            <BentoCard
              index={2}
              size="md"
              icon={<Flame className="w-7 h-7" />}
              title="Pompier volontaire — Morbihan"
              description="Une autre façon d'appréhender les risques, pas depuis un bureau mais depuis le terrain. Ça forge une certaine façon de prioriser l'essentiel."
            />
          </BentoGrid>
        </div>
      </section>

      {/* ── Citation déclic — navy premium ──────────────────────────── */}
      <section className="py-24 bg-brand-navy-deep">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="relative rounded-3xl p-[1.5px] bg-gradient-to-br from-brand-gold/70 via-brand-accent-dark/40 to-brand-gold/30 shadow-[0_30px_80px_-20px_rgba(184,134,11,0.25)]">
              <blockquote className="relative bg-brand-navy rounded-[calc(1.5rem-1px)] px-8 py-12 md:px-12 md:py-14 overflow-hidden">
                <div aria-hidden className="absolute -top-16 -right-12 w-60 h-60 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
                <span
                  aria-hidden
                  className="absolute top-4 left-6 text-[120px] font-black text-brand-gold/15 leading-none select-none pointer-events-none"
                >
                  &ldquo;
                </span>
                <p className="relative text-xl md:text-2xl font-semibold text-brand-cream leading-relaxed mb-5">
                  Le déclic, ça a été de voir un dirigeant de PME passer 3 heures sur un fichier
                  Excel incomplet — pour finalement me demander si c&apos;était <span className="text-brand-gold-light">&ldquo;vraiment obligatoire&rdquo;</span>.
                  Il ne manquait pas de bonne volonté. Il manquait d&apos;un outil fait pour lui.
                </p>
                <footer className="text-brand-gold-light/80 text-sm font-semibold uppercase tracking-widest">
                  — William Maréchal, fondateur de SafeAnalyse.
                </footer>
              </blockquote>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── Valeurs — BentoGrid + Domaines en tags ──────────────────── */}
      <section className="py-24 bg-brand-cream-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="text-center mb-14">
              <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">
                Ce qui me guide
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mt-3">Trois convictions</h2>
            </div>
          </SectionReveal>

          <BentoGrid>
            <BentoCard
              index={0}
              size="md"
              icon={<Shield className="w-6 h-6" />}
              title="Méthodes normées, langage simple"
              description="Chaque module s'appuie sur les publications INRS (ED 840, ED 6035) et les normes en vigueur (ISO 9612). Je traduis chaque notion réglementaire en langage compréhensible par tout dirigeant de PME."
            />
            <BentoCard
              index={1}
              size="md"
              icon={<Wrench className="w-6 h-6" />}
              title="Terrain avant tout"
              description="J'ai vu des DUERP Word de 3 pages qui ne correspondaient à aucun poste réel. SafeAnalyse. est construit pour l'usage terrain : tablette en atelier, 2 heures de travail, PDF prêt à signer."
            />
            <BentoCard
              index={2}
              size="md"
              icon={<Target className="w-6 h-6" />}
              title="Honnêteté sur les limites"
              description="L'outil guide, il ne se substitue pas à votre connaissance de vos postes. Pour les situations complexes — industrie lourde, chimique, multisite — l'accompagnement sur site reste la meilleure option."
            />
          </BentoGrid>
        </div>
      </section>

      {/* ── CTA final — navy deep avec lien consulting ──────────────── */}
      <section className="py-24 bg-brand-navy-deep text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <SectionReveal variant="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-cream mb-4">
              On en discute ?
            </h2>
            <p className="text-brand-cream/60 mb-8 leading-relaxed">
              Je lis tous les messages personnellement et réponds sous 24 heures ouvrées.
              Consulting sur site disponible en Morbihan &amp; Bretagne sud —
              <Link href="/tarifs" className="text-brand-gold-light hover:text-brand-gold underline decoration-brand-gold/40 hover:decoration-brand-gold transition-colors ml-1">
                voir l&apos;offre de lancement
              </Link>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-brand-gold-light text-brand-navy-deep hover:bg-brand-gold font-semibold px-8 py-3.5 rounded-xl transition-all hover:shadow-[0_10px_30px_-6px_rgba(184,134,11,0.6)]"
              >
                Demander un échange
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center gap-2 border border-brand-cream/30 text-brand-cream/90 hover:bg-brand-cream/10 font-medium px-8 py-3.5 rounded-xl transition-all"
              >
                Consulter la FAQ
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

    </div>
  )
}
