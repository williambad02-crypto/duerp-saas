import Link from 'next/link'
import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll'
import { Check, X, Minus } from 'lucide-react'

export const metadata = {
  title: "Comparatif DUERP — SafeAnalyse. vs Cabinet HSE, Seirich, Excel",
  description: "Comparez SafeAnalyse. avec un cabinet HSE, les outils gratuits (Seirich, OiRA) et les templates Word/Excel. Trouvez la solution adaptée à votre PME.",
}

type CellValue = boolean | string | null

interface ComparatifRow {
  critere: string
  categorie?: string
  sa: CellValue
  cabinet: CellValue
  gratuit: CellValue
  template: CellValue
}

const rows: ComparatifRow[] = [
  // Prix
  {
    critere: 'Prix annuel moyen',
    categorie: 'Coût',
    sa: 'Dès 990 €/an',
    cabinet: '1 000–5 000 €/DUERP',
    gratuit: 'Gratuit',
    template: 'Gratuit',
  },
  {
    critere: 'Coût récurrent',
    sa: 'Abonnement SaaS',
    cabinet: 'À chaque mise à jour',
    gratuit: 'Gratuit',
    template: 'Temps interne',
  },
  // Fonctionnalités
  {
    critere: 'Guidé pas à pas',
    categorie: 'Fonctionnalités',
    sa: true,
    cabinet: true,
    gratuit: false,
    template: false,
  },
  {
    critere: 'Méthodes normées INRS (ED 840)',
    sa: true,
    cabinet: true,
    gratuit: 'Partiel',
    template: false,
  },
  {
    critere: 'Cotation G×P / G×DE automatique',
    sa: true,
    cabinet: 'Variable',
    gratuit: false,
    template: false,
  },
  {
    critere: 'Plan de maîtrise intégré',
    sa: true,
    cabinet: true,
    gratuit: false,
    template: false,
  },
  {
    critere: 'Export PDF structuré et conforme',
    sa: true,
    cabinet: true,
    gratuit: 'Basique',
    template: true,
  },
  {
    critere: 'Conservation automatique 40 ans',
    sa: true,
    cabinet: 'Variable',
    gratuit: false,
    template: false,
  },
  {
    critere: 'Interface tablette optimisée terrain',
    sa: true,
    cabinet: null,
    gratuit: false,
    template: false,
  },
  // Autonomie
  {
    critere: 'Autonome après la 1ère année',
    categorie: 'Autonomie',
    sa: true,
    cabinet: false,
    gratuit: true,
    template: true,
  },
  {
    critere: 'Mise à jour annuelle simple',
    sa: true,
    cabinet: false,
    gratuit: 'Difficile',
    template: 'Fastidieux',
  },
  {
    critere: 'Prise en main sans formation',
    sa: true,
    cabinet: null,
    gratuit: false,
    template: false,
  },
  // Accompagnement
  {
    critere: 'Accompagnement humain',
    categorie: 'Accompagnement',
    sa: 'Consulting option',
    cabinet: true,
    gratuit: false,
    template: false,
  },
  {
    critere: 'Support réactif',
    sa: true,
    cabinet: 'Variable',
    gratuit: false,
    template: false,
  },
  {
    critere: 'Audit semestriel inclus',
    sa: 'Pack Premium',
    cabinet: false,
    gratuit: false,
    template: false,
  },
]

function Cell({ val }: { val: CellValue }) {
  if (val === true) return (
    <td className="px-3 py-3 text-center">
      <Check className="w-4 h-4 text-green-600 mx-auto" />
    </td>
  )
  if (val === false) return (
    <td className="px-3 py-3 text-center">
      <X className="w-4 h-4 text-red-400 mx-auto" />
    </td>
  )
  if (val === null) return (
    <td className="px-3 py-3 text-center">
      <Minus className="w-4 h-4 text-gray-300 mx-auto" />
    </td>
  )
  return <td className="px-3 py-3 text-center text-xs text-gray-500 leading-tight">{val}</td>
}

function SaCell({ val }: { val: CellValue }) {
  if (val === true) return (
    <td className="px-3 py-3 text-center bg-brand-gold-pale/60">
      <Check className="w-4 h-4 text-green-600 mx-auto" />
    </td>
  )
  if (val === false) return (
    <td className="px-3 py-3 text-center bg-brand-gold-pale/60">
      <X className="w-4 h-4 text-red-400 mx-auto" />
    </td>
  )
  if (val === null) return (
    <td className="px-3 py-3 text-center bg-brand-gold-pale/60">
      <Minus className="w-4 h-4 text-gray-300 mx-auto" />
    </td>
  )
  return <td className="px-3 py-3 text-center bg-brand-gold-pale/60 text-xs font-semibold text-brand-navy leading-tight">{val}</td>
}

