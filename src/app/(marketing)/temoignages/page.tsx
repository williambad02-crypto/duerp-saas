import Link from 'next/link'
import { SectionReveal } from '@/components/marketing/ui'
import { HeroTemoignagesTitle } from '@/components/marketing/hero-temoignages-title'
import { TemoignagesGrid } from '@/components/marketing/temoignages-grid'
import { ArrowRight, MessageSquare, PenLine } from 'lucide-react'

export const metadata = {
  title: 'Témoignages — SafeAnalyse.',
  description:
    "Les retours de PME qui ont confié leur DUERP à SafeAnalyse. — agroalimentaire, BTP, artisanat, restauration.",
}

export default function TemoignagesPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── Hero — navy deep full-screen ─────────────────────────────── */}
      <section className="relative -mt-20 bg-brand-navy-deep min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-brand-navy-deep via-brand-navy-deep to-brand-navy-deep/95" />
        <div aria-hidden className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-brand-accent/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <HeroTemoignagesTitle />
          <p className="animate-hero-sub text-lg text-brand-cream/70 max-w-xl mx-auto leading-relaxed">
            Des PME agroalimentaires, du BTP, de la restauration ou de l&apos;artisanat —
            chacune avec ses risques, toutes avec la même envie : un DUERP fait sérieusement.
          </p>
        </div>
      </section>

      {/* ── Grille témoignages — cream-light ─────────────────────────── */}
      <section className="py-24 bg-brand-cream-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="text-center mb-12">
              <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">
                Retours clients
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mt-3">
                Ce qu&apos;ils en disent
              </h2>
            </div>
          </SectionReveal>

          <TemoignagesGrid />
        </div>
      </section>

      {/* ── Laisser un avis — navy deep avec mini formulaire ────────── */}
      <section className="py-24 bg-brand-navy-deep">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="relative rounded-3xl p-[1.5px] bg-gradient-to-br from-brand-gold/70 via-brand-accent-dark/40 to-brand-gold/30 shadow-[0_30px_80px_-20px_rgba(184,134,11,0.3)]">
              <div className="relative bg-brand-navy rounded-[calc(1.5rem-1px)] px-8 py-10 md:px-12 md:py-12 overflow-hidden">
                <div aria-hidden className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />

                <div className="relative">
                  <div className="flex items-start gap-5 mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 text-brand-gold-light shrink-0">
                      <PenLine className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-brand-cream mb-2">
                        Vous êtes client ? <span className="text-brand-gold-light">Partagez votre expérience.</span>
                      </h2>
                      <p className="text-brand-cream/65 leading-relaxed">
                        Un retour bref, honnête, qui aidera d&apos;autres PME à faire le bon choix.
                        Publication après relecture et accord de votre part.
                      </p>
                    </div>
                  </div>

                  <form action="/contact" method="get" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="hidden" name="sujet" value="temoignage" />
                    <input
                      name="nom"
                      type="text"
                      required
                      placeholder="Votre nom / rôle"
                      className="bg-white/[0.06] border border-white/10 focus:border-brand-gold/50 focus:bg-white/[0.08] rounded-xl px-4 py-3 text-sm text-brand-cream placeholder:text-brand-cream/35 outline-none transition-colors"
                    />
                    <input
                      name="entreprise"
                      type="text"
                      placeholder="Entreprise"
                      className="bg-white/[0.06] border border-white/10 focus:border-brand-gold/50 focus:bg-white/[0.08] rounded-xl px-4 py-3 text-sm text-brand-cream placeholder:text-brand-cream/35 outline-none transition-colors"
                    />
                    <textarea
                      name="message"
                      required
                      rows={4}
                      placeholder="Votre témoignage — en quelques lignes, ce que SafeAnalyse. vous a apporté."
                      className="sm:col-span-2 bg-white/[0.06] border border-white/10 focus:border-brand-gold/50 focus:bg-white/[0.08] rounded-xl px-4 py-3 text-sm text-brand-cream placeholder:text-brand-cream/35 outline-none transition-colors resize-none"
                    />
                    <button
                      type="submit"
                      className="sm:col-span-2 inline-flex items-center justify-center gap-2 bg-brand-gold-light text-brand-navy-deep hover:bg-brand-gold font-semibold px-6 py-3.5 rounded-xl text-sm transition-all hover:shadow-[0_10px_30px_-6px_rgba(184,134,11,0.5)]"
                    >
                      Envoyer mon témoignage
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── CTA final — cream-light avec carte premium navy ─────────── */}
      <section className="py-24 bg-brand-cream-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionReveal variant="fade-up">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-gold-pale text-brand-gold mb-5">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">
              Rejoignez-les
            </h2>
            <p className="text-brand-ink-soft mb-8 leading-relaxed">
              14 jours d&apos;essai gratuit, sans carte bancaire. Un échange de 20 min avec William si vous avez des questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 bg-brand-navy text-brand-cream hover:bg-brand-navy-light font-semibold px-7 py-3.5 rounded-xl transition-all hover:shadow-[0_10px_30px_-8px_rgba(3,25,72,0.4)]"
              >
                Démarrer l&apos;essai
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border border-brand-navy/40 text-brand-navy hover:bg-brand-navy/5 font-medium px-7 py-3.5 rounded-xl transition-all"
              >
                Demander un échange
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

    </div>
  )
}
