import Link from 'next/link'
import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll'
import { ArrowRight, UserPlus, MapPin, ShieldCheck, FileDown } from 'lucide-react'

export const metadata = {
  title: "L'outil — SafeAnalyse.",
  description:
    "Tout ce qu'il vous faut pour faire votre DUERP : modules normés INRS, cotation G×P, tableau APR et export PDF officiel. Sans expertise HSE préalable.",
}

const parcours = [
  {
    icon: UserPlus,
    titre: 'Créez votre compte',
    desc: '14 jours gratuits, sans carte bancaire. Accès immédiat à toutes les fonctionnalités.',
    num: '01',
  },
  {
    icon: MapPin,
    titre: 'Déclarez vos postes',
    desc: "Listez vos unités de travail et leurs opérations concrètes. L'outil structure tout pour vous.",
    num: '02',
  },
  {
    icon: ShieldCheck,
    titre: 'Évaluez chaque risque',
    desc: 'Pour chaque opération, 3 questions de présélection puis cotation guidée sur les 20 risques ED840.',
    num: '03',
  },
  {
    icon: FileDown,
    titre: 'Exportez votre DUERP',
    desc: "PDF officiel généré en un clic — page de garde, tableau APR, plan de maîtrise. Prêt pour l'inspection.",
    num: '04',
  },
]

const fonctionnalites = [
  {
    titre: 'Wizard guidé pas à pas',
    desc: "L'outil vous pose les bonnes questions dans le bon ordre. Chaque module explique ce qu'il faut évaluer et pourquoi.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    titre: 'Modules de risques normés',
    desc: 'Chaque risque (bruit, TMS, RPS, vibrations…) suit sa méthode INRS intégrée. Les grilles de cotation sont calculées automatiquement.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    ),
  },
  {
    titre: 'Cotation G×P et G×DE',
    desc: 'Score 1 à 20, code couleur immédiat : vert (acceptable), jaune (à planifier), orange (prioritaire), rouge (action immédiate).',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    ),
  },
  {
    titre: 'Plan de maîtrise intégré',
    desc: "Saisissez vos mesures de prévention existantes. Le coefficient d'efficacité calcule automatiquement la criticité résiduelle.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    ),
  },
  {
    titre: 'Tableau APR de synthèse',
    desc: "Tous vos risques triés par criticité résiduelle décroissante. Identifiez vos priorités d'action en un coup d'œil.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    ),
  },
  {
    titre: 'Export PDF officiel',
    desc: 'DUERP complet en PDF : page de garde, sommaire, évaluations par poste, tableau APR, plan de maîtrise et programme annuel.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
  {
    titre: 'Versioning 40 ans automatique',
    desc: "Chaque mise à jour est horodatée et conservée. L'obligation légale R4121-4 (conservation 40 ans) est respectée sans action de votre part.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    titre: 'Interface adaptée terrain',
    desc: 'Pensée pour une tablette depuis un atelier ou un chantier. Simple, sans jargon, pour les dirigeants de PME — pas pour les experts HSE.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    ),
  },
]

