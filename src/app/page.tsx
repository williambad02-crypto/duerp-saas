import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { CookieBanner } from '@/components/landing/cookie-banner'
import { MarketingNav } from '@/components/marketing/nav'
import { MarketingFooter } from '@/components/marketing/footer'
import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll'
import { HeroSection, StorySection } from '@/components/marketing/hero-scroll'
import { Factory, HardHat, Utensils, CheckCircle2, ArrowRight, Shield, BookOpen, MapPin, FileCheck } from 'lucide-react'

export const metadata = {
  title: 'SafeAnalyse. — Votre DUERP fait sérieusement.',
  description:
    "L'outil DUERP guidé pour les PME industrielles. Conçu par un professionnel HSE, conforme Code du travail, accompagnement local Morbihan disponible.",
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <>
      <MarketingNav />

      <main className="flex-1 flex flex-col">

        {/* ── 1. Hero plein écran ──────────────────────────────────────── */}
        <HeroSection />

        {/* ── 2. Sticky scroll storytelling ───────────────────────────── */}
        <StorySection />

        {/* ── 3. Pour qui ─────────────────────────────────────────────── */}
        <section className="py-24 bg-brand-cream-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll animation="fade-up">
              <div className="text-center mb-14">
                <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">
                  Secteurs d&apos;activité
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mt-3 mb-4">
                  Pour qui est SafeAnalyse. ?
                </h2>
                <p className="text-brand-ink-soft max-w-xl mx-auto text-lg">
                  Conçu pour les PME qui travaillent dans des environnements à risques réels — pas pour les bureaux.
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: Factory,
                  titre: 'Agroalimentaire',
                  description:
                    'Ateliers de production, chambres froides, découpe, conditionnement. Bruit, TMS, risques biologiques et chimiques.',
                  delay: 0 as const,
                },
                {
                  icon: HardHat,
                  titre: 'BTP & Industrie',
                  description:
                    'Chantiers, ateliers de maintenance, manutention. Chutes, vibrations, risques électriques et mécaniques.',
                  delay: 100 as const,
                },
                {
                  icon: Utensils,
                  titre: 'Restauration & Services',
                  description:
                    'Cuisine professionnelle, hôtellerie, transport. Brûlures, efforts physiques, stress thermique et RPS.',
                  delay: 200 as const,
                },
              ].map((secteur) => (
                <AnimateOnScroll key={secteur.titre} animation="fade-up" delay={secteur.delay}>
                  <div className="bg-brand-off border border-brand-sand rounded-2xl p-8 shadow-[0_1px_3px_rgba(3,25,72,0.05)] hover:shadow-[0_4px_16px_rgba(3,25,72,0.09)] transition-shadow group">
                    <div className="w-12 h-12 rounded-xl bg-brand-gold-pale flex items-center justify-center mb-5 group-hover:bg-brand-gold-pale/80 transition-colors">
                      <secteur.icon className="w-6 h-6 text-brand-gold" />
                    </div>
                    <h3 className="text-xl font-bold text-brand-navy mb-3">{secteur.titre}</h3>
                    <p className="text-brand-ink-soft leading-relaxed">{secteur.description}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. Comment ça marche ────────────────────────────────────── */}
        <section className="py-24 bg-brand-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll animation="fade-up">
              <div className="text-center mb-16">
                <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">
                  Démarche
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mt-3 mb-4">
                  Du zéro au DUERP en quelques heures
                </h2>
                <p className="text-brand-ink-soft max-w-xl mx-auto text-lg">
                  Sans formation HSE requise. Guidé pas à pas, méthodes INRS intégrées.
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  num: '1',
                  titre: 'Déclarez votre entreprise',
                  desc: 'Nom, effectif, secteur d\'activité. 2 minutes pour démarrer.',
                  delay: 0 as const,
                },
                {
                  num: '2',
                  titre: 'Listez vos postes de travail',
                  desc: 'Décomposez chaque poste en opérations concrètes — ex : "conduite de chariot", "découpe", "nettoyage".',
                  delay: 100 as const,
                },
                {
                  num: '3',
                  titre: 'Évaluez chaque risque',
                  desc: 'Le wizard vous guide module par module (bruit, TMS, chutes…) avec les grilles de cotation INRS.',
                  delay: 200 as const,
                },
                {
                  num: '4',
                  titre: 'Générez votre DUERP PDF',
                  desc: 'Document horodaté, structuré, prêt à présenter à l\'inspection du travail. Conservé 40 ans automatiquement.',
                  delay: 300 as const,
                },
              ].map((etape) => (
                <AnimateOnScroll key={etape.num} animation="fade-up" delay={etape.delay}>
                  <div className="relative flex flex-col bg-brand-off border border-brand-sand rounded-2xl p-6 shadow-[0_1px_3px_rgba(3,25,72,0.05)]">
                    <div className="text-4xl font-extrabold text-brand-gold-pale mb-3 leading-none">
                      {etape.num}
                    </div>
                    <h3 className="font-bold text-brand-navy text-lg mb-2">{etape.titre}</h3>
                    <p className="text-sm text-brand-ink-soft leading-relaxed">{etape.desc}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>

            <AnimateOnScroll animation="fade-up" delay={400}>
              <div className="mt-10 text-center">
                <Link
                  href="/outil"
                  className="inline-flex items-center gap-2 text-brand-navy font-semibold hover:text-brand-accent transition-colors"
                >
                  Voir comment fonctionne l&apos;outil
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ── 5. Pourquoi pas un autre outil ? (teaser comparatif) ─────── */}
        <section className="py-24 bg-brand-navy">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll animation="fade-up">
              <div className="text-center mb-14">
                <span className="text-brand-gold-light text-xs font-bold uppercase tracking-widest">
                  Comparatif
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-brand-cream mt-3 mb-4">
                  Pourquoi pas un autre outil ?
                </h2>
                <p className="text-brand-cream/60 max-w-xl mx-auto">
                  Il existe d&apos;autres solutions. Voici pourquoi les PME industrielles nous choisissent.
                </p>
              </div>
            </AnimateOnScroll>

            {/* Mini-comparatif */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: 'SafeAnalyse.',
                  desc: 'Créé par un pro HSE de terrain',
                  points: ['Méthodes INRS intégrées', 'Guidé pas à pas', 'Accompagnement local possible', 'Conforme Code du travail'],
                  highlight: true,
                  delay: 0 as const,
                },
                {
                  label: 'Cabinet HSE',
                  desc: 'Expertise maximale, prix élevé',
                  points: ['Expert dédié', '1 500 €+ / audit', 'À renouveler chaque année', 'Pas d\'outil en mains'],
                  highlight: false,
                  delay: 100 as const,
                },
                {
                  label: 'Outils gratuits',
                  desc: 'INRS, Seirich, tableurs…',
                  points: ['Gratuit', 'Très complexe', 'Pas de guidance', 'Risque d\'erreurs'],
                  highlight: false,
                  delay: 200 as const,
                },
              ].map((col) => (
                <AnimateOnScroll key={col.label} animation="fade-up" delay={col.delay}>
                  <div className={cn(
                    'rounded-2xl p-6',
                    col.highlight
                      ? 'bg-brand-navy-light border-2 border-brand-gold/50 shadow-[0_0_30px_rgba(184,134,11,0.15)]'
                      : 'bg-brand-navy-deep/60 border border-white/10'
                  )}>
                    <div className={cn(
                      'text-sm font-bold uppercase tracking-wider mb-1',
                      col.highlight ? 'text-brand-gold-light' : 'text-brand-cream/50'
                    )}>
                      {col.label}
                    </div>
                    <p className={cn(
                      'text-xs mb-5',
                      col.highlight ? 'text-brand-cream/70' : 'text-brand-cream/40'
                    )}>
                      {col.desc}
                    </p>
                    <ul className="space-y-2.5">
                      {col.points.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <CheckCircle2 className={cn(
                            'w-4 h-4 mt-0.5 shrink-0',
                            col.highlight ? 'text-brand-success' : 'text-brand-cream/25'
                          )} />
                          <span className={cn(
                            'text-sm leading-snug',
                            col.highlight ? 'text-brand-cream' : 'text-brand-cream/45'
                          )}>
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>

            <AnimateOnScroll animation="fade-up" delay={300}>
              <div className="mt-10 text-center">
                <Link
                  href="/comparatif"
                  className="inline-flex items-center gap-2 text-brand-gold-light font-semibold hover:text-brand-gold transition-colors"
                >
                  Voir le comparatif détaillé
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ── 6. Pourquoi William ─────────────────────────────────────── */}
        <section className="py-24 bg-brand-cream-light">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll animation="fade-up">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">

                {/* Portrait */}
                <div className="lg:col-span-2 flex justify-center">
                  <div className="relative">
                    <div className="w-52 h-52 rounded-3xl overflow-hidden border-2 border-brand-sand shadow-[0_8px_30px_rgba(3,25,72,0.1)]">
                      <Image
                        src="/marketing/william-portrait-large.jpeg"
                        alt="William Maréchal — fondateur SafeAnalyse."
                        width={208}
                        height={208}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Badge fondateur */}
                    <div className="absolute -bottom-3 -right-3 bg-brand-navy text-brand-cream text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                      Fondateur HSE
                    </div>
                  </div>
                </div>

                {/* Texte */}
                <div className="lg:col-span-3">
                  <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">
                    Un outil fait par un pro
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mt-3 mb-4">
                    Pas un éditeur de logiciels.
                    <br />Un professionnel HSE en exercice.
                  </h2>
                  <p className="text-brand-ink-soft leading-relaxed mb-5">
                    Je m&apos;appelle William Maréchal. Je suis alternant HSE en PME agroalimentaire depuis 2 ans,
                    et pompier volontaire en Morbihan. J&apos;ai créé SafeAnalyse. parce que les outils existants
                    ne correspondaient pas à la réalité du terrain : trop complexes, trop chers, ou trop génériques.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { icon: Shield, text: 'BUT HSE — sept. 2026' },
                      { icon: MapPin, text: 'Morbihan & Bretagne sud' },
                      { icon: Factory, text: '2 ans en PME agro (MGD Nature)' },
                      { icon: FileCheck, text: 'Méthodes INRS ED 840, ISO 9612' },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-2 text-sm text-brand-ink-soft">
                        <item.icon className="w-4 h-4 text-brand-gold shrink-0" />
                        {item.text}
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/a-propos"
                    className="inline-flex items-center gap-2 text-brand-navy font-semibold hover:text-brand-accent transition-colors"
                  >
                    Découvrir mon parcours
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ── 7. CTA final ─────────────────────────────────────────────── */}
        <section className="py-24 bg-brand-navy-deep text-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <AnimateOnScroll animation="fade-up">
              <BookOpen className="w-10 h-10 text-brand-gold mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-cream mb-5 leading-tight">
                Discutons de votre DUERP.
              </h2>
              <p className="text-brand-cream/60 mb-10 text-lg leading-relaxed">
                Un échange de 20 minutes pour comprendre votre situation et vous dire
                si SafeAnalyse. est la bonne solution pour vous. Sans engagement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-brand-gold-light text-brand-navy-deep hover:bg-brand-gold font-semibold px-8 py-3.5 rounded-xl text-base transition-all hover:shadow-[0_4px_20px_rgba(184,134,11,0.4)] hover:scale-[1.02]"
                >
                  Demander un échange
                </Link>
                <Link
                  href="/tarifs"
                  className="inline-flex items-center justify-center gap-2 border border-brand-cream/30 text-brand-cream hover:bg-brand-cream/10 font-medium px-8 py-3.5 rounded-xl text-base transition-all"
                >
                  Voir les tarifs
                </Link>
              </div>
              <p className="mt-6 text-sm text-brand-cream/35">
                14 jours d&apos;essai gratuit · Sans carte bancaire · Résiliable à tout moment
              </p>
            </AnimateOnScroll>
          </div>
        </section>

      </main>

      <MarketingFooter />
      <CookieBanner />
    </>
  )
}
