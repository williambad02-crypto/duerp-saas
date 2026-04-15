'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { RotateCw, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'AIGU' | 'CHRONIQUE'

interface Risque {
  num: string
  nom: string
  type: Tab
  definition: string
  prevention?: string
  references?: string
}

/**
 * Descriptions dérivées de la synthèse ED 840 (INRS)
 * — DUERP/01_FONDATIONS/ED840_SYNTHESE.txt
 * Classification sur demande utilisateur : Bruit → CHRONIQUE, Chimique → AIGU,
 * Ambiances thermiques → CHRONIQUE.
 */
const risques: Risque[] = [
  { num: '01', nom: 'Chute de plain-pied', type: 'AIGU',
    definition: 'Glissades, trébuchements, faux pas sur surface plane ou à faible dénivellation. 2ᵉ cause d’AT — souvent sous-estimée.',
    prevention: 'Conception anti-dérapante, entretien, rangement, chaussures de sécurité.' },
  { num: '02', nom: 'Chute de hauteur', type: 'AIGU',
    definition: 'Chute avec différence de niveau significative : échelles, toits, fosses, quais. Conséquences souvent graves.',
    prevention: 'Protections collectives (garde-corps, filets), EPI antichute, formation travail en hauteur.',
    references: 'INRS ED 6110' },
  { num: '03', nom: 'Circulations internes', type: 'AIGU',
    definition: 'Heurt d’une personne par un véhicule ou engin interne (chariot, camion) ou collision entre véhicules.',
    prevention: 'Séparation des flux, signalisation, limitation de vitesse, formation, entretien.' },
  { num: '04', nom: 'Risques routiers en mission', type: 'AIGU',
    definition: 'Accidents lors de déplacements professionnels (voiture, utilitaire, deux-roues, poids lourd).',
    prevention: 'Organisation des déplacements, charte téléphone, politique de prévention routière.' },
  { num: '05', nom: 'Charge physique', type: 'CHRONIQUE',
    definition: 'Source de TMS et de fatigue chronique. Facteurs : efforts, fréquence des gestes, postures, organisation.',
    prevention: 'Aides techniques, conception des postes, formation PRAP, alternance des postures.',
    references: 'INRS ED 6161 / ED 6291' },
  { num: '06', nom: 'Manutention mécanique', type: 'AIGU',
    definition: 'Accidents liés à la charge manutentionnée (chute, heurt, renversement) ou au moyen de manutention.',
    prevention: 'Matériel conforme, arrimage rigoureux, formation CACES, vérifications périodiques.',
    references: 'INRS ED 766, ED 6339' },
  { num: '07', nom: 'Produits chimiques', type: 'AIGU',
    definition: 'Intoxication aiguë, brûlure, irritation par CMR, corrosifs, solvants. Également cancers professionnels (composante chronique).',
    prevention: 'Substitution, captation des vapeurs/poussières, EPI adaptés, fiches de données de sécurité.',
    references: 'Outil SEIRICH (INRS)' },
  { num: '08', nom: 'Agents biologiques', type: 'CHRONIQUE',
    definition: 'Risques d’infection, allergie ou intoxication liés à des micro-organismes (bactéries, virus, parasites, champignons).',
    prevention: 'Ventilation, désinfection, vaccinations, EPI (gants, masques), formation hygiène.' },
  { num: '09', nom: 'Équipements de travail', type: 'AIGU',
    definition: 'Blessures mécaniques par éléments de machines, outils, projections. Parties mobiles, fluides sous pression.',
    prevention: 'Machines conformes CE, protecteurs fixes/mobiles, procédures de consignation, EPI.' },
  { num: '10', nom: "Chutes d’objets", type: 'AIGU',
    definition: 'Chute d’objets depuis un niveau supérieur, effondrement de matériaux ou de structures.',
    prevention: 'Organisation des stockages, protections contre chutes d’objets, casque obligatoire.',
    references: 'INRS ED 771' },
  { num: '11', nom: 'Bruit', type: 'CHRONIQUE',
    definition: 'Surdité professionnelle par exposition quotidienne prolongée. Effets extra-auditifs : stress, fatigue. La surdité est IRRÉVERSIBLE.',
    prevention: 'Réduction à la source (encoffrement, silencieux), organisation, protecteurs auditifs en dernier recours.',
    references: 'INRS ED 6035 · ISO 9612' },
  { num: '12', nom: 'Ambiances thermiques', type: 'CHRONIQUE',
    definition: 'Fatigue chronique, dermatoses, stress thermique. Exposition prolongée au chaud, au froid ou à l’humidité.',
    prevention: 'Climatisation/chauffage adapté, pauses en local tempéré, hydratation, EPI thermiques.',
    references: 'Indices WBGT / IREQ' },
  { num: '13', nom: 'Incendie / ATEX', type: 'AIGU',
    definition: 'Brûlures, blessures, intoxication, rupture de tympan. Produits inflammables, atmosphères explosibles, points chauds.',
    prevention: 'Substitution, limitation des quantités, captation des vapeurs, matériel ATEX, compartimentage.',
    references: 'Directive 1999/92/CE' },
  { num: '14', nom: 'Électricité', type: 'AIGU',
    definition: 'Brûlures, électrisation, électrocution par contact avec pièce sous tension ou arc électrique.',
    prevention: 'Installations par personnel habilité, contrôles périodiques, habilitation électrique, consignation.',
    references: 'INRS ED 6109, ED 6127, ED 6177' },
  { num: '15', nom: 'Ambiances lumineuses', type: 'CHRONIQUE',
    definition: 'Éclairage inadapté favorisant fatigue visuelle, accidents, postures contraignantes (lien direct avec TMS).',
    prevention: 'Éclairage naturel dès la conception, adaptation aux tâches, réduction des éblouissements, maintenance.' },
  { num: '16', nom: 'Rayonnements', type: 'CHRONIQUE',
    definition: 'Champs électromagnétiques, rayonnements optiques (UV, laser), rayonnements ionisants. Effets : lésions cutanées, oculaires, cancers.',
    prevention: 'Blindages, zones de sécurité, écrans filtrants, dosimétrie, surveillance médicale renforcée.',
    references: 'Directives 2013/59/Euratom, 2013/35/UE' },
  { num: '17', nom: 'Risques psychosociaux', type: 'CHRONIQUE',
    definition: 'Atteintes à la santé mentale et physique liées aux conditions de travail et aux relations sociales. Modèles Karasek / Siegrist.',
    prevention: 'Organisation du travail, management participatif, expression des salariés, anticipation des changements.',
    references: 'INRS ED 6403 (RPS-DU), ED 6250, ED 6349' },
  { num: '18', nom: 'Vibrations', type: 'CHRONIQUE',
    definition: 'Vibrations main-bras (syndrome de Raynaud, neuropathies) et corps entier (lombalgies chroniques, hernies discales).',
    prevention: 'Choix des équipements, rotation, pauses, maintenance, EPI anti-vibratiles.',
    references: 'Directive 2002/44/CE' },
  { num: '19', nom: 'Heurts / Cognements', type: 'AIGU',
    definition: 'Heurt contre éléments fixes de l’environnement. Contusions, plaies, entorses — peut provoquer une chute.',
    prevention: 'Rangement, signalisation, éclairage adapté, dégagement des zones de circulation.',
    references: 'INRS ED 140' },
  { num: '20', nom: 'Pratiques addictives', type: 'CHRONIQUE',
    definition: 'Consommation de substances psychoactives (alcool, tabac, cannabis, médicaments). Troubles de vigilance, accidents, dépendance.',
    prevention: 'Programme de prévention global, lien fort avec RPS et charge physique.',
    references: 'INRS ED 6505' },
]