const risquesED840 = [
  { num: '01', nom: 'Chute de plain-pied', type: 'AIGU', desc: 'Sol glissant, encombrement, obstacles au sol' },
  { num: '02', nom: 'Chute de hauteur', type: 'AIGU', desc: 'Échelles, toitures, passerelles, fosses' },
  { num: '03', nom: 'Circulations internes', type: 'AIGU', desc: 'Chariots, piétons, zones de croisement' },
  { num: '04', nom: 'Risques routiers', type: 'AIGU', desc: 'Mission, trajet domicile-travail, conduite' },
  { num: '05', nom: 'Charge physique', type: 'CHRONIQUE', desc: 'Postures contraignantes, effort physique répété' },
  { num: '06', nom: 'Manutention mécanique', type: 'AIGU', desc: 'Ponts roulants, chariots élévateurs, nacelles' },
  { num: '07', nom: 'Produits chimiques', type: 'MIXTE', desc: 'CMR, irritants, corrosifs, solvants' },
  { num: '08', nom: 'Agents biologiques', type: 'CHRONIQUE', desc: 'Bactéries, virus, moisissures, zoonoses' },
  { num: '09', nom: 'Équipements de travail', type: 'AIGU', desc: 'Machines, outils, organes en mouvement' },
  { num: '10', nom: "Chutes d'objets", type: 'AIGU', desc: "Effondrements, chutes depuis des étagères ou racks" },
  { num: '11', nom: 'Bruit', type: 'MIXTE', desc: "Exposition sonore, niveaux d'action LEX,8h / Lc" },
  { num: '12', nom: 'Ambiances thermiques', type: 'MIXTE', desc: 'Chaleur, froid, ambiances extrêmes' },
  { num: '13', nom: 'Incendie / ATEX', type: 'AIGU', desc: "Stockage, sources d'inflammation, zones explosibles" },
  { num: '14', nom: 'Électricité', type: 'AIGU', desc: 'Habilitation, armoires, câbles, humidité' },
  { num: '15', nom: 'Ambiances lumineuses', type: 'CHRONIQUE', desc: 'Éclairage insuffisant, éblouissement, UV' },
  { num: '16', nom: 'Rayonnements', type: 'CHRONIQUE', desc: 'Ionisants, UV, infrarouge, électromagnétique' },
  { num: '17', nom: 'Risques psychosociaux', type: 'CHRONIQUE', desc: 'Stress, harcèlement, surcharge cognitive' },
  { num: '18', nom: 'Vibrations', type: 'CHRONIQUE', desc: 'Vibrations main-bras, corps entier — valeurs limites' },
  { num: '19', nom: 'Heurts / Cognements', type: 'AIGU', desc: 'Angles saillants, protubérances, espaces étroits' },
  { num: '20', nom: 'Pratiques addictives', type: 'CHRONIQUE', desc: 'Alcool, stupéfiants, médicaments détournés' },
]

const typeColor: Record<string, string> = {
  AIGU: 'bg-orange-50 text-orange-700 border-orange-200',
  CHRONIQUE: 'bg-blue-50 text-blue-700 border-blue-200',
  MIXTE: 'bg-brand-gold-pale text-brand-bronze border-brand-sand',
}
const typeLabel: Record<string, string> = {
  AIGU: 'Aigu',
  CHRONIQUE: 'Chronique',
  MIXTE: 'Mixte',
}

const modules = [
  { code: 'M01', nom: 'Bruit', statut: 'actif', desc: "Exposition sonore, niveaux d'action, protection auditive", norme: 'ED 6035 · ISO 9612' },
  { code: 'M02', nom: 'Vibrations', statut: 'bientot', desc: 'Vibrations main-bras, corps entier, valeurs limites', norme: 'OSEV INRS' },
  { code: 'M03', nom: 'TMS', statut: 'bientot', desc: 'Troubles musculo-squelettiques, cotation RULA/REBA', norme: 'TMS PRO INRS' },
  { code: 'M04', nom: 'Charge physique', statut: 'bientot', desc: 'Port de charges, manutentions manuelles (ED6161)', norme: 'ED 6161' },
  { code: 'M05', nom: 'Risques psychosociaux', statut: 'bientot', desc: 'Stress, harcèlement, conditions de travail', norme: 'RPS-DU INRS' },
  { code: 'M06', nom: 'Chimique / CMR', statut: 'bientot', desc: 'Produits chimiques, cancérogènes, mutagènes', norme: 'SEIRICH INRS' },
  { code: 'M07', nom: 'Biologique', statut: 'bientot', desc: 'Agents biologiques, risques infectieux', norme: 'À venir' },
  { code: 'M08', nom: 'Thermique', statut: 'bientot', desc: 'Chaleur, froid, ambiances thermiques', norme: 'À venir' },
  { code: 'M09', nom: 'Rayonnements', statut: 'bientot', desc: 'UV, ionisants, électromagnétiques', norme: 'À venir' },
]

const methodes = [
  {
    ref: 'ED 6035 (INRS)',
    module: 'Bruit',
    desc: "Guide d'évaluation de l'exposition sonore. Niveaux d'action et valeurs limites LEX,8h et Lc,peak.",
    color: 'border-brand-gold',
  },
  {
    ref: 'ISO 9612',
    module: 'Bruit — mesure',
    desc: "Norme internationale pour la mesure du bruit en milieu de travail. Méthode d'ingénierie pour le calcul de l'exposition journalière.",
    color: 'border-brand-gold',
  },
  {
    ref: 'ED 6161 (INRS)',
    module: 'Charge physique',
    desc: "Méthode d'évaluation des manutentions manuelles. Grilles de cotation des charges portées, tirées ou poussées.",
    color: 'border-brand-bronze',
  },
  {
    ref: 'OSEV INRS',
    module: 'Vibrations',
    desc: "Outil de screening d'exposition aux vibrations mécaniques. Évalue les vibrations main-bras et corps entier.",
    color: 'border-brand-bronze',
  },
  {
    ref: 'TMS PRO (INRS)',
    module: 'TMS',
    desc: 'Démarche en 4 étapes pour prévenir les troubles musculo-squelettiques. Cotation RULA/REBA et analyse des facteurs de risque.',
    color: 'border-blue-400',
  },
  {
    ref: 'RPS-DU (INRS)',
    module: 'RPS',
    desc: 'Évaluation des risques psychosociaux pour le Document Unique. Basé sur les 6 dimensions du modèle de Gollac.',
    color: 'border-blue-400',
  },
]

