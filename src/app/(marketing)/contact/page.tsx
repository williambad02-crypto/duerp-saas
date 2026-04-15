import { ContactForm } from "./contact-form"
import { SectionReveal } from '@/components/marketing/ui'
import { HeroContactTitle } from '@/components/marketing/hero-contact-title'
import { Clock, MapPin, MessageCircle, Mail } from 'lucide-react'

export const metadata = {
  title: 'Contact — SafeAnalyse.',
  description:
    'Discutons de votre DUERP. William Maréchal répond personnellement à chaque message sous 24 heures ouvrées.',
}

export default function ContactPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── Hero — navy deep full-screen ─────────────────────────────── */}
      <section className="relative -mt-20 bg-brand-navy-deep min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-brand-navy-deep via-brand-navy-deep to-brand-navy-deep/95" />
        <div aria-hidden className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-brand-accent/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <HeroContactTitle />
          <p className="animate-hero-sub text-lg text-brand-cream/70 max-w-xl mx-auto leading-relaxed">
            Une question sur SafeAnalyse., une demande d&apos;accompagnement sur site, ou juste un retour ?
            Je réponds à chaque message <span className="text-brand-gold-light font-semibold">personnellement</span>, sous 24 h ouvrées.
          </p>
        </div>
      </section>

      {/* ── Formulaire + sidebar — cream-light ───────────────────────── */}
      <section className="py-24 bg-brand-cream-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">

            {/* Formulaire — col principale */}
            <SectionReveal variant="fade-up" className="lg:col-span-3">
              <div className="bg-brand-off border border-brand-sand rounded-3xl p-8 md:p-10 shadow-[0_10px_40px_-18px_rgba(3,25,72,0.15)]">
                <h2 className="text-2xl font-bold text-brand-navy mb-2">Envoyer un message</h2>
                <p className="text-sm text-brand-ink-soft mb-6">
                  Tous les champs sont requis. Pas de spam, promis.
                </p>
                <ContactForm />
              </div>
            </SectionReveal>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-5">

              {/* Promesses — carte premium navy */}
              <SectionReveal variant="fade-up" delay={0.1}>
                <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-brand-gold/60 via-brand-accent-dark/30 to-brand-gold/20 shadow-[0_18px_40px_-20px_rgba(184,134,11,0.3)]">
                  <div className="relative bg-brand-navy rounded-[calc(1rem-1px)] p-6 overflow-hidden">
                    <div aria-hidden className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
                    <h3 className="relative font-semibold text-brand-cream mb-5 text-sm uppercase tracking-widest">
                      Ce que vous pouvez attendre
                    </h3>
                    <div className="relative space-y-4">
                      {[
                        { icon: MessageCircle, titre: 'Réponse personnelle', desc: 'Chaque message lu et répondu par William, pas par un bot.' },
                        { icon: Clock, titre: 'Sous 24 h ouvrées', desc: 'Du lundi au vendredi. Urgences : précisez-le dans le message.' },
                        { icon: MapPin, titre: 'Déplacement possible', desc: 'Morbihan & Bretagne sud sans frais — au-delà, barème kilométrique.' },
                      ].map((item) => {
                        const Icon = item.icon
                        return (
                          <div key={item.titre} className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-brand-gold/15 border border-brand-gold/30 text-brand-gold-light flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-brand-cream mb-0.5">{item.titre}</p>
                              <p className="text-xs text-brand-cream/60 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </SectionReveal>

              {/* Contact direct */}
              <SectionReveal variant="fade-up" delay={0.15}>
                <div className="bg-brand-off border border-brand-sand rounded-2xl p-6">
                  <h3 className="font-semibold text-brand-navy mb-4 text-sm uppercase tracking-widest">Contact direct</h3>
                  <div className="space-y-3">
                    <a
                      href="mailto:contact@safeanalyse.fr"
                      className="flex items-center gap-3 text-sm text-brand-ink-soft hover:text-brand-navy transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-brand-gold-pale text-brand-gold flex items-center justify-center shrink-0 group-hover:bg-brand-gold group-hover:text-brand-off transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      contact@safeanalyse.fr
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 text-sm text-brand-ink-soft hover:text-brand-navy transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-brand-gold-pale text-brand-gold flex items-center justify-center shrink-0 group-hover:bg-brand-gold group-hover:text-brand-off transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </div>
                      LinkedIn — William Maréchal
                    </a>
                  </div>
                </div>
              </SectionReveal>

            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
