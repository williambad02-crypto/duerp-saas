import Link from 'next/link'
import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll'
import { ArrowRight, MapPin, Flame, GraduationCap, Factory } from 'lucide-react'

export const metadata = {
  title: 'Qui je suis — SafeAnalyse.',
  description:
    'William Maréchal, futur diplômé BUT HSE, a créé SafeAnalyse. pour simplifier le DUERP des PME industrielles. Un professionnel HSE qui code, pas un développeur qui a lu la loi.',
}

const valeurs = [
  {
    titre: 'Méthodes normées, langage simple',
    desc: "Chaque module s'appuie sur les publications INRS (ED840, ED6035) et les normes en vigueur (ISO 9612). Je traduis chaque notion réglementaire en langage compréhensible par tout dirigeant de PME.",
  },
  {
    titre: 'Terrain avant tout',
    desc: "J'ai vu des DUERP Word de 3 pages qui ne correspondaient à aucun poste réel. SafeAnalyse. est construit pour l'usage terrain : tablette en atelier, 2 heures de travail, PDF prêt à signer.",
  },
  {
    titre: 'Honnêteté sur les limites',
    desc: "L'outil guide, il ne se substitue pas à votre connaissance de vos postes de travail. Pour les situations complexes — industrie lourde, chimique, multisite — l'accompagnement sur site reste la meilleure option.",
  },
]

const domainesIntervention = [
  'Agroalimentaire (production, conditionnement, stockage)',
  'Industries mécaniques et métallurgiques',
  'BTP et gros œuvre',
  'Restauration et cuisine professionnelle',
  'Logistique et entrepôts',
  'Artisanat (boulangerie, charcuterie, menuiserie…)',
]

