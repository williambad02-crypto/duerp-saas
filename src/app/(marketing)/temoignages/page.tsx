import Link from 'next/link'
import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll'
import { ArrowRight, MessageSquare } from 'lucide-react'

export const metadata = {
  title: 'Témoignages — SafeAnalyse.',
  description:
    'Les premiers retours de clients SafeAnalyse. arrivent en 2026. Devenez client fondateur et bénéficiez d\'un accompagnement renforcé.',
}

export default function TemoignagesPage() {
  return (
    <div className="bg-brand-cream-light min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-brand-cream py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-hero-badge inline-flex items-center gap-2 bg-brand-gold-pale border border-brand-sand rounded-full px-4 py-1.5 text-sm text-brand-bronze mb-6 font-medium">
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
            Lancement 2026
          </div>
          <h1 className="animate-hero-title text-4xl sm:text-5xl font-extrabold text-brand-navy leading-tight mb-6">
            Ils nous font confiance
          </h1>
          <p className="animate-hero-sub text-lg text-brand-bronze max-w-xl mx-auto leading-relaxed">
            SafeAnalyse. accompagne ses premiers clients en 2026.
            Les retours arrivent bientôt.
          </p>
        </div>
      </section>

      {/* ── Encart honnête ───────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-up">
            <div className="bg-brand-off border border-brand-sand rounded-3xl p-12 text-center shadow-[0_2px_12px_rgba(3,25,72,0.06)]">
              <div className="w-16 h-16 rounded-2xl bg-brand-gold-pale flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-brand-gold" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-4">
                Vous serez peut-être le premier ?
              </h2>
              <p className="text-lg text-brand-ink-soft max-w-xl mx-auto mb-10 leading-relaxed">
                SafeAnalyse. accompagne ses premiers clients PME en 2026. En tant que
                client fondateur, vous bénéficiez d&apos;un accompagnement renforcé,
                d&apos;un accès prioritaire aux nouvelles fonctionnalités — et votre retour
                aidera à façonner l&apos;outil pour les suivants.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-brand-gold-light text-brand-navy-deep hover:bg-brand-gold font-semibold px-7 py-3 rounded-xl text-base transition-all hover:shadow-[0_4px_20px_rgba(184,134,11,0.3)]"
                >
                  Devenir client fondateur
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/outil"
                  className="inline-flex items-center justify-center gap-2 border border-brand-navy text-brand-navy hover:bg-brand-navy/5 font-medium px-7 py-3 rounded-xl text-base transition-all"
                >
                  Découvrir l&apos;outil
                </Link>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Pourquoi témoigner ───────────────────────────────────────── */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-up">
            <h2 className="text-2xl font-bold text-brand-navy text-center mb-10">
              Ce que vous gagnez en étant parmi les premiers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  titre: 'Accompagnement renforcé',
                  desc: 'Accès direct à William Maréchal pour poser vos questions, signaler vos besoins, être impliqué dans les décisions produit.',
                },
                {
                  titre: 'Tarif fondateur',
                  desc: 'Les premiers clients bénéficient d\'un tarif préférentiel garanti tant qu\'ils restent abonnés.',
                },
                {
                  titre: 'Impact réel',
                  desc: 'Votre feedback façonne l\'outil. Les fonctionnalités qui se retrouvent dans SafeAnalyse. viennent du terrain.',
                },
              ].map((item) => (
                <div
                  key={item.titre}
                  className="bg-brand-off border border-brand-sand rounded-2xl p-6 shadow-[0_1px_3px_rgba(3,25,72,0.04)]"
                >
                  <div className="w-2 h-2 rounded-full bg-brand-gold mb-4" />
                  <h3 className="font-bold text-brand-navy mb-2">{item.titre}</h3>
                  <p className="text-sm text-brand-ink-soft leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-navy-deep text-center">
        <div className="max-w-xl mx-auto px-4">
          <AnimateOnScroll animation="fade-up">
            <h2 className="text-2xl font-bold text-brand-cream mb-4">
              Une question avant de vous lancer ?
            </h2>
            <p className="text-brand-cream/60 mb-8">
              Je répondrai personnellement, sous 24 heures ouvrées.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-brand-gold-light text-brand-navy-deep hover:bg-brand-gold font-semibold px-8 py-3 rounded-xl transition-all"
            >
              Demander un échange
              <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

    </div>
  )
}
