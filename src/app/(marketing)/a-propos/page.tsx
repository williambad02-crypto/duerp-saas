import Link from 'next/link'
import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll'

export const metadata = {
  title: "Qui je suis — SafeAnalyse.",
  description: "William Maréchal, diplômé BUT HSE, a créé SafeAnalyse. pour simplifier l'accès au DUERP pour les PME françaises. Un professionnel HSE qui code, pas un développeur qui a lu la loi.",
}

export default function AProposPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-brand-cream py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="animate-hero-badge inline-flex items-center gap-2 bg-brand-gold-pale border border-brand-sand rounded-full px-4 py-1.5 text-sm text-brand-bronze mb-6 font-medium">
                BUT HSE · Consultant · Fondateur
              </div>
              <h1 className="animate-hero-title text-4xl font-extrabold text-brand-navy leading-tight mb-6">
                Un professionnel HSE qui a codé son propre outil
              </h1>
              <p className="animate-hero-sub text-lg text-brand-bronze leading-relaxed">
                SafeAnalyse. n&apos;est pas né dans une salle de réunion. Il est né de la frustration de terrain : les outils existants sont trop techniques, trop chers, ou trop génériques pour les PME.
              </p>
            </div>
            {/* Avatar placeholder */}
            <div className="animate-hero-sub flex justify-center md:justify-end">
              <div className="w-48 h-48 rounded-2xl bg-brand-navy flex items-center justify-center shadow-[0_8px_32px_rgba(3,25,72,0.15)]">
                <span className="text-6xl font-bold text-brand-cream">W</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">

        {/* ── Qui je suis ───────────────────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Mon parcours</h2>
            <div className="space-y-5 text-brand-bronze leading-relaxed">
              <p>
                Je m&apos;appelle <strong className="text-brand-navy">William Maréchal</strong>. Je suis diplômé du BUT Hygiène Sécurité Environnement, une formation en trois ans qui couvre l&apos;ensemble des risques professionnels : physiques, chimiques, biologiques, psychosociaux, réglementaires.
              </p>
              <p>
                En stage et en alternance, j&apos;ai accompagné des PME dans la réalisation de leur DUERP. J&apos;ai vu de près le problème : les dirigeants veulent être conformes, mais les outils disponibles sont soit trop complexes pour être utilisés sans expertise, soit trop chers pour être rentables à leur échelle.
              </p>
              <p>
                SafeAnalyse. est ma réponse à ce manque. Un outil pensé par un professionnel HSE, pas par un développeur qui a lu la réglementation en diagonale. Chaque module, chaque grille de cotation, chaque formulation s&apos;appuie sur des normes réelles (INRS, ANSES, Code du travail).
              </p>
            </div>
          </div>
        </AnimateOnScroll>

        {/* ── Pourquoi avoir créé l'outil ───────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Pourquoi avoir créé SafeAnalyse. ?</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Les cabinets HSE ? Trop chers.",
                  r: "500 à 2 000 € par DUERP, document livré mais pas compris, pas mis à jour l'année suivante. La PME reste dépendante."
                },
                {
                  q: "Les outils gratuits ? Trop techniques.",
                  r: "Seirich, Oira et consorts sont puissants mais conçus pour des ingénieurs HSE. Pas pour le gérant d'un garage ou d'un restaurant."
                },
                {
                  q: "Les templates Word/Excel ? Trop légers.",
                  r: "Aucun guidage, risque de non-conformité, pas de versioning, pas de PDF structuré. La case est cochée mais rien n'est vraiment fait."
                },
              ].map((item, i) => (
                <div key={i} className="rounded-xl bg-brand-cream border border-brand-sand p-4">
                  <p className="font-semibold text-brand-navy mb-1">{item.q}</p>
                  <p className="text-sm text-brand-bronze">{item.r}</p>
                </div>
              ))}
              <div className="rounded-xl bg-brand-gold-pale border border-brand-sand p-4">
                <p className="font-semibold text-brand-navy mb-1">SafeAnalyse. ? Le bon milieu.</p>
                <p className="text-sm text-brand-bronze">Guidé comme un cabinet, autonome comme un outil, accessible comme un SaaS. Avec en option un accompagnement sur site si vous préférez être aidé.</p>
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        {/* ── Consulting ────────────────────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-4">L&apos;accompagnement sur site</h2>
            <p className="text-brand-bronze leading-relaxed mb-6">
              Certains dirigeants préfèrent être guidés en personne. Je me déplace dans votre entreprise pour réaliser l&apos;évaluation des risques avec vous, directement dans l&apos;outil. Vous repartez avec votre DUERP rempli, votre PDF exporté, et 1 an d&apos;accès à SafeAnalyse. pour les mises à jour suivantes.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { eff: "1-10 salariés", prix: "500 €", duree: "Demi-journée" },
                { eff: "11-25 salariés", prix: "800 €", duree: "1 jour" },
                { eff: "26-50 salariés", prix: "1 200 €", duree: "1-2 jours" },
                { eff: "51-100 salariés", prix: "1 800 €", duree: "2-3 jours" },
              ].map((item, i) => (
                <div key={i} className="rounded-xl bg-brand-cream border border-brand-sand p-3 text-center">
                  <p className="text-xs text-brand-bronze mb-1">{item.eff}</p>
                  <p className="text-lg font-bold text-brand-navy">{item.prix}</p>
                  <p className="text-xs text-brand-bronze/60">{item.duree}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-brand-bronze/60 mt-3">
              Prestation + 1 an SafeAnalyse. inclus · Majoration BTP/industrie/chimie : +20 à 40%
            </p>
          </div>
        </AnimateOnScroll>

        {/* ── Approche ──────────────────────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Mon approche</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  titre: "Méthodes normées",
                  desc: "Chaque module s'appuie sur les publications de l'INRS (ED840, ED6035, ED6161) et les normes en vigueur (ISO 9612 pour le bruit). Pas d'interprétation personnelle.",
                },
                {
                  titre: "Langage accessible",
                  desc: "Le DUERP est une obligation technique, pas un outil de spécialiste. Je traduis chaque notion réglementaire en langage compréhensible par tout dirigeant.",
                },
                {
                  titre: "Vision terrain",
                  desc: "Les PME ont besoin d'un outil qu'elles peuvent utiliser seules, depuis un téléphone ou une tablette, en quelques heures — pas en quelques semaines.",
                },
              ].map((item, i) => (
                <div key={i}>
                  <div className="w-2 h-2 rounded-full bg-brand-gold mb-3" />
                  <p className="font-semibold text-brand-navy mb-2">{item.titre}</p>
                  <p className="text-sm text-brand-bronze leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

      </div>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-navy text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-brand-cream mb-4">Vous avez des questions ?</h2>
          <p className="text-brand-cream/70 mb-8">Je réponds personnellement à chaque message.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-block border border-brand-cream text-brand-cream hover:bg-brand-cream/10 font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Me contacter
            </Link>
            <Link
              href="/auth/signup"
              className="inline-block bg-brand-gold hover:bg-brand-gold-light text-brand-off font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Essayer gratuitement →
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
