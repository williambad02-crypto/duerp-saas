import { ContactForm } from "./contact-form"
import { Clock, MapPin, MessageCircle } from 'lucide-react'

export const metadata = {
  title: 'Contact — SafeAnalyse.',
  description:
    'Discutons de votre DUERP. William Maréchal répond personnellement à chaque message sous 24 heures ouvrées.',
}

export default function ContactPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-brand-cream py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-hero-badge inline-flex items-center gap-2 bg-brand-gold-pale border border-brand-sand rounded-full px-4 py-1.5 text-sm text-brand-bronze mb-6 font-medium">
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
            Réponse personnelle sous 24h ouvrées
          </div>
          <h1 className="animate-hero-title text-4xl font-extrabold text-brand-navy leading-tight mb-4">
            Discutons de votre DUERP
          </h1>
          <p className="animate-hero-sub text-lg text-brand-bronze max-w-xl mx-auto leading-relaxed">
            Une question sur SafeAnalyse., une demande d&apos;accompagnement sur site, ou juste
            un retour ? Je réponds à chaque message personnellement.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* ── Formulaire — col principale ──────────────────────────── */}
          <div className="md:col-span-3">
            <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
              <h2 className="text-xl font-bold text-brand-navy mb-6">Envoyer un message</h2>
              <ContactForm />
            </div>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <div className="md:col-span-2 space-y-4">

            {/* Promesses de réponse */}
            <div className="bg-brand-navy text-brand-cream rounded-2xl p-6">
              <h3 className="font-semibold text-brand-cream mb-4">Ce que vous pouvez attendre</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-gold/20 text-brand-gold flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-cream mb-0.5">Réponse personnelle</p>
                    <p className="text-xs text-brand-cream/60 leading-relaxed">
                      Chaque message est lu et répondu par William Maréchal, pas par un bot.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-gold/20 text-brand-gold flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-cream mb-0.5">Sous 24 heures ouvrées</p>
                    <p className="text-xs text-brand-cream/60 leading-relaxed">
                      Du lundi au vendredi. Pour les urgences, précisez-le dans votre message.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-gold/20 text-brand-gold flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-cream mb-0.5">Déplacement possible</p>
                    <p className="text-xs text-brand-cream/60 leading-relaxed">
                      Morbihan et Bretagne sud sans frais supplémentaires. Au-delà, barème kilométrique.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Consulting sur site */}
            <div className="bg-brand-off border border-brand-sand rounded-2xl p-6">
              <h3 className="font-semibold text-brand-navy mb-3">Accompagnement sur site</h3>
              <p className="text-sm text-brand-bronze leading-relaxed mb-4">
                Je me déplace dans votre entreprise pour réaliser le DUERP avec vous, directement dans
                SafeAnalyse. Vous repartez avec votre PDF finalisé.
              </p>
              <div className="space-y-2 text-xs text-brand-bronze">
                <div className="flex items-center justify-between border-b border-brand-sand pb-2">
                  <span>Tarif journalier (lancement 2026)</span>
                  <span className="font-bold text-brand-navy">700 €/jour</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>2 ans Pack Premium inclus</span>
                  <span className="font-medium text-brand-navy">offerts</span>
                </div>
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
                  LinkedIn — William Maréchal
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