const quandChoisir = [
  {
    titre: 'SafeAnalyse.',
    sous: 'Pour vous si…',
    couleur: 'bg-brand-navy text-white',
    accentCouleur: 'text-brand-gold',
    points: [
      'Vous êtes une PME entre 1 et 250 salariés',
      'Vous voulez être autonome sur votre DUERP',
      'Vous avez besoin d\'un outil sérieux sans budget cabinet',
      'Vous avez une mise à jour annuelle à faire',
      'Vous voulez un PDF prêt pour l\'inspection du travail',
    ],
  },
  {
    titre: 'Cabinet HSE',
    sous: 'Pour vous si…',
    couleur: 'bg-gray-50 text-gray-900 border border-gray-200',
    accentCouleur: 'text-gray-600',
    points: [
      'Vous n\'avez personne en interne pour piloter le DUERP',
      'Votre secteur est très réglementé (nucléaire, chimie, etc.)',
      'Vous avez un budget conséquent et ne voulez pas vous en occuper',
      'Vous avez une obligation contractuelle d\'expert certifié',
    ],
  },
  {
    titre: 'Seirich / OiRA',
    sous: 'Pour vous si…',
    couleur: 'bg-gray-50 text-gray-900 border border-gray-200',
    accentCouleur: 'text-gray-600',
    points: [
      'Vous êtes une TPE avec très peu de risques à évaluer',
      'Votre secteur est couvert par un module OiRA spécifique',
      'Vous avez un budget nul et pouvez y consacrer du temps',
    ],
  },
  {
    titre: 'Template Word/Excel',
    sous: 'Pour vous si…',
    couleur: 'bg-gray-50 text-gray-900 border border-gray-200',
    accentCouleur: 'text-gray-600',
    points: [
      'Vous êtes une micro-entreprise avec 1-2 salariés',
      'Vous avez déjà une base solide et voulez juste la mettre en forme',
      'Vous n\'avez pas besoin de cotation automatique ni de versioning',
    ],
  },
]

export default function ComparatifPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-brand-cream py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-hero-badge inline-flex items-center gap-2 bg-brand-gold-pale border border-brand-sand rounded-full px-4 py-1.5 text-sm text-brand-bronze mb-6 font-medium">
            Comparatif objectif — avantages et limites de chaque option
          </div>
          <h1 className="animate-hero-title text-4xl sm:text-5xl font-extrabold text-brand-navy leading-tight mb-5">
            SafeAnalyse. vs les alternatives
          </h1>
          <p className="animate-hero-sub text-lg text-brand-bronze max-w-2xl mx-auto leading-relaxed">
            Cabinet HSE, outils gratuits (Seirich, OiRA), template Word&nbsp;: chaque solution a ses avantages. Voici une comparaison honnête pour choisir ce qui vous correspond.
          </p>
        </div>
      </section>

      {/* ── Tableau comparatif ────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-up">
            <div className="overflow-x-auto rounded-2xl border border-brand-sand shadow-sm">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-brand-navy text-brand-cream">
                    <th className="text-left px-4 py-4 font-medium text-brand-cream/70 rounded-tl-2xl w-[36%]">Critère</th>
                    <th className="px-3 py-4 font-semibold text-brand-gold text-center">SafeAnalyse.</th>
                    <th className="px-3 py-4 font-medium text-brand-cream/70 text-center">Cabinet HSE</th>
                    <th className="px-3 py-4 font-medium text-brand-cream/70 text-center">Seirich / OiRA</th>
                    <th className="px-3 py-4 font-medium text-brand-cream/70 text-center rounded-tr-2xl">Template Word</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <>
                      {row.categorie && (
                        <tr key={`cat-${i}`} className="bg-brand-navy/5">
                          <td
                            colSpan={5}
                            className="px-4 py-2 text-xs font-bold text-brand-navy uppercase tracking-wider"
                          >
                            {row.categorie}
                          </td>
                        </tr>
                      )}
                      <tr
                        key={i}
                        className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <td className="px-4 py-3 font-medium text-gray-800 text-sm">{row.critere}</td>
                        <SaCell val={row.sa} />
                        <Cell val={row.cabinet} />
                        <Cell val={row.gratuit} />
                        <Cell val={row.template} />
                      </tr>
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Quand choisir quoi ────────────────────────────────────────────── */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">Quand choisir quoi ?</h2>
              <p className="mt-3 text-brand-bronze max-w-xl mx-auto text-sm">
                Chaque option est la bonne dans le bon contexte. Voici le guide rapide.
              </p>
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quandChoisir.map((card, i) => (
              <AnimateOnScroll key={card.titre} animation="fade-up" delay={([0, 100, 200, 300] as const)[i]}>
                <div className={`rounded-2xl p-6 h-full ${card.couleur}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${card.accentCouleur}`}>
                    {card.sous}
                  </p>
                  <h3 className="text-base font-bold mb-4">{card.titre}</h3>
                  <ul className="space-y-2.5">
                    {card.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm opacity-90">
                        <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${card.titre === 'SafeAnalyse.' ? 'text-brand-gold' : 'text-green-500'}`} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Encart honnêteté ──────────────────────────────────────────────── */}
      <section className="py-12 bg-brand-cream-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-up">
            <div className="bg-white border border-brand-sand rounded-2xl p-6 md:p-8">
              <p className="text-xs font-bold text-brand-bronze uppercase tracking-wider mb-3">Un mot honnête</p>
              <p className="text-brand-ink-soft text-sm leading-relaxed mb-3">
                SafeAnalyse. n&apos;est pas fait pour tout le monde. Si vous gérez une micro-entreprise avec 1 salarié et peu de risques, un template Word suffit. Si votre secteur est ultra-réglementé et que vous avez un budget cabinet, engagez un expert.
              </p>
              <p className="text-brand-ink-soft text-sm leading-relaxed">
                SafeAnalyse. est fait pour les PME qui veulent <strong className="text-brand-navy">maîtriser leur DUERP en interne</strong>, sans dépendre d&apos;un prestataire à chaque mise à jour, avec un outil sérieux et des méthodes INRS intégrées.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-navy text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-brand-cream mb-3">Convaincu ? Essayez 14 jours gratuits.</h2>
          <p className="text-brand-cream/70 mb-8 text-sm">Sans carte bancaire. Vos données restent les vôtres.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="inline-block bg-brand-gold hover:bg-brand-gold-light text-brand-off font-bold px-8 py-3 rounded-xl transition text-sm"
            >
              Démarrer l&apos;essai →
            </Link>
            <Link
              href="/tarifs"
              className="inline-block border border-brand-cream/30 text-brand-cream hover:bg-white/10 font-semibold px-8 py-3 rounded-xl transition text-sm"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
