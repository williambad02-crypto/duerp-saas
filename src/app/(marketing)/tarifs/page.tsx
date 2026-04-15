import Link from 'next/link'
import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll'
import { Accordion, type AccordionItem } from '@/components/ui/accordion'
import { TarifsPlans } from './tarifs-plans'
import { Shield, CalendarCheck, FileCheck, ArrowRight, MapPin, Phone } from 'lucide-react'

export const metadata = {
  title: "Tarifs — SafeAnalyse.",
  description: "Pack Industrie à 99 €/mois, Pack Premium à 149 €/mois. 14 jours d'essai gratuit. Découvrez aussi notre prestation consulting DUERP sur site en Morbihan.",
}

const faqItems: AccordionItem[] = [
  {
    id: 'essai',
    question: "L'essai gratuit est-il vraiment gratuit ?",
    reponse: "Oui, totalement. Aucune carte bancaire n'est demandée lors de l'inscription. Vous avez 14 jours d'accès complet selon le plan choisi. À l'issue de l'essai, vous choisissez si vous souhaitez vous abonner.",
  },
  {
    id: 'apres-essai',
    question: "Que se passe-t-il après les 14 jours ?",
    reponse: "Votre compte passe en mode consultation : vous pouvez voir vos données mais ne pouvez plus modifier ni exporter. Dès que vous vous abonnez, tout redevient accessible immédiatement.",
  },
  {
    id: 'difference-plans',
    question: "Quelle est la différence concrète entre Pack Industrie et Pack Premium ?",
    reponse: "Le Pack Industrie couvre les PME jusqu'à 50 salariés avec 5 postes de travail et 20 opérations — suffisant pour la grande majorité des TPE/PME. Le Pack Premium est pensé pour les entreprises plus importantes : postes et opérations illimités, audit semestriel en visio 1h avec William, onboarding personnalisé, et un accès prioritaire au support (réponse en 4h ouvrées).",
  },
  {
    id: 'annulation',
    question: "Puis-je annuler à tout moment ?",
    reponse: "Oui. L'abonnement mensuel peut être annulé à tout moment, sans préavis. Vous conservez l'accès jusqu'à la fin de la période payée. Pour l'abonnement annuel, l'annulation prend effet à la date de renouvellement. Vos données restent accessibles en lecture.",
  },
  {
    id: 'upgrade',
    question: "Puis-je passer du Pack Industrie au Pack Premium en cours d'abonnement ?",
    reponse: "Oui, depuis votre espace client (portail Stripe). Le changement est immédiat et vous n'êtes facturé que pour la différence au prorata du temps restant.",
  },
  {
    id: 'consulting-saas',
    question: "La prestation consulting est-elle séparée du SaaS ?",
    reponse: "La prestation consulting inclut 2 ans d'abonnement SafeAnalyse. Pack Premium. Vous n'avez rien à payer en plus. La 3e année, vous renouvelez l'abonnement seul ou commandez une nouvelle mise à jour.",
  },
  {
    id: 'facturation',
    question: "Comment fonctionne la facturation ?",
    reponse: "Paiement par carte bancaire via Stripe (sécurisé PCI-DSS). Facturation mensuelle ou annuelle selon votre choix. Facture téléchargeable dans votre espace client. Pour les comptes annuels, un paiement par virement sur facture est possible — contactez-nous.",
  },
  {
    id: 'donnees',
    question: "Mes données sont-elles en sécurité ? Qui y a accès ?",
    reponse: "Vos données sont stockées sur des serveurs Supabase (PostgreSQL) avec isolation stricte par entreprise. Seul vous y avez accès. Les données sont conservées 40 ans conformément au Code du travail. William ne consulte jamais vos données sans votre accord explicite.",
  },
]

