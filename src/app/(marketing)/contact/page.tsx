import Link from 'next/link'
import { ContactForm } from "./contact-form"

export const metadata = {
  title: "Contact — SafeAnalyse.",
  description: "Une question sur SafeAnalyse. ou une demande de devis pour un accompagnement sur site ? Contactez William Maréchal directement.",
}

export default function ContactPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-brand-cream py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-hero-badge inline-flex items-center gap-2 bg-brand-gold-pale border border-brand-sand rounded-full px-4 py-1.5 text-sm text-brand-bronze mb-6 font-medium">
            Réponse personnelle sous 24h
          </div>
          <h1 className="animate-hero-title text-4xl font-extrabold text-brand-navy leading-tight mb-4">
            Parlons-nous
          </h1>
          <p className="animate-hero-sub text-lg text-brand-bronze max-w-xl mx-auto leading-relaxed">
            Une question, un devis consulting, ou juste un retour sur l&apos;outil ?
            Je réponds personnellement à chaque message.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Formulaire — col principale */}
          <div className="md:col-span-3">
            <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
              <h2 className="text-xl font-bold text-brand-navy mb-6">Envoyer un message</h2>
              <ContactForm />
            </div>
          </div>

          {/* Infos latérales */}
          <div className="md:col-span-2 space-y-4">

            {/* Consulting rapide */}
            <div className="bg-brand-navy text-brand-cream rounded-2xl p-6">
              <div className="w-8 h-8 rounded-lg bg-brand-gold/20 text-brand-gold flex items-center justify-center mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-brand-cream mb-2">Demande de devis consulting</h3>
              <p className="text-sm text-brand-cream/70 leading-relaxed mb-4">
                Précisez votre effectif, votre secteur d&apos;activité et la région — je vous ferai parvenir un devis sous 48h.
              </p>
              <div className="space-y-2 text-xs text-brand-cream/60">
                {[
                  "1–10 salariés · 500 €",
                  "11–25 salariés · 800 €",
                  "26–50 salariés · 1 200 €",
                  "51–100 salariés · 1 800 €",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-brand-gold" />
                    {item}
                  </div>
                ))}
                <p className="mt-2 text-brand-cream/40 italic">1 an SafeAnalyse. inclus · BTP/industrie +20-40%</p>
              </div>
            </div>

            {/* Contact direct */}
            <div className="bg-brand-off border border-brand-sand rounded-2xl p-6">
              <h3 className="font-semibold text-brand-navy mb-4">Contact direct</h3>
              <div className="space-y-3">
                <a
                  href="mailto:contact@safeanalyse.fr"
                  className="flex items-center gap-3 text-sm text-brand-bronze hover:text-brand-navy transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-gold-pale text-brand-gold flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  contact@safeanalyse.fr
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-sm text-brand-bronze hover:text-brand-navy transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-gold-pale text-brand-gold flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Essai gratuit nudge */}
            <div className="bg-brand-gold-pale border border-brand-sand rounded-2xl p-6 text-center">
              <p className="text-sm font-semibold text-brand-navy mb-2">Pas encore inscrit ?</p>
              <p className="text-xs text-brand-bronze mb-4">14 jours gratuits, sans carte bancaire.</p>
              <Link
                href="/auth/signup"
                className="inline-block text-sm font-semibold bg-brand-gold hover:bg-brand-gold-light text-brand-off px-5 py-2 rounded-lg transition-colors"
              >
                Essayer gratuitement →
              </Link>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
