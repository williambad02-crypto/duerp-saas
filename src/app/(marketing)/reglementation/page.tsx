import Link from 'next/link'
import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll'

export const metadata = {
  title: "Réglementation DUERP — SafeAnalyse.",
  description: "Tout ce que vous devez savoir sur le Document Unique obligatoire : textes de loi, fréquence de mise à jour, contenu requis, sanctions en cas d'absence.",
}

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
            Le Document Unique n&apos;est pas une formalité optionnelle. C&apos;est une obligation légale qui engage la responsabilité pénale du dirigeant. Voici ce que vous devez savoir.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">

        {/* ── Qu'est-ce que le DUERP ? ─────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-4">Qu&apos;est-ce que le DUERP ?</h2>
            <p className="text-brand-bronze leading-relaxed mb-4">
              Le <strong className="text-brand-navy">Document Unique d&apos;Évaluation des Risques Professionnels (DUERP)</strong> est le document central de la prévention des risques dans une entreprise. Il doit recenser l&apos;ensemble des risques auxquels sont exposés les salariés, les évaluer et proposer des actions de prévention.
            </p>
            <p className="text-brand-bronze leading-relaxed">
              Il ne s&apos;agit pas d&apos;un simple formulaire à cocher — c&apos;est une analyse structurée, poste par poste, opération par opération, qui fonde toute votre politique de prévention.
            </p>
          </div>
        </AnimateOnScroll>

        {/* ── Qui est concerné ? ────────────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-4">Qui est concerné ?</h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="font-semibold text-red-800 text-sm">
                ⚠ Toute entreprise ayant au moins 1 salarié est concernée.
              </p>
            </div>
            <p className="text-brand-bronze leading-relaxed mb-4">
              Il n&apos;y a aucune exception liée à la taille, au secteur ou au type de contrat. Qu&apos;il s&apos;agisse d&apos;une TPE, d&apos;un commerce, d&apos;un cabinet libéral ou d&apos;une association, dès lors qu&apos;un salarié est employé, le DUERP est obligatoire.
            </p>
            <p className="text-sm text-brand-bronze/70 italic">
              Article L4121-3 du Code du travail
            </p>
          </div>
        </AnimateOnScroll>

        {/* ── Textes de référence ───────────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Les textes de référence</h2>
            <div className="space-y-4">
              {[
                {
                  ref: "L4121-1 Code du travail",
                  titre: "Obligation de prévention",
                  desc: "L'employeur prend les mesures nécessaires pour assurer la sécurité et protéger la santé physique et mentale des travailleurs. Ces mesures comprennent notamment des actions de prévention des risques professionnels.",
                },
                {
                  ref: "L4121-3 Code du travail",
                  titre: "Évaluation et transcription des risques",
                  desc: "L'employeur, compte tenu de la nature des activités de l'établissement, évalue les risques pour la santé et la sécurité des travailleurs, y compris dans le choix des procédés de fabrication, des équipements de travail, des substances ou préparations chimiques.",
                },
                {
                  ref: "R4121-1 Code du travail",
                  titre: "Document Unique",
                  desc: "L'employeur transcrit et met à jour dans un document unique les résultats de l'évaluation des risques pour la santé et la sécurité des travailleurs à laquelle il procède en application de l'article L4121-3.",
                },
                {
                  ref: "R4121-4 Code du travail",
                  titre: "Conservation 40 ans",
                  desc: "Chaque version du document unique, accompagnée des mises à jour et révisions, est conservée par l'employeur pendant une durée de 40 ans à compter de son élaboration.",
                },
                {
                  ref: "Loi n° 2021-1018 du 2 août 2021",
                  titre: "Renforcement de la prévention",
                  desc: "La loi pour renforcer la prévention en santé au travail durcit les obligations : formalisation du programme annuel de prévention pour les entreprises de 50 salariés et plus, mise à jour obligatoire lors de chaque décision d'aménagement important.",
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
                  titre: "Au moins 1 fois par an",
                  desc: "Mise à jour annuelle obligatoire, même en l'absence de changement significatif.",
                  color: "bg-brand-gold-pale border-brand-sand",
                },
                {
                  titre: "Lors de toute modification",
                  desc: "Aménagement important des postes, introduction d'un nouvel équipement, changement d'organisation du travail.",
                  color: "bg-brand-gold-pale border-brand-sand",
                },
                {
                  titre: "Suite à un accident",
                  desc: "Tout accident du travail ou maladie professionnelle doit entraîner une révision des risques correspondants.",
                  color: "bg-red-50 border-red-200",
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
            <h2 className="text-2xl font-bold text-red-900 mb-4">Les risques en cas d&apos;absence</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-200 text-red-800 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-red-900">Amende jusqu'à 1 500 €</p>
                  <p className="text-sm text-red-800/80 mt-1">Par unité de travail non évaluée (R4121-1). Pour une PME de 10 postes, le risque peut dépasser 15 000 €.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-200 text-red-800 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-red-900">Responsabilité pénale du dirigeant</p>
                  <p className="text-sm text-red-800/80 mt-1">En cas d&apos;accident du travail grave, l&apos;absence ou l&apos;insuffisance du DUERP constitue une circonstance aggravante pouvant mener à des poursuites pénales.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-200 text-red-800 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-red-900">Inopposabilité en cas de litige</p>
                  <p className="text-sm text-red-800/80 mt-1">Sans DUERP à jour, vous ne pouvez pas prouver avoir pris les mesures nécessaires. En cas de contentieux prud&apos;homal ou de sinistre, votre assurance peut contester sa couverture.</p>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        {/* ── 9 principes généraux ─────────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-2">Les 9 principes généraux de prévention</h2>
            <p className="text-sm text-brand-bronze/70 italic mb-6">Article L4121-2 du Code du travail</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { n: "1", t: "Éviter les risques", d: "Supprimer le danger ou l'exposition au danger." },
                { n: "2", t: "Évaluer les risques", d: "Apprécier les risques qui ne peuvent pas être évités." },
                { n: "3", t: "Combattre à la source", d: "Agir sur les risques à la source plutôt que sur les conséquences." },
                { n: "4", t: "Adapter le travail à l'Homme", d: "Conception des postes, choix des équipements et méthodes de travail." },
                { n: "5", t: "Tenir compte de l'évolution technique", d: "Intégrer les nouvelles technologies et connaissances dans la prévention." },
                { n: "6", t: "Remplacer le dangereux", d: "Substituer le procédé ou la substance dangereux par un moins dangereux." },
                { n: "7", t: "Planifier la prévention", d: "Ensemble cohérent avec technique, organisation, conditions de travail et social." },
                { n: "8", t: "Protection collective d'abord", d: "Donner la priorité aux mesures collectives sur les protections individuelles." },
                { n: "9", t: "Donner les instructions appropriées", d: "Former et informer les travailleurs sur les risques et les mesures de prévention." },
              ].map((p) => (
                <div key={p.n} className="flex gap-3 rounded-xl bg-brand-cream border border-brand-sand p-4">
                  <div className="w-7 h-7 rounded-full bg-brand-navy text-brand-cream flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {p.n}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy text-sm mb-1">{p.t}</p>
                    <p className="text-xs text-brand-bronze leading-relaxed">{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        {/* ── Comment SafeAnalyse. vous aide ───────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-gold-pale border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-4">Comment SafeAnalyse. vous aide</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  titre: "Identifier",
                  desc: "Le wizard vous guide à travers les 20 risques ED840 pour ne rien oublier, poste par poste, opération par opération.",
                },
                {
                  titre: "Évaluer",
                  desc: "Les grilles de cotation normées INRS (G×P, LEX,8h, RULA…) sont intégrées directement — aucun calcul manuel.",
                },
                {
                  titre: "Documenter",
                  desc: "L'export PDF génère un DUERP conforme et horodaté, avec versioning 40 ans, prêt à présenter à l'inspection.",
                },
              ].map((item, i) => (
                <div key={i} className="bg-brand-off rounded-xl border border-brand-sand p-4">
                  <div className="w-2 h-2 rounded-full bg-brand-gold mb-3" />
                  <p className="font-semibold text-brand-navy mb-2 text-sm">{item.titre}</p>
                  <p className="text-xs text-brand-bronze leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        {/* ── Contenu obligatoire ───────────────────────────────────── */}
        <AnimateOnScroll animation="fade-up">
          <div className="bg-brand-off border border-brand-sand rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Ce que doit contenir votre DUERP</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Inventaire des risques identifiés pour chaque unité de travail",
                "Cotation de chaque risque (gravité × probabilité)",
                "Mesures de prévention existantes (plan de maîtrise)",
                "Mesures à mettre en place (actions planifiées)",
                "Priorités d'action identifiées et datées",
                "Date d'élaboration et de chaque mise à jour",
                "Programme annuel de prévention (obligatoire ≥ 50 salariés)",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-brand-bronze">
                  <svg className="w-4 h-4 text-brand-gold shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

      </div>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-navy text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-brand-cream mb-4">Mettez-vous en conformité dès aujourd&apos;hui</h2>
          <p className="text-brand-cream/70 mb-8">SafeAnalyse. vous guide étape par étape vers un DUERP conforme et documenté.</p>
          <Link
            href="/auth/signup"
            className="inline-block bg-brand-gold hover:bg-brand-gold-light text-brand-off font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Démarrer l&apos;essai gratuit →
          </Link>
        </div>
      </section>

    </div>
  )
}