export default function OutilPage() {
  return (
    <div className="bg-brand-cream-light">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-brand-cream py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-hero-badge inline-flex items-center gap-2 bg-brand-gold-pale border border-brand-sand rounded-full px-4 py-1.5 text-sm text-brand-bronze mb-6 font-medium">
            SaaS guidé · Modules normés INRS · Export PDF
          </div>
          <h1 className="animate-hero-title text-4xl sm:text-5xl font-extrabold text-brand-navy leading-tight mb-6">
            Tout ce qu&apos;il vous faut pour faire<br className="hidden sm:block" /> votre DUERP, et rien de plus
          </h1>
          <p className="animate-hero-sub text-lg text-brand-bronze max-w-2xl mx-auto leading-relaxed mb-10">
            SafeAnalyse. n&apos;est pas un formulaire à remplir. C&apos;est un guide interactif qui vous
            accompagne module par module, avec des grilles de cotation normées et un langage accessible.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-brand-gold-light text-brand-navy-deep hover:bg-brand-gold font-semibold px-7 py-3 rounded-xl text-base transition-all hover:shadow-[0_4px_20px_rgba(184,134,11,0.3)]"
            >
              Demander un échange
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tarifs"
              className="inline-flex items-center gap-2 border border-brand-navy text-brand-navy hover:bg-brand-navy/5 font-medium px-7 py-3 rounded-xl text-base transition-all"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* ── Parcours utilisateur ─────────────────────────────────────── */}
      <section className="py-20 bg-brand-cream-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-brand-navy">Le parcours utilisateur</h2>
              <p className="mt-3 text-brand-bronze max-w-xl mx-auto">
                De l&apos;inscription à la signature du PDF — en quelques heures, pas en quelques jours.
              </p>
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {parcours.map((step, i) => {
              const Icon = step.icon
              return (
                <AnimateOnScroll
                  key={step.num}
                  animation="fade-up"
                  delay={([0, 100, 200, 300] as const)[i]}
                >
                  <div className="relative bg-brand-off border border-brand-sand rounded-2xl p-6 h-full shadow-[0_1px_3px_rgba(3,25,72,0.04)] hover:shadow-[0_4px_12px_rgba(3,25,72,0.08)] hover:-translate-y-0.5 transition-all duration-200">
                    {/* Numéro de fond */}
                    <span className="absolute top-4 right-5 text-5xl font-black text-brand-navy/5 select-none leading-none">
                      {step.num}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-brand-gold-pale text-brand-gold flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-brand-navy mb-2">{step.titre}</h3>
                    <p className="text-sm text-brand-bronze leading-relaxed">{step.desc}</p>
                  </div>
                </AnimateOnScroll>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités ───────────────────────────────────────────── */}
      <section className="py-20 bg-brand-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-brand-navy">Ce que vous obtenez</h2>
              <p className="mt-3 text-brand-bronze max-w-xl mx-auto">
                Tout ce dont vous avez besoin pour réaliser un DUERP conforme, sans expertise HSE préalable.
              </p>
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fonctionnalites.map((f, i) => (
              <AnimateOnScroll
                key={i}
                delay={([0, 100, 200, 300, 0, 100, 200, 300] as const)[i]}
                animation="fade-up"
              >
                <div className="bg-brand-off border border-brand-sand rounded-xl p-6 h-full shadow-[0_1px_3px_rgba(3,25,72,0.05)] hover:shadow-[0_4px_12px_rgba(3,25,72,0.08)] hover:-translate-y-0.5 transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-brand-gold-pale text-brand-gold flex items-center justify-center mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {f.icon}
                    </svg>
                  </div>
                  <h3 className="font-semibold text-brand-navy mb-2 text-sm">{f.titre}</h3>
                  <p className="text-xs text-brand-bronze leading-relaxed">{f.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── 20 Risques ED840 ─────────────────────────────────────────── */}
      <section className="py-20 bg-brand-cream-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-brand-navy">Les 20 risques couverts</h2>
              <p className="mt-3 text-brand-bronze max-w-xl mx-auto">
                Basé sur la grille ED840 de l&apos;INRS — référence nationale pour l&apos;inventaire des risques professionnels.
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              {Object.entries(typeLabel).map(([k, v]) => (
                <span key={k} className={`inline-flex items-center gap-1.5 text-xs font-medium border px-3 py-1 rounded-full ${typeColor[k]}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                  {v}
                </span>
              ))}
              <span className="text-xs text-brand-bronze/60 italic ml-2">Source : INRS ED840</span>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {risquesED840.map((r, i) => (
              <AnimateOnScroll key={r.num} delay={([0, 100, 200, 0, 100, 200, 0, 100, 200, 0, 100, 200, 0, 100, 200, 0, 100, 200, 0, 100] as const)[i]} animation="fade-up">
                <div className="flex gap-3 bg-brand-off border border-brand-sand rounded-xl p-4 hover:shadow-[0_2px_8px_rgba(3,25,72,0.07)] hover:-translate-y-0.5 transition-all duration-200">
                  <span className="text-xs font-bold text-brand-bronze/40 w-6 shrink-0 mt-0.5">{r.num}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-brand-navy text-sm">{r.nom}</span>
                      <span className={`inline-flex text-[10px] font-bold border px-1.5 py-0.5 rounded ${typeColor[r.type]}`}>
                        {typeLabel[r.type]}
                      </span>
                    </div>
                    <p className="text-xs text-brand-bronze leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Méthodes INRS ────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-navy">Des méthodes officielles intégrées</h2>
              <p className="mt-3 text-brand-bronze max-w-xl mx-auto">
                Chaque module s&apos;appuie sur des publications et outils reconnus par l&apos;INRS et les normes en vigueur.
              </p>
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {methodes.map((m, i) => (
              <AnimateOnScroll key={i} delay={([0, 100, 200, 0, 100, 200] as const)[i]} animation="fade-up">
                <div className={`bg-brand-off border border-brand-sand rounded-xl p-5 border-l-4 ${m.color}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-brand-gold">{m.ref}</span>
                    <span className="text-xs text-brand-bronze/60 bg-brand-cream border border-brand-sand px-2 py-0.5 rounded-full shrink-0">{m.module}</span>
                  </div>
                  <p className="text-sm text-brand-bronze leading-relaxed">{m.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modules ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-cream-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-navy">Les modules de risques</h2>
              <p className="mt-3 text-brand-bronze max-w-xl mx-auto">
                V1 active avec le module Bruit. Les autres modules arrivent progressivement.
              </p>
            </div>
          </AnimateOnScroll>
          <div className="space-y-3">
            {modules.map((m, i) => (
              <AnimateOnScroll key={m.code} delay={([0, 100, 200, 0, 100, 200, 0, 100, 200] as const)[i]} animation="fade-right">
                <div className="flex items-center gap-4 bg-brand-off border border-brand-sand rounded-xl px-5 py-4">
                  <span className="text-xs font-bold text-brand-bronze/60 w-8 shrink-0">{m.code}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-semibold text-brand-navy text-sm">{m.nom}</span>
                      {m.statut === 'actif' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Actif V1
                        </span>
                      ) : (
                        <span className="text-xs font-medium bg-brand-gold-pale text-brand-bronze border border-brand-sand px-2 py-0.5 rounded-full">
                          Bientôt
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-bronze">{m.desc}</p>
                  </div>
                  <span className="text-xs text-brand-bronze/50 hidden sm:block shrink-0">{m.norme}</span>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-navy-deep text-center">
        <div className="max-w-xl mx-auto px-4">
          <AnimateOnScroll animation="fade-up">
            <h2 className="text-2xl font-bold text-brand-cream mb-4">
              Une question avant de vous lancer ?
            </h2>
            <p className="text-brand-cream/60 mb-8">
              Je réponds personnellement à chaque message, sous 24 heures ouvrées.
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
                href="/tarifs"
                className="inline-flex items-center gap-2 border border-brand-cream/40 text-brand-cream/80 hover:bg-brand-cream/10 font-medium px-8 py-3 rounded-xl transition-all"
              >
                Voir les tarifs
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

    </div>
  )
}