export default function AProposPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-brand-cream py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="animate-hero-badge inline-flex items-center gap-2 bg-brand-gold-pale border border-brand-sand rounded-full px-4 py-1.5 text-sm text-brand-bronze mb-6 font-medium">
                BUT HSE · Alternance · Fondateur
              </div>
              <h1 className="animate-hero-title text-4xl font-extrabold text-brand-navy leading-tight mb-5">
                Un professionnel HSE qui a codé son propre outil
              </h1>
              <p className="animate-hero-sub text-lg text-brand-bronze leading-relaxed">
                SafeAnalyse. n&apos;est pas né dans une salle de réunion. Il est né de la frustration
                de terrain : les outils existants sont trop techniques, trop chers, ou trop génériques
                pour les PME industrielles.
              </p>
            </div>
            {/* Portrait placeholder */}
            <div className="animate-hero-sub flex justify-center md:justify-end">
              <div className="relative">
                <div className="w-52 h-52 rounded-2xl bg-brand-navy flex items-center justify-center shadow-[0_12px_40px_rgba(3,25,72,0.18)]">
                  <span className="text-7xl font-black text-brand-cream/90 select-none">W</span>
                </div>
                <div className="absolute -bottom-3 -right-3 bg-brand-gold-pale border border-brand-sand rounded-xl px-3 py-1.5 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-navy">
                    <MapPin className="w-3.5 h-3.5 text-brand-bronze" />
                    Morbihan, France
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">

        {/* ── Parcours narratif ─────────────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Mon parcours</h2>
            <div className="space-y-4">

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-gold-pale text-brand-gold flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-brand-navy mb-1">BUT Hygiène Sécurité Environnement — diplôme prévu septembre 2026</p>
                  <p className="text-brand-bronze leading-relaxed text-sm">
                    Formation en 3 ans couvrant l&apos;ensemble des risques professionnels : physiques,
                    chimiques, biologiques, psychosociaux. Méthodes INRS, réglementation du travail,
                    ergonomie, toxicologie.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-gold-pale text-brand-gold flex items-center justify-center shrink-0">
                  <Factory className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-brand-navy mb-1">2 ans d&apos;alternance chez MGD Nature — PME agroalimentaire, Morbihan</p>
                  <p className="text-brand-bronze leading-relaxed text-sm">
                    Évaluations des risques, rédaction de DUERP, suivi des plans de maîtrise sur
                    des postes de production, conditionnement et logistique. J&apos;ai vu de près
                    comment les outils disponibles ne répondaient pas aux besoins réels des PME.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-gold-pale text-brand-gold flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-brand-navy mb-1">Pompier volontaire — Morbihan</p>
                  <p className="text-brand-bronze leading-relaxed text-sm">
                    Une autre façon d&apos;appréhender les risques — pas depuis un bureau, mais depuis le
                    terrain. Ça forge une certaine façon de prioriser l&apos;essentiel.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </AnimateOnScroll>

        {/* ── Citation déclic ───────────────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <blockquote className="relative bg-brand-navy rounded-2xl px-8 py-10 overflow-hidden">
            <span className="absolute top-4 left-6 text-8xl font-black text-brand-cream/10 leading-none select-none">&ldquo;</span>
            <p className="relative text-xl font-semibold text-brand-cream leading-relaxed mb-4">
              Le déclic, ça a été de voir un dirigeant de PME passer 3 heures sur un fichier
              Excel incomplet — pour finalement me demander si c&apos;était &ldquo;vraiment
              obligatoire&rdquo;. Il ne manquait pas de bonne volonté. Il manquait d&apos;un outil
              fait pour lui.
            </p>
            <footer className="text-brand-cream/60 text-sm font-medium">
              — William Maréchal, fondateur de SafeAnalyse.
            </footer>
          </blockquote>
        </AnimateOnScroll>

        {/* ── Valeurs ───────────────────────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div>
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Ce qui guide SafeAnalyse.</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {valeurs.map((v, i) => (
                <div
                  key={i}
                  className="bg-brand-off border border-brand-sand rounded-2xl p-6 shadow-[0_1px_3px_rgba(3,25,72,0.04)]"
                >
                  <div className="w-2 h-2 rounded-full bg-brand-gold mb-4" />
                  <h3 className="font-bold text-brand-navy mb-2">{v.titre}</h3>
                  <p className="text-sm text-brand-bronze leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        {/* ── Accompagnement sur site ───────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-2">L&apos;accompagnement sur site</h2>
            <p className="text-sm text-brand-bronze/70 italic mb-6">
              Zone principale : Morbihan et Bretagne sud — déplacements possibles ailleurs (frais km)
            </p>
            <p className="text-brand-bronze leading-relaxed mb-6">
              Je me déplace dans votre entreprise pour réaliser l&apos;évaluation des risques avec
              vous, directement dans SafeAnalyse.. On visite les postes ensemble, on saisit
              l&apos;évaluation en temps réel, et vous repartez avec votre DUERP finalisé et compris.
            </p>
            <div className="bg-brand-gold-pale border border-brand-sand rounded-xl p-5 mb-5">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <span className="font-bold text-brand-navy">Consulting sur site</span>
                <span className="text-brand-bronze/60 text-xs">Post-diplôme septembre 2026 : 1 000 €/jour</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-brand-off border border-brand-sand rounded-lg p-3">
                  <p className="text-xl font-black text-brand-navy">700 €</p>
                  <p className="text-xs text-brand-bronze">/ jour (tarif lancement 2026)</p>
                </div>
                <div className="bg-brand-off border border-brand-sand rounded-lg p-3">
                  <p className="font-bold text-brand-navy text-sm">2 ans Pack Premium offerts</p>
                  <p className="text-xs text-brand-bronze">inclus dans toute prestation ≥ 1 jour</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-brand-bronze/60">
              Déplacements Morbihan inclus · Barème kilométrique hors zone · Frais de déplacement applicables au-delà de la Bretagne
            </p>
          </div>
        </AnimateOnScroll>

        {/* ── Domaines d'intervention ───────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Domaines d&apos;intervention</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {domainesIntervention.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-brand-bronze">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

      </div>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-navy-deep text-center">
        <div className="max-w-xl mx-auto px-4">
          <AnimateOnScroll animation="fade-up">
            <h2 className="text-2xl font-bold text-brand-cream mb-4">
              Vous avez des questions ?
            </h2>
            <p className="text-brand-cream/60 mb-8">
              Je lis tous les messages personnellement et réponds sous 24 heures ouvrées.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-brand-gold-light text-brand-navy-deep hover:bg-brand-gold font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-[0_4px_20px_rgba(184,134,11,0.3)]"
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
