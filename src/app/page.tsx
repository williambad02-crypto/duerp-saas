import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
// Image utilisé dans les sections ci-dessous
import { createClient } from '@/lib/supabase/server'
import { CookieBanner } from '@/components/landing/cookie-banner'
import { MarketingNav } from '@/components/marketing/nav'
import { MarketingFooter } from '@/components/marketing/footer'
import { BackToTop } from '@/components/marketing/back-to-top'
import {
  SectionReveal,
  StatCounter,
  MarqueeStrip,
} from '@/components/marketing/ui'
import { HeroSection, StorySection } from '@/components/marketing/hero-scroll'
import { SecteursCarousel } from '@/components/marketing/secteurs-carousel'
import { Factory, ArrowRight, Shield, BookOpen, MapPin, FileCheck } from 'lucide-react'

export const metadata = {
  title: 'SafeAnalyse. — Votre DUERP fait sérieusement.',
  description:
    "L'outil DUERP guidé pour les PME industrielles. Conçu par un professionnel HSE, conforme Code du travail, accompagnement local Morbihan disponible.",
}

const trustPhrases = [
  'Conforme Code du travail',
  'Méthodes INRS intégrées',
  'Conservation 40 ans',
  'Accompagnement Morbihan',
  'Essai 14 jours sans CB',
  'Export PDF prêt inspection',
  'RGPD — données hébergées UE',
]

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

        {/* ── 3. Pour qui — Carousel ───────────────────────────────── */}
        <section className="py-24 bg-brand-navy-deep">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionReveal variant="fade-up">
              <div className="text-center mb-12">
                <span className="text-brand-gold-light text-xs font-bold uppercase tracking-widest">
                  Secteurs d&apos;activité
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-brand-cream mt-3 mb-4">
                  Pour qui est SafeAnalyse. ?
                </h2>
                <p className="text-brand-cream/60 max-w-xl mx-auto text-lg">
                  Conçu pour les PME qui travaillent dans des environnements à risques réels — pas pour les bureaux.
                </p>
              </div>
            </SectionReveal>

            <SectionReveal variant="fade-up" delay={0.1}>
              <SecteursCarousel />
            </SectionReveal>
          </div>
        </section>

        {/* ── 4. En chiffres — StatCounter ────────────────────────────── */}
        <section className="grain relative py-28 bg-brand-cream overflow-hidden">
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionReveal variant="fade-up">
              <div className="text-center mb-14">
                <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">
                  En chiffres
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mt-3">
                  Une couverture sérieuse, pas du vent.
                </h2>
              </div>
            </SectionReveal>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <SectionReveal variant="fade-up" delay={0.05}>
                <StatCounter value={20} label="risques ED 840 couverts" />
              </SectionReveal>
              <SectionReveal variant="fade-up" delay={0.15}>
                <StatCounter value={9} label="modules normés" />
              </SectionReveal>
              <SectionReveal variant="fade-up" delay={0.25}>
                <StatCounter value={14} suffix=" j" label="d'essai gratuit sans CB" />
              </SectionReveal>
              <SectionReveal variant="fade-up" delay={0.35}>
                <StatCounter value={40} suffix=" ans" label="de conservation automatique" />
              </SectionReveal>
            </div>
          </div>
        </section>

        {/* ── 5. Marquee confiance ────────────────────────────────────── */}
        <section className="py-10 bg-brand-navy-deep border-y border-white/5">
          <MarqueeStrip duration={36}>
            {trustPhrases.map((phrase) => (
              <span
                key={phrase}
                className="text-brand-cream/70 text-sm font-medium tracking-wide uppercase whitespace-nowrap"
              >
                <span className="text-brand-gold-light mr-3">◆</span>
                {phrase}
              </span>
            ))}
          </MarqueeStrip>
        </section>

        {/* ── 6. Pourquoi William ─────────────────────────────────────── */}
        <section className="py-24 bg-brand-cream-light">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionReveal variant="fade-up">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">

                {/* Portrait */}
                <div className="lg:col-span-2 flex justify-center">
                  <div className="relative">
                    <div className="w-72 h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden border-2 border-brand-sand shadow-[0_8px_30px_rgba(3,25,72,0.1)]">
                      <Image
                        src="/marketing/william-portrait-large.jpeg"
                        alt="William Maréchal — fondateur SafeAnalyse."
                        width={320}
                        height={320}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-3 -right-3 bg-brand-navy text-brand-cream text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                      Diplômé BUT HSE
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
            </SectionReveal>
          </div>
        </section>

        {/* ── 7. CTA final ─────────────────────────────────────────────── */}
        <section className="py-24 bg-brand-navy-deep text-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <SectionReveal variant="fade-up">
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
            </SectionReveal>
          </div>
        </section>

      </main>

      <MarketingFooter />
      <CookieBanner />
      <BackToTop />
    </>
  )
}
