import Link from 'next/link'
import { SectionReveal } from '@/components/marketing/ui'
import { HeroFaqTitle } from '@/components/marketing/hero-faq-title'
import { Accordion, AccordionItem } from '@/components/ui/accordion'
import { ArrowRight, ShieldAlert, Wand2, Wallet } from 'lucide-react'

export const metadata = {
  title: 'FAQ — SafeAnalyse.',
  description:
    'Questions fréquentes sur le DUERP, SafeAnalyse. et nos offres. Tout ce que vous avez besoin de savoir avant de vous lancer.',
}

const faqDuerp: AccordionItem[] = [
  {
    id: 'duerp-1',
    question: 'Le DUERP est-il vraiment obligatoire pour les TPE ?',
    reponse: (
      <>
        Oui, sans aucune exception. L&apos;article L4121-3 du Code du travail impose l&apos;évaluation
        des risques à tout employeur ayant <strong>au moins un salarié</strong> — quelle que soit
        la taille, le secteur ou la nature du contrat (CDI, CDD, intérim). Une TPE de 2 salariés
        dans un secteur &quot;peu risqué&quot; est tout aussi concernée qu&apos;un atelier industriel.
        L&apos;absence de DUERP constitue une infraction pénale, y compris pour une petite structure.
      </>
    ),
  },
  {
    id: 'duerp-2',
    question: 'À quelle fréquence faut-il le mettre à jour ?',
    reponse: (
      <>
        <strong>Au minimum une fois par an</strong>, même en l&apos;absence de changement.
        Et aussi à chaque événement significatif : arrivée d&apos;un nouvel équipement, modification
        d&apos;un poste de travail, accident du travail, embauche d&apos;un salarié exposé à un
        nouveau risque. En pratique, l&apos;inspection du travail vérifie la date de la dernière
        mise à jour dès les premières secondes d&apos;un contrôle.
      </>
    ),
  },
  {
    id: 'duerp-3',
    question: "Comment l'inspection du travail vérifie-t-elle ?",
    reponse: (
      <>
        Lors d&apos;un contrôle — planifié ou suite à un accident — l&apos;inspecteur du travail
        demande à consulter le DUERP. Il vérifie sa <strong>date de mise à jour</strong>, sa
        cohérence avec vos postes de travail réels, et la présence d&apos;un plan d&apos;actions.
        Il peut demander les versions précédentes (d&apos;où l&apos;obligation de conservation
        40 ans). Un DUERP daté d&apos;il y a 3 ans, ou qui ne correspond pas à vos activités
        actuelles, peut constituer une infraction même s&apos;il a déjà existé.
      </>
    ),
  },
  {
    id: 'duerp-4',
    question: 'Quelles sont les sanctions concrètes ?',
    reponse: (
      <>
        En l&apos;absence de DUERP ou en cas de DUERP manifestement insuffisant :{' '}
        <strong>amende de 1 500 € par unité de travail non évaluée</strong> (R4121-1 —
        doublée en cas de récidive). Pour une PME de 10 postes, le risque dépasse 15 000 €.
        En cas d&apos;accident grave, l&apos;absence de DUERP est une circonstance aggravante
        pouvant engager la <strong>responsabilité pénale</strong> du dirigeant — et justifier
        la qualification de faute inexcusable devant les tribunaux. En pratique, la première
        sanction est souvent une mise en demeure avec délai de régularisation.
      </>
    ),
  },
]

const faqOutil: AccordionItem[] = [
  {
    id: 'outil-1',
    question: 'Combien de temps pour faire mon premier DUERP avec SafeAnalyse. ?',
    reponse: (
      <>
        Pour une PME de 10 à 20 salariés avec 3 à 5 postes de travail :{' '}
        <strong>comptez 2 à 4 heures</strong> la première fois. Une fois les bases
        en place (postes, opérations), les mises à jour annuelles se font en 30 à
        45 minutes. La majeure partie du temps est dans la réflexion sur vos postes de
        travail — pas dans la saisie.
      </>
    ),
  },
  {
    id: 'outil-2',
    question: "Faut-il être expert HSE pour utiliser l'outil ?",
    reponse: (
      <>
        Non — et c&apos;est exactement pour ça que SafeAnalyse. a été conçu. Chaque module
        explique ce qu&apos;il faut évaluer et pourquoi. Les termes techniques sont définis
        en langage accessible. Si vous connaissez vos postes de travail, l&apos;outil fait le
        reste. En cas de blocage, vous pouvez aussi demander un accompagnement sur site.
      </>
    ),
  },
  {
    id: 'outil-3',
    question: 'Mon DUERP est-il vraiment conforme avec votre PDF ?',
    reponse: (
      <>
        Le PDF généré par SafeAnalyse. respecte les exigences réglementaires : inventaire
        des risques par unité de travail, cotation selon les méthodes INRS, plan de maîtrise,
        date de mise à jour horodatée, et versioning 40 ans automatique. Il est prêt à être
        présenté à l&apos;inspection du travail.{' '}
        <em>
          Attention : la conformité dépend aussi de la qualité de l&apos;évaluation saisie —
          l&apos;outil vous guide, mais l&apos;appréciation terrain reste la vôtre.
        </em>
      </>
    ),
  },
  {
    id: 'outil-4',
    question: "Qu'est-ce qu'un module normé (Bruit, TMS…) ?",
    reponse: (
      <>
        Pour certains risques chroniques (bruit, vibrations, TMS, RPS…), une simple
        cotation G×P ne suffit pas : il existe des méthodes d&apos;évaluation normées.
        SafeAnalyse. intègre ces méthodes dans des modules dédiés — par exemple le module
        Bruit (ISO 9612 + ED 6035 INRS) — qui vous posent les bonnes questions et calculent
        automatiquement les indicateurs réglementaires (LEX,8h, Lc,peak…) sans calcul manuel.
      </>
    ),
  },
  {
    id: 'outil-5',
    question: 'Mes données sont-elles en sécurité ?',
    reponse: (
      <>
        Oui. Les données sont hébergées en Europe (infrastructure Supabase EU). Chaque
        compte n&apos;accède qu&apos;à ses propres données (isolation au niveau base de données,
        Row Level Security). Nous ne revendons aucune donnée à des tiers, et vous pouvez
        exporter ou supprimer vos données à tout moment. Hébergement RGPD conforme.
      </>
    ),
  },
]

