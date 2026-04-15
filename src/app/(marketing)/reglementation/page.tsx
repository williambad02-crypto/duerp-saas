import Link from 'next/link'
import { SectionReveal } from '@/components/marketing/ui'
import { HeroReglementationTitle } from '@/components/marketing/hero-reglementation-title'
import {
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Archive,
  ClipboardList,
  Scale,
  Check,
  BookOpen,
  Radar,
  FileCheck2,
  Bell,
} from 'lucide-react'

export const metadata = {
  title: 'Réglementation DUERP — SafeAnalyse.',
  description:
    "Tout ce que vous devez savoir sur le Document Unique obligatoire : textes de loi, fréquence de mise à jour, contenu requis, sanctions en cas d'absence.",
}

const textesRef = [
  { ref: 'L4121-1 Code du travail', titre: 'Obligation de prévention', desc: "L'employeur prend les mesures nécessaires pour assurer la sécurité et protéger la santé physique et mentale des travailleurs." },
  { ref: 'L4121-3 Code du travail', titre: 'Évaluation et transcription des risques', desc: "L'employeur évalue les risques pour la santé et la sécurité des travailleurs, y compris dans le choix des procédés, équipements, substances chimiques." },
  { ref: 'R4121-1 Code du travail', titre: 'Document Unique', desc: "L'employeur transcrit et met à jour dans un document unique les résultats de l'évaluation des risques." },
  { ref: 'R4121-4 Code du travail', titre: 'Conservation 40 ans', desc: "Chaque version du document unique, accompagnée des mises à jour, est conservée par l'employeur pendant 40 ans à compter de son élaboration." },
  { ref: 'Loi n° 2021-1018 du 2 août 2021', titre: 'Renforcement de la prévention en santé au travail', desc: "Durcissement des obligations, formalisation du programme annuel de prévention pour les entreprises ≥ 50 salariés." },
]

