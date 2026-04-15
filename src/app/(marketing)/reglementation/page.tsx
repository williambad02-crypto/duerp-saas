import Link from 'next/link'
import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll'
import { Accordion, AccordionItem } from '@/components/ui/accordion'
import { ArrowRight, AlertTriangle, Scale, RefreshCw, Archive, ClipboardList } from 'lucide-react'

export const metadata = {
  title: 'Réglementation DUERP — SafeAnalyse.',
  description:
    "Tout ce que vous devez savoir sur le Document Unique obligatoire : textes de loi, fréquence de mise à jour, contenu requis, sanctions en cas d'absence.",
}

const principesAccordion: AccordionItem[] = [
  {
    id: 'p1',
    question: '1. Éviter les risques',
    reponse: (
      <>
        Supprimer le danger ou l&apos;exposition au danger. <strong>Exemple agro :</strong> remplacer
        un produit de nettoyage irritant par une formule neutre, éliminer le besoin de port de charge
        en automatisant une ligne de conditionnement.
      </>
    ),
  },
  {
    id: 'p2',
    question: '2. Évaluer les risques qui ne peuvent pas être évités',
    reponse: (
      <>
        Apprécier la gravité et la probabilité des risques résiduels — c&apos;est l&apos;objet central
        du DUERP. Sans évaluation, il est impossible de prioriser les actions. C&apos;est là que
        SafeAnalyse. intervient : cotation G×P ou G×DE selon le type de risque.
      </>
    ),
  },
  {
    id: 'p3',
    question: '3. Combattre les risques à la source',
    reponse: (
      <>
        Agir sur le procédé ou l&apos;environnement de travail plutôt que sur le salarié.{' '}
        <strong>Exemple agro :</strong> installer des protections acoustiques sur une machine bruyante
        plutôt que de distribuer des bouchons d&apos;oreille.
      </>
    ),
  },
  {
    id: 'p4',
    question: "4. Adapter le travail à l'Homme",
    reponse: (
      <>
        Conception ergonomique des postes, choix d&apos;équipements adaptés à la morphologie et aux
        capacités des opérateurs. Réduit significativement les TMS en production alimentaire.
      </>
    ),
  },
  {
    id: 'p5',
    question: "5. Tenir compte de l'évolution technique",
    reponse: (
      <>
        Intégrer les nouvelles technologies et connaissances dans la prévention. Les solutions
        de manutention mécanique ou d&apos;exosquelettes entrent dans ce cadre.
      </>
    ),
  },
  {
    id: 'p6',
    question: '6. Remplacer le dangereux par le moins dangereux',
    reponse: (
      <>
        Substitution des produits ou procédés dangereux. <strong>Exemple agro :</strong> remplacer
        un solvant CMR par un produit de nettoyage non classifié, reformuler un désinfectant
        pour éviter la classification corrosive.
      </>
    ),
  },
  {
    id: 'p7',
    question: '7. Planifier la prévention',
    reponse: (
      <>
        Ensemble cohérent intégrant technique, organisation, conditions de travail et relations
        sociales. Le programme annuel de prévention (obligatoire ≥ 50 salariés) matérialise
        cette planification. SafeAnalyse. génère ce programme automatiquement dans le PDF DUERP.
      </>
    ),
  },
  {
    id: 'p8',
    question: '8. Donner la priorité aux mesures de protection collective',
    reponse: (
      <>
        Les EPC (équipements de protection collective) priment sur les EPI (équipements de
        protection individuelle). Une cabine d&apos;isolation phonique vaut mieux que des
        casques individuels — même si les EPI restent nécessaires quand les EPC ne suffisent pas.
      </>
    ),
  },
  {
    id: 'p9',
    question: '9. Donner les instructions appropriées aux travailleurs',
    reponse: (
      <>
        Former et informer les salariés sur les risques identifiés et les mesures de prévention.
        La signature du plan de maîtrise par les opérateurs concernés est une bonne pratique
        pour tracer cette information.
      </>
    ),
  },
]