const faqOffre: AccordionItem[] = [
  {
    id: 'offre-1',
    question: 'Quelle différence entre Pack Industrie et Pack Premium ?',
    reponse: (
      <>
        Le <strong>Pack Industrie (99 €/mois)</strong> est conçu pour les PME de 1 à
        50 salariés avec jusqu&apos;à 5 postes et 20 opérations. Le{' '}
        <strong>Pack Premium (149 €/mois)</strong> est illimité en postes et opérations,
        inclut un audit semestriel téléphonique, et est dimensionné pour les PME de 50 à
        250 salariés. Les deux offres comprennent l&apos;essai gratuit 14 jours. En cas de doute,
        contactez-nous — on voit ça ensemble.
      </>
    ),
  },
  {
    id: 'offre-2',
    question: "Comment fonctionne l'accompagnement sur site ?",
    reponse: (
      <>
        Je me déplace dans vos locaux pour réaliser l&apos;évaluation des risques avec vous,
        directement dans SafeAnalyse.. On visite les postes ensemble, on saisit l&apos;évaluation
        en temps réel, et vous repartez avec votre DUERP finalisé et compris.{' '}
        <strong>2 ans de Pack Premium sont inclus</strong> dans toute prestation d&apos;une journée
        ou plus. Zone principale : Morbihan et Bretagne sud. Des déplacements sont possibles
        en dehors de cette zone — frais kilométriques applicables.
      </>
    ),
  },
  {
    id: 'offre-3',
    question: 'Peut-on annuler à tout moment ?',
    reponse: (
      <>
        L&apos;abonnement mensuel est <strong>résiliable à tout moment</strong>, sans frais ni
        justification, depuis votre espace client. L&apos;abonnement annuel est un engagement de
        12 mois permettant de bénéficier des 2 mois offerts. Vos données et vos DUERP restent
        accessibles en lecture jusqu&apos;à la fin de la période payée.
      </>
    ),
  },
]

const categories = [
  { icon: ShieldAlert, num: '01', titre: 'Sur le DUERP', items: faqDuerp, defaultOpen: 'duerp-1' },
  { icon: Wand2, num: '02', titre: 'Sur SafeAnalyse.', items: faqOutil, defaultOpen: undefined },
  { icon: Wallet, num: '03', titre: "Sur l'offre", items: faqOffre, defaultOpen: undefined },
]

export default function FaqPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── Hero — navy deep full-screen ─────────────────────────────── */}
      <section className="relative -mt-20 bg-brand-navy-deep min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-brand-navy-deep via-brand-navy-deep to-brand-navy-deep/95" />
        <div aria-hidden className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-brand-accent/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <HeroFaqTitle />
          <p className="animate-hero-sub text-lg text-brand-cream/70 max-w-xl mx-auto leading-relaxed">
            Sur le DUERP, sur SafeAnalyse., sur nos offres. Si vous ne trouvez pas la réponse ici,{' '}
            <Link href="/contact" className="text-brand-gold-light underline decoration-brand-gold/40 hover:decoration-brand-gold transition-colors">
              posez-nous la question directement
            </Link>.
          </p>
        </div>
      </section>

      {/* ── FAQ — 3 catégories cream-light ──────────────────────────── */}
      <section className="py-24 bg-brand-cream-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <SectionReveal key={cat.num} variant="fade-up">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-brand-navy text-brand-gold-light shrink-0">
                      <Icon className="w-5 h-5" />
                    </span>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-brand-gold">Catégorie {cat.num}</div>
                      <h2 className="text-xl md:text-2xl font-bold text-brand-navy">{cat.titre}</h2>
                    </div>
                  </div>
                  <div className="bg-brand-off border border-brand-sand rounded-2xl px-6 shadow-[0_10px_30px_-18px_rgba(3,25,72,0.15)]">
                    <Accordion items={cat.items} defaultOpen={cat.defaultOpen} />
                  </div>
                </div>
              </SectionReveal>
            )
          })}
        </div>
      </section>

      {/* ── CTA final — navy deep ────────────────────────────────────── */}
      <section className="py-24 bg-brand-navy-deep text-center">
        <div className="max-w-xl mx-auto px-4">
          <SectionReveal variant="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-cream mb-4">
              Vous ne trouvez <span className="text-brand-gold-light">pas</span> votre réponse ?
            </h2>
            <p className="text-brand-cream/60 mb-8 leading-relaxed">
              Je lis tous les messages personnellement et réponds sous 24 heures ouvrées.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-brand-gold-light text-brand-navy-deep hover:bg-brand-gold font-semibold px-8 py-3.5 rounded-xl transition-all hover:shadow-[0_10px_30px_-6px_rgba(184,134,11,0.6)]"
            >
              Poser ma question
              <ArrowRight className="w-4 h-4" />
            </Link>
          </SectionReveal>
        </div>
      </section>

    </div>
  )
}