export default function ReglementationPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── 1. Hero — navy deep full-screen ──────────────────────────── */}
      <section className="relative -mt-20 bg-brand-navy-deep min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-brand-navy-deep via-brand-navy-deep to-brand-navy-deep/95" />
        <div aria-hidden className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-brand-accent/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <HeroReglementationTitle />
          <p className="animate-hero-sub text-lg text-brand-cream/70 max-w-2xl mx-auto leading-relaxed">
            Le Document Unique n&apos;est pas une formalité optionnelle. C&apos;est une obligation légale qui engage la responsabilité pénale du dirigeant.
            Voici ce que vous <span className="text-brand-gold-light font-semibold">devez</span> savoir.
          </p>
        </div>
      </section>

      {/* ── 2. Essentiel — cream-light ───────────────────────────────── */}
      <section className="py-24 bg-brand-cream-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <SectionReveal variant="fade-up">
            <div className="text-center mb-8">
              <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">L&apos;essentiel</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mt-3">C&apos;est quoi, le DUERP ?</h2>
            </div>
          </SectionReveal>

          <SectionReveal variant="fade-up" delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-brand-off border border-brand-sand rounded-2xl p-7">
                <p className="text-brand-ink-soft leading-relaxed mb-3">
                  Le <strong className="text-brand-navy">Document Unique d&apos;Évaluation des Risques Professionnels</strong> est le document central
                  de la prévention dans une entreprise. Il recense l&apos;ensemble des risques auxquels sont exposés les salariés, les évalue et propose des actions.
                </p>
                <p className="text-brand-ink-soft leading-relaxed text-sm">
                  Pas un simple formulaire à cocher — une analyse structurée, poste par poste, opération par opération,
                  qui fonde toute votre politique de prévention.
                </p>
              </div>

              <div className="bg-brand-off border border-brand-sand rounded-2xl p-7 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-brand-navy mb-3">Qui est concerné ?</h3>
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="font-semibold text-red-800 text-sm leading-snug">
                      Toute entreprise ayant au moins 1 salarié, sans exception.
                    </p>
                  </div>
                  <p className="text-sm text-brand-ink-soft leading-relaxed">
                    Aucune exception liée à la taille, au secteur ou au type de contrat. Boucherie de 3 personnes, atelier de 40, PME de 120 — même obligation.
                  </p>
                </div>
                <p className="text-xs text-brand-bronze/70 italic mt-4">Article L4121-3 du Code du travail</p>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── 3. 4 obligations — navy deep BentoGrid ──────────────────── */}
      <section className="py-24 bg-brand-navy-deep">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="text-center mb-14">
              <span className="text-brand-gold-light text-xs font-bold uppercase tracking-widest">Obligations</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-cream mt-3">Vos 4 obligations réglementaires</h2>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: ClipboardList, titre: 'Rédiger le DUERP', ref: 'Art. R4121-1', desc: 'Obligatoire dès le 1ᵉʳ salarié. Inventaire des risques par unité de travail, cotation, plan de maîtrise.' },
              { icon: RefreshCw, titre: 'Le mettre à jour', ref: 'Art. R4121-2', desc: 'Au minimum une fois par an, et à chaque événement significatif : nouveau poste, accident, équipement.' },
              { icon: Archive, titre: 'Le conserver 40 ans', ref: 'Art. R4121-4', desc: "Toutes les versions successives doivent être gardées. Obligation de les présenter à l'inspection du travail." },
              { icon: Scale, titre: 'Le rendre accessible', ref: 'Art. R4121-3', desc: "Les salariés, le CSE, l'inspection du travail et les services de santé doivent pouvoir le consulter." },
            ].map((o, i) => {
              const Icon = o.icon
              return (
                <SectionReveal key={o.titre} variant="fade-up" delay={i * 0.08}>
                  <div className="relative bg-white/[0.04] border border-white/10 hover:border-brand-gold/30 rounded-2xl p-6 md:p-7 h-full transition-all hover:shadow-[0_20px_50px_-20px_rgba(184,134,11,0.25)]">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 text-brand-gold-light mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold text-brand-cream">{o.titre}</h3>
                      <span className="text-[10px] font-mono text-brand-cream/50 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                        {o.ref}
                      </span>
                    </div>
                    <p className="text-sm text-brand-cream/65 leading-relaxed">{o.desc}</p>
                  </div>
                </SectionReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 4. Textes de référence — cream-light ────────────────────── */}
      <section className="py-24 bg-brand-cream-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="text-center mb-10">
              <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">Sources légales</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mt-3">Les textes de référence</h2>
            </div>
          </SectionReveal>

          <SectionReveal variant="fade-up" delay={0.1}>
            <div className="bg-brand-off border border-brand-sand rounded-2xl p-8 md:p-10 shadow-[0_10px_30px_-18px_rgba(3,25,72,0.15)]">
              <div className="space-y-6">
                {textesRef.map((t, i) => (
                  <SectionReveal key={t.ref} variant="fade-up" delay={i * 0.05}>
                    <div className="border-l-2 border-brand-gold pl-5 py-1">
                      <p className="text-xs font-extrabold text-brand-gold uppercase tracking-widest mb-1">{t.ref}</p>
                      <p className="font-semibold text-brand-navy mb-1">{t.titre}</p>
                      <p className="text-sm text-brand-ink-soft leading-relaxed">{t.desc}</p>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── 5. Sanctions — navy deep avec accent rouge danger ────────── */}
      <section className="py-24 bg-brand-navy-deep">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="relative rounded-3xl p-[1.5px] bg-gradient-to-br from-red-500/40 via-brand-gold/30 to-red-500/40 shadow-[0_30px_80px_-25px_rgba(220,38,38,0.3)]">
              <div className="relative bg-brand-navy rounded-[calc(1.5rem-1px)] p-8 md:p-12 overflow-hidden">
                <div aria-hidden className="absolute -top-20 -right-16 w-60 h-60 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-red-300">Risques légaux</div>
                      <h2 className="text-2xl md:text-3xl font-bold text-brand-cream">Les sanctions en cas d&apos;absence</h2>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {[
                      {
                        label: '€',
                        titre: 'Amende jusqu\'à 1 500 € par unité de travail',
                        desc: 'Article R4121-1, doublée en cas de récidive. Pour une PME de 10 postes, le risque cumulé dépasse 15 000 €. En pratique, la première sanction est souvent une mise en demeure.',
                      },
                      {
                        label: '⚖',
                        titre: 'Responsabilité pénale du dirigeant',
                        desc: "En cas d'accident grave, l'absence ou l'insuffisance du DUERP est une circonstance aggravante pouvant mener à des poursuites pénales et à la qualification de faute inexcusable.",
                      },
                      {
                        label: '✕',
                        titre: 'Inopposabilité en cas de litige',
                        desc: "Sans DUERP à jour, impossible de prouver avoir pris les mesures nécessaires. En cas de contentieux prud'homal ou de sinistre, votre assurance peut contester sa couverture.",
                      },
                    ].map((item, i) => (
                      <SectionReveal key={item.titre} variant="fade-up" delay={i * 0.08}>
                        <div className="flex items-start gap-4">
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-bold shrink-0">
                            {item.label}
                          </span>
                          <div>
                            <p className="font-semibold text-brand-cream mb-1">{item.titre}</p>
                            <p className="text-sm text-brand-cream/65 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      </SectionReveal>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── 6. Veille réglementaire intégrée — cream-light ──────────── */}
      <section className="py-24 bg-brand-cream-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="text-center mb-10">
              <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">
                Au-delà du résumé
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mt-3">
                La veille réglementaire, <span className="text-brand-gold">on s&apos;en charge</span>.
              </h2>
              <p className="mt-4 text-brand-bronze max-w-2xl mx-auto leading-relaxed">
                Cette page est un résumé pédagogique des textes en vigueur. Les textes évoluent — décrets,
                directives, nouvelles normes. SafeAnalyse. intègre une <strong className="text-brand-navy">veille réglementaire continue</strong> dans l&apos;outil,
                pour que vous n&apos;ayez plus à vous en préoccuper.
              </p>
            </div>
          </SectionReveal>

          <SectionReveal variant="fade-up" delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: Radar,
                  titre: 'Veille continue',
                  desc: 'Nouveaux décrets, arrêtés, directives UE, évolutions des normes INRS — le moteur de veille surveille pour vous.',
                },
                {
                  icon: Bell,
                  titre: 'Page dédiée dans l\'outil',
                  desc: "Un onglet \u00ab\u00a0Veille\u00a0\u00bb dans votre dashboard : toutes les évolutions impactant votre secteur, avec leur effet concret sur votre DUERP.",
                },
                {
                  icon: FileCheck2,
                  titre: 'Conformité garantie',
                  desc: 'Tout ce que l\u2019outil produit est aligné sur le cadre réglementaire en vigueur. Si la loi change, vos modèles s\u2019adaptent.',
                },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <SectionReveal key={item.titre} variant="fade-up" delay={i * 0.08}>
                    <div className="bg-brand-off border border-brand-sand rounded-2xl p-6 h-full hover:border-brand-accent-dark/30 hover:shadow-[0_18px_44px_-18px_rgba(3,105,161,0.25)] transition-all">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-gold-pale text-brand-gold mb-4">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-brand-navy mb-2">{item.titre}</h3>
                      <p className="text-sm text-brand-ink-soft leading-relaxed">{item.desc}</p>
                    </div>
                  </SectionReveal>
                )
              })}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── 7. CTA final — navy deep premium ────────────────────────── */}
      <section className="py-24 bg-brand-navy-deep">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal variant="fade-up">
            <div className="relative rounded-3xl p-[1.5px] bg-gradient-to-br from-brand-gold via-brand-gold-light to-brand-gold/40 shadow-[0_30px_80px_-25px_rgba(184,134,11,0.35)]">
              <div className="relative bg-brand-navy rounded-[calc(1.5rem-1px)] p-8 md:p-12 overflow-hidden">
                <div aria-hidden className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-brand-gold/15 blur-3xl pointer-events-none" />

                <div className="relative text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-gold/20 border border-brand-gold/40 text-brand-gold-light mb-5">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-brand-cream mb-3">
                    Mettez-vous en conformité <span className="text-brand-gold-light">dès aujourd&apos;hui</span>.
                  </h2>
                  <p className="text-brand-cream/65 max-w-xl mx-auto mb-8 leading-relaxed">
                    SafeAnalyse. vous guide étape par étape vers un DUERP conforme, horodaté et conservé 40 ans automatiquement.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center gap-2 bg-brand-gold-light text-brand-navy-deep hover:bg-brand-gold font-semibold px-8 py-3.5 rounded-xl transition-all hover:shadow-[0_10px_30px_-6px_rgba(184,134,11,0.6)]"
                    >
                      Demander un échange
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/faq"
                      className="inline-flex items-center justify-center gap-2 border border-brand-cream/30 text-brand-cream/90 hover:bg-brand-cream/10 font-medium px-8 py-3.5 rounded-xl transition-all"
                    >
                      Lire la FAQ
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

    </div>
  )
}