const obligations = [
  {
    icon: ClipboardList,
    titre: 'Rédiger le DUERP',
    texte: 'Obligatoire dès le 1ᵉʳ salarié. Inventaire des risques par unité de travail, cotation, plan de maîtrise.',
    ref: 'Art. R4121-1',
  },
  {
    icon: RefreshCw,
    titre: 'Le mettre à jour',
    texte: 'Au minimum une fois par an, et à chaque événement significatif : nouveau poste, accident, équipement.',
    ref: 'Art. R4121-2',
  },
  {
    icon: Archive,
    titre: 'Le conserver 40 ans',
    texte: "Toutes les versions successives doivent être gardées. Obligation de les présenter à l'inspection du travail.",
    ref: 'Art. R4121-4',
  },
  {
    icon: Scale,
    titre: 'Le rendre accessible',
    texte: "Les salariés, le CSE, l'inspection du travail et les services de santé au travail doivent pouvoir le consulter.",
    ref: 'Art. R4121-3',
  },
]

export default function ReglementationPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-brand-cream py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-hero-badge inline-flex items-center gap-2 bg-brand-gold-pale border border-brand-sand rounded-full px-4 py-1.5 text-sm text-brand-bronze mb-6 font-medium">
            L4121-1 · R4121-1 · Loi du 2 août 2021
          </div>
          <h1 className="animate-hero-title text-4xl sm:text-5xl font-extrabold text-brand-navy leading-tight mb-6">
            Le DUERP en clair :<br />obligations et sanctions
          </h1>
          <p className="animate-hero-sub text-lg text-brand-bronze max-w-2xl mx-auto leading-relaxed">
            Le Document Unique n&apos;est pas une formalité optionnelle. C&apos;est une obligation légale
            qui engage la responsabilité pénale du dirigeant. Voici ce que vous devez savoir.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">

        {/* ── Qu'est-ce que le DUERP ? ─────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-4">Qu&apos;est-ce que le DUERP ?</h2>
            <p className="text-brand-bronze leading-relaxed mb-4">
              Le <strong className="text-brand-navy">Document Unique d&apos;Évaluation des Risques
              Professionnels (DUERP)</strong> est le document central de la prévention des risques dans
              une entreprise. Il doit recenser l&apos;ensemble des risques auxquels sont exposés les
              salariés, les évaluer et proposer des actions de prévention.
            </p>
            <p className="text-brand-bronze leading-relaxed">
              Il ne s&apos;agit pas d&apos;un simple formulaire à cocher — c&apos;est une analyse
              structurée, poste par poste, opération par opération, qui fonde toute votre politique
              de prévention.
            </p>
          </div>
        </AnimateOnScroll>

        {/* ── Qui est concerné ? ────────────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-4">Qui est concerné ?</h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="font-semibold text-red-800 text-sm">
                Toute entreprise ayant au moins 1 salarié est concernée, sans exception.
              </p>
            </div>
            <p className="text-brand-bronze leading-relaxed mb-4">
              Il n&apos;y a aucune exception liée à la taille, au secteur ou au type de contrat.
              Qu&apos;il s&apos;agisse d&apos;une TPE, d&apos;un commerce, d&apos;un cabinet libéral
              ou d&apos;une association, dès lors qu&apos;un salarié est employé, le DUERP est
              obligatoire. Une boucherie de 3 personnes, un atelier de découpe de 40 personnes,
              une PME agroalimentaire de 120 personnes — même obligation légale.
            </p>
            <p className="text-sm text-brand-bronze/70 italic">Article L4121-3 du Code du travail</p>
          </div>
        </AnimateOnScroll>

        {/* ── Vos 4 obligations ────────────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div>
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Vos 4 obligations réglementaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {obligations.map((o, i) => {
                const Icon = o.icon
                return (
                  <div
                    key={i}
                    className="bg-brand-off border border-brand-sand rounded-2xl p-6 flex gap-4 shadow-[0_1px_3px_rgba(3,25,72,0.04)]"
                  >
                    <div className="w-11 h-11 rounded-xl bg-brand-gold-pale text-brand-gold flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-brand-navy">{o.titre}</span>
                        <span className="text-[10px] font-mono text-brand-bronze/60 bg-brand-cream border border-brand-sand px-1.5 py-0.5 rounded">
                          {o.ref}
                        </span>
                      </div>
                      <p className="text-sm text-brand-bronze leading-relaxed">{o.texte}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </AnimateOnScroll>

        {/* ── Textes de référence ───────────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Les textes de référence</h2>
            <div className="space-y-5">
              {[
                {
                  ref: 'L4121-1 Code du travail',
                  titre: 'Obligation de prévention',
                  desc: "L'employeur prend les mesures nécessaires pour assurer la sécurité et protéger la santé physique et mentale des travailleurs. Ces mesures comprennent notamment des actions de prévention des risques professionnels.",
                },
                {
                  ref: 'L4121-3 Code du travail',
                  titre: 'Évaluation et transcription des risques',
                  desc: "L'employeur évalue les risques pour la santé et la sécurité des travailleurs, y compris dans le choix des procédés de fabrication, des équipements de travail, des substances ou préparations chimiques.",
                },
                {
                  ref: 'R4121-1 Code du travail',
                  titre: 'Document Unique',
                  desc: "L'employeur transcrit et met à jour dans un document unique les résultats de l'évaluation des risques pour la santé et la sécurité des travailleurs à laquelle il procède.",
                },
                {
                  ref: 'R4121-4 Code du travail',
                  titre: 'Conservation 40 ans',
                  desc: "Chaque version du document unique, accompagnée des mises à jour et révisions, est conservée par l'employeur pendant une durée de 40 ans à compter de son élaboration.",
                },
                {
                  ref: 'Loi n° 2021-1018 du 2 août 2021',
                  titre: 'Renforcement de la prévention en santé au travail',
                  desc: "Durcissement des obligations : formalisation du programme annuel de prévention pour les entreprises de 50 salariés et plus, mise à jour obligatoire lors de chaque décision d'aménagement important.",
                },
              ].map((t, i) => (
                <div key={i} className="border-l-2 border-brand-gold pl-5 py-1">
                  <p className="text-xs font-bold text-brand-gold mb-1">{t.ref}</p>
                  <p className="font-semibold text-brand-navy mb-1">{t.titre}</p>
                  <p className="text-sm text-brand-bronze leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        {/* ── Fréquence de mise à jour ─────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Quand mettre à jour votre DUERP ?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  titre: 'Au moins 1 fois par an',
                  desc: "Mise à jour annuelle obligatoire, même en l'absence de changement significatif.",
                  color: 'bg-brand-gold-pale border-brand-sand',
                },
                {
                  titre: 'Lors de toute modification',
                  desc: "Aménagement important des postes, introduction d'un nouvel équipement, changement d'organisation du travail.",
                  color: 'bg-brand-gold-pale border-brand-sand',
                },
                {
                  titre: "Suite à un accident",
                  desc: "Tout accident du travail ou maladie professionnelle doit entraîner une révision des risques correspondants.",
                  color: 'bg-red-50 border-red-200',
                },
              ].map((item, i) => (
                <div key={i} className={`rounded-xl border p-4 ${item.color}`}>
                  <p className="font-semibold text-brand-navy text-sm mb-2">{item.titre}</p>
                  <p className="text-xs text-brand-bronze leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        {/* ── Sanctions ─────────────────────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-900">Les risques en cas d&apos;absence</h2>
            </div>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-red-200 text-red-800 flex items-center justify-center text-xs font-bold shrink-0">€</span>
                <div>
                  <p className="font-semibold text-red-900">Amende jusqu&apos;à 1 500 € par unité de travail</p>
                  <p className="text-sm text-red-800/80 mt-1 leading-relaxed">
                    Article R4121-1, doublée en cas de récidive. Pour une PME de 10 postes, le risque
                    cumulé dépasse 15 000 €. En pratique, la première sanction est souvent une mise en
                    demeure avec délai de régularisation.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-red-200 text-red-800 flex items-center justify-center text-xs font-bold shrink-0">⚖</span>
                <div>
                  <p className="font-semibold text-red-900">Responsabilité pénale du dirigeant</p>
                  <p className="text-sm text-red-800/80 mt-1 leading-relaxed">
                    En cas d&apos;accident du travail grave, l&apos;absence ou l&apos;insuffisance
                    du DUERP est une circonstance aggravante pouvant mener à des poursuites pénales
                    et à la qualification de <strong>faute inexcusable</strong> devant les tribunaux.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-red-200 text-red-800 flex items-center justify-center text-xs font-bold shrink-0">✕</span>
                <div>
                  <p className="font-semibold text-red-900">Inopposabilité en cas de litige</p>
                  <p className="text-sm text-red-800/80 mt-1 leading-relaxed">
                    Sans DUERP à jour, vous ne pouvez pas prouver avoir pris les mesures nécessaires.
                    En cas de contentieux prud&apos;homal ou de sinistre, votre assurance peut
                    contester sa couverture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        {/* ── 9 principes généraux ─────────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-2">
              Les 9 principes généraux de prévention
            </h2>
            <p className="text-sm text-brand-bronze/70 italic mb-6">
              Article L4121-2 du Code du travail — illustrés avec des exemples agroalimentaires
            </p>
            <Accordion items={principesAccordion} defaultOpen="p1" />
          </div>
        </AnimateOnScroll>

        {/* ── Contenu obligatoire ───────────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Ce que doit contenir votre DUERP</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Inventaire des risques identifiés pour chaque unité de travail',
                'Cotation de chaque risque (gravité × probabilité)',
                'Mesures de prévention existantes (plan de maîtrise)',
                'Mesures à mettre en place (actions planifiées)',
                "Priorités d'action identifiées et datées",
                "Date d'élaboration et de chaque mise à jour",
                'Programme annuel de prévention (obligatoire ≥ 50 salariés)',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-brand-bronze">
                  <svg className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        {/* ── Comment SafeAnalyse. vous aide ───────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-gold-pale border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Comment SafeAnalyse. vous aide</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  titre: 'Identifier',
                  desc: 'Le wizard vous guide à travers les 20 risques ED840 pour ne rien oublier, poste par poste, opération par opération.',
                },
                {
                  titre: 'Évaluer',
                  desc: 'Les grilles de cotation normées INRS (G×P, LEX,8h, RULA…) sont intégrées directement — aucun calcul manuel.',
                },
                {
                  titre: 'Documenter',
                  desc: "L'export PDF génère un DUERP conforme et horodaté, avec versioning 40 ans, prêt à présenter à l'inspection.",
                },
              ].map((item, i) => (
                <div key={i} className="bg-brand-off rounded-xl border border-brand-sand p-5">
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
      <section className="py-20 bg-brand-navy-deep text-center">
        <div className="max-w-xl mx-auto px-4">
          <AnimateOnScroll animation="fade-up">
            <h2 className="text-2xl font-bold text-brand-cream mb-4">
              Mettez-vous en conformité dès aujourd&apos;hui
            </h2>
            <p className="text-brand-cream/60 mb-8">
              SafeAnalyse. vous guide étape par étape vers un DUERP conforme et documenté.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-brand-gold-light text-brand-navy-deep hover:bg-brand-gold font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-[0_4px_20px_rgba(184,134,11,0.3)]"
              >
                Demander un échange
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 border border-brand-cream/40 text-brand-cream/80 hover:bg-brand-cream/10 font-medium px-8 py-3 rounded-xl transition-all"
              >
                Lire la FAQ
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

    </div>
  )
}
