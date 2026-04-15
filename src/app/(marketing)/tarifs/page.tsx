import Link from 'next/link'
import { SectionReveal, StatCounter } from '@/components/marketing/ui'
import { HeroTarifsTitle } from '@/components/marketing/hero-tarifs-title'
import { TarifsComparatif } from '@/components/marketing/tarifs-comparatif'
import { TarifsPlans } from './tarifs-plans'
import { ArrowRight, MapPin, Phone, HelpCircle } from 'lucide-react'

export const metadata = {
  title: "Tarifs — SafeAnalyse.",
  description: "Pack Industrie à 99 €/mois, Pack Premium à 149 €/mois. 14 jours d'essai gratuit. Découvrez aussi notre prestation consulting DUERP sur site en Morbihan.",
}

export default function TarifsPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── Hero — navy deep full-screen ─────────────────────────────── */}
      <section className="relative -mt-20 bg-brand-navy-deep min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-brand-navy-deep via-brand-navy-deep to-brand-navy-deep/90" />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <HeroTarifsTitle />
          <p className="animate-hero-sub text-lg text-brand-cream/70 max-w-2xl mx-auto leading-relaxed">
            Pas de devis caché, pas d&apos;option à 50&nbsp;€. Vous payez ce qui est affiché, et tout est inclus.
          </p>
        </div>
      </section>

      {/* ── Plans SaaS — fond crème clair ─────────────────────────── */}
      <section className="grain py-24 bg-brand-cream-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="text-center mb-10">
              <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">
                Abonnement SaaS
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mt-3">Choisissez votre plan</h2>
            </div>
          </SectionReveal>
          <SectionReveal variant="fade-up" delay={0.1}>
            <TarifsPlans />
          </SectionReveal>
        </div>
      </section>

      {/* ── Consulting — fond navy deep, carte premium en relief ──── */}
      <section className="py-24 bg-brand-navy-deep">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="relative rounded-3xl p-[1.5px] bg-gradient-to-br from-brand-gold via-brand-accent-dark/50 to-brand-gold/40 shadow-[0_30px_80px_-20px_rgba(184,134,11,0.35)]">
              <div className="relative bg-brand-navy rounded-[calc(1.5rem-1px)] p-8 md:p-12 overflow-hidden">

                {/* Décoration radiale */}
                <div aria-hidden className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
                <div aria-hidden className="absolute -bottom-20 -left-24 w-64 h-64 rounded-full bg-brand-accent/10 blur-3xl pointer-events-none" />

                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

                  {/* Texte gauche */}
                  <div>
                    <span className="inline-block bg-brand-gold/20 text-brand-gold-light text-[11px] font-extrabold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
                      Prestation consulting
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-brand-cream mb-4 leading-[1.1]">
                      Je viens faire le DUERP<br />avec vous, <span className="text-brand-gold-light">sur site</span>.
                    </h2>
                    <p className="text-brand-cream/70 text-sm md:text-base leading-relaxed mb-6">
                      Besoin d&apos;un regard expert ? William se déplace dans votre entreprise pour réaliser l&apos;évaluation des risques à vos côtés, directement dans l&apos;outil. À la fin, votre DUERP est rédigé, validé et signable.
                    </p>
                    <div className="flex flex-col gap-2 text-sm text-brand-cream/60">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-gold shrink-0" />
                        <span>Morbihan &amp; Bretagne sud — déplacement inclus dans le tarif</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-brand-gold shrink-0" />
                        <span>En dehors du 56 : barème kilométrique URSSAF</span>
                      </div>
                    </div>
                  </div>

                  {/* Prix + inclus */}
                  <div className="flex flex-col gap-5">
                    <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                      <div className="mb-2">
                        <div className="inline-flex items-center gap-2 bg-brand-gold/15 border border-brand-gold/30 text-brand-gold-light text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full mb-3">
                          Offre de lancement
                        </div>
                        <div className="flex items-baseline gap-3">
                          <StatCounter
                            value={700}
                            suffix="€"
                            label="par jour"
                            className="[&>div:first-child]:!text-brand-cream [&>div:first-child]:!text-5xl [&>div:last-child]:!text-brand-cream/55"
                          />
                          <span className="text-lg font-semibold text-brand-cream/40 line-through">2 000 €</span>
                        </div>
                      </div>
                      <p className="text-xs text-brand-gold-light/80 font-semibold mb-5">Valable jusqu&apos;à fin 2026</p>
                      <ul className="space-y-2.5">
                        {[
                          '2 ans de Pack Premium offerts',
                          'DUERP complet livré en fin de mission',
                          "Formation à l'outil incluse",
                          'Facture professionnelle déductible',
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-2 text-xs text-brand-cream/85">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold-light text-brand-navy-deep font-bold px-6 py-3.5 rounded-xl text-sm transition-all hover:shadow-[0_10px_30px_-6px_rgba(184,134,11,0.7)]"
                    >
                      Demander un devis gratuit
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── Tableau comparatif — cream clair, rythme avec le consulting ─ */}
      <section className="py-24 bg-brand-cream-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="text-center mb-12">
              <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">
                Vue d&apos;ensemble
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mt-3">
                Qu&apos;est-ce qui est inclus dans chaque offre ?
              </h2>
              <p className="mt-3 text-brand-bronze max-w-xl mx-auto">
                Trois manières d&apos;aborder votre DUERP — du plus autonome au plus accompagné.
              </p>
            </div>
          </SectionReveal>

          <TarifsComparatif />
        </div>
      </section>

      {/* ── Lien vers FAQ — fond crème, séparation claire ──────────── */}
      <section className="py-20 bg-brand-cream">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionReveal variant="fade-up">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-gold-pale text-brand-gold mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-3">
              Vous avez des questions ?
            </h2>
            <p className="text-brand-ink-soft mb-7 leading-relaxed">
              Essai, résiliation, changement de plan, consulting sur site — toutes les réponses sont regroupées dans la FAQ.
            </p>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 bg-brand-navy text-brand-cream hover:bg-brand-navy-light font-semibold px-7 py-3 rounded-xl text-sm transition-all hover:shadow-[0_10px_30px_-8px_rgba(3,25,72,0.4)]"
            >
              Consulter la FAQ
              <ArrowRight className="w-4 h-4" />
            </Link>
          </SectionReveal>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-navy-deep text-center">
        <div className="max-w-xl mx-auto px-4">
          <SectionReveal>
            <h2 className="text-2xl font-bold text-brand-cream mb-3">Toujours hésitant ? Discutons-en.</h2>
            <p className="text-brand-cream/70 mb-8 text-sm leading-relaxed">
              Pas de script, pas de commercial. William répond directement à vos questions par email ou en visio 15 min.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/signup"
                className="inline-block bg-brand-gold hover:bg-brand-gold-light text-brand-navy-deep font-bold px-8 py-3 rounded-xl transition text-sm"
              >
                Démarrer l&apos;essai gratuit →
              </Link>
              <Link
                href="/contact"
                className="inline-block border border-brand-cream/30 text-brand-cream hover:bg-brand-cream/10 font-semibold px-8 py-3 rounded-xl transition text-sm"
              >
                Poser une question
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

    </div>
  )
}