function FlipCard({ r }: { r: Risque }) {
  const reduced = useReducedMotion()
  const [flipped, setFlipped] = useState(false)

  return (
    <button
      type="button"
      onClick={() => setFlipped((v) => !v)}
      aria-pressed={flipped}
      aria-label={`Retourner la carte : ${r.nom}`}
      className="group relative w-full aspect-[4/5] text-left [perspective:1200px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent-dark/50 rounded-2xl"
    >
      <motion.div
        className="absolute inset-0 [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Recto */}
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl bg-brand-off border border-brand-sand p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(3,25,72,0.05)] group-hover:shadow-[0_14px_30px_-16px_rgba(3,105,161,0.28)] group-hover:border-brand-accent-dark/30 transition-all">
          <span className="text-xs font-extrabold text-brand-gold">#{r.num}</span>
          <h3 className="font-bold text-brand-navy text-lg leading-tight">{r.nom}</h3>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-brand-sand text-brand-bronze group-hover:border-brand-accent-dark/40 group-hover:text-brand-accent-dark transition-colors" aria-hidden>
            <RotateCw className="w-4 h-4" />
          </span>
        </div>

        {/* Verso */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl bg-brand-navy text-brand-cream p-5 flex flex-col overflow-hidden shadow-[0_14px_30px_-10px_rgba(3,25,72,0.45)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-gold-light">Fiche {r.num} · ED 840</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 border border-white/15">
              {r.type === 'AIGU' ? 'Aigu' : 'Chronique'}
            </span>
          </div>
          <h3 className="font-bold text-brand-cream text-base leading-snug mb-3">{r.nom}</h3>
          <p className="text-[12.5px] leading-relaxed text-brand-cream/85 flex-1 overflow-y-auto pr-1">{r.definition}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            {r.references ? (
              <span className="text-[10px] text-brand-gold-light font-semibold truncate">{r.references}</span>
            ) : <span />}
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 border border-white/15 text-brand-cream/90 shrink-0" aria-hidden>
              <RotateCcw className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </motion.div>
    </button>
  )
}

export function RisquesMethodes() {
  const [tab, setTab] = useState<Tab>('AIGU')
  const [direction, setDirection] = useState<1 | -1>(1)
  const reduced = useReducedMotion()

  const switchTab = (t: Tab) => {
    if (t === tab) return
    setDirection(t === 'CHRONIQUE' ? 1 : -1)
    setTab(t)
  }

  const filtered = risques.filter((r) => r.type === tab)
  const count = {
    AIGU: risques.filter((r) => r.type === 'AIGU').length,
    CHRONIQUE: risques.filter((r) => r.type === 'CHRONIQUE').length,
  }

  return (
    <div>
      {/* Toggle Aigu / Chronique avec pill partagée (layoutId) */}
      <div className="flex justify-center mb-10">
        <div
          role="tablist"
          aria-label="Filtrer les risques par type"
          className="relative inline-flex items-center bg-brand-off border border-brand-sand rounded-full p-1 shadow-[0_2px_8px_-3px_rgba(3,25,72,0.1)]"
        >
          {(['AIGU', 'CHRONIQUE'] as const).map((t) => {
            const active = tab === t
            return (
              <button
                key={t}
                role="tab"
                aria-selected={active}
                onClick={() => switchTab(t)}
                className={cn(
                  'relative z-10 px-6 py-2 text-sm font-semibold rounded-full transition-colors duration-200 flex items-center gap-2',
                  active ? 'text-brand-off' : 'text-brand-ink-soft hover:text-brand-navy',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="risques-pill"
                    className="absolute inset-0 rounded-full bg-brand-navy z-[-1]"
                    transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
                <span>{t === 'AIGU' ? 'Risques aigus' : 'Risques chroniques'}</span>
                <span className={cn(
                  'text-xs font-semibold rounded-full px-1.5 py-0.5',
                  active ? 'bg-white/20' : 'bg-brand-sand/60 text-brand-bronze',
                )}>
                  {count[t]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Grille — slide complet gauche/droite au changement d'onglet */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={tab}
            custom={direction}
            initial={reduced ? { opacity: 0 } : { x: direction * 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { x: direction * -80, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filtered.map((r) => (
              <FlipCard key={r.num} r={r} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