export default function TarifsPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-brand-cream py-20 pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-hero-badge inline-flex items-center gap-2 bg-brand-gold-pale border border-brand-sand rounded-full px-4 py-1.5 text-sm text-brand-bronze mb-6 font-medium">
            14 jours gratuits · Sans carte bancaire · Annulable à tout moment
          </div>
          <h1 className="animate-hero-title text-4xl sm:text-5xl font-extrabold text-brand-navy leading-tight mb-5">
            Un accompagnement sérieux,<br className="hidden sm:block" /> à un tarif transparent.
          </h1>
          <p className="animate-hero-sub text-lg text-brand-bronze max-w-2xl mx-auto leading-relaxed mb-14">
            Pas de devis caché, pas d&apos;option à 50&nbsp;€. Vous payez ce qui est affiché, et tout est inclus.
          </p>
        </div>
      </section>

      {/* ── Plans SaaS ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-up">
            <TarifsPlans />
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Garanties ─────────────────────────────────────────────────────── */}
      <section className="py-14 bg-brand-cream-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-up">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <div className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Essai 14 jours</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Sans CB. Annulable à tout moment. Vos données restent disponibles.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Sans engagement</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Résiliable en un clic. Pas de préavis sur le mensuel.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Conformité garantie</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Méthodes INRS (ED 840). PDF prêt pour l&apos;inspection du travail.</p>
                </div>
              </div>

            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Consulting ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-up">
            <div className="bg-brand-navy-deep rounded-3xl p-8 md:p-10 overflow-hidden relative">

              {/* Décoration */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-gold/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/3 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                {/* Texte gauche */}
                <div>
                  <span className="inline-block bg-brand-gold/20 text-brand-gold text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                    Prestation consulting
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight">
                    Je viens faire le DUERP<br />avec vous, sur site.
                  </h2>
                  <p className="text-brand-cream/70 text-sm leading-relaxed mb-5">
                    Besoin d&apos;un regard expert ? William se déplace dans votre entreprise pour réaliser l&apos;évaluation des risques à vos côtés, directement dans l&apos;outil. À la fin, votre DUERP est rédigé, validé et signable.
                  </p>
                  <div className="flex flex-col gap-2 text-sm text-brand-cream/60">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-gold shrink-0" />
                      <span>Morbihan & Bretagne sud — déplacement inclus dans le tarif</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-brand-gold shrink-0" />
                      <span>En dehors du 56 : barème kilométrique URSSAF</span>
                    </div>
                  </div>
                </div>

                {/* Prix + inclus */}
                <div className="flex flex-col gap-5">
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-extrabold text-white">700€</span>
                      <span className="text-brand-cream/60">/jour</span>
                    </div>
                    <p className="text-xs text-brand-cream/50 mb-4">Tarif lancement · 1 000 €/jour dès septembre 2026</p>
                    <ul className="space-y-2">
                      {[
                        '2 ans de Pack Premium offerts',
                        'DUERP complet livré en fin de mission',
                        'Formation à l\'outil incluse',
                        'Facture professionnelle déductible',
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-xs text-brand-cream/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold-light text-brand-off font-bold px-6 py-3 rounded-xl text-sm transition"
                  >
                    Demander un devis gratuit
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-brand-cream-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy text-center mb-10">
              Questions fréquentes
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up">
            <div className="bg-white rounded-2xl border border-brand-sand shadow-sm px-6 py-2">
              <Accordion items={faqItems} defaultOpen="essai" />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-navy text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-brand-cream mb-3">Toujours hésitant ? Discutons-en.</h2>
          <p className="text-brand-cream/70 mb-8 text-sm leading-relaxed">
            Pas de script, pas de commercial. William répond directement à vos questions par email ou en visio 15 min.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="inline-block bg-brand-gold hover:bg-brand-gold-light text-brand-off font-bold px-8 py-3 rounded-xl transition text-sm"
            >
              Démarrer l&apos;essai gratuit →
            </Link>
            <Link
              href="/contact"
              className="inline-block border border-brand-cream/30 text-brand-cream hover:bg-white/10 font-semibold px-8 py-3 rounded-xl transition text-sm"
            >
              Poser une question
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
