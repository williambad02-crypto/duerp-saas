'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { Quote, Star } from 'lucide-react'
import { CardTilt } from '@/components/marketing/ui'

interface Temoignage {
  quote: string
  nom: string
  role: string
  entreprise: string
  secteur: string
  effectif: string
}

const temoignages: Temoignage[] = [
  {
    quote: "On a fait notre premier DUERP en 3 heures avec SafeAnalyse. Avant, ça me coûtait 1 800 € par an à un cabinet — et je ne comprenais rien à ce qu'il écrivait.",
    nom: 'Marc L.',
    role: "Dirigeant",
    entreprise: "Boulangerie Le Grain d'Or",
    secteur: 'Artisanat',
    effectif: '12 salariés',
  },
  {
    quote: "L'outil parle le langage du terrain. Mes chefs d'équipe ont pu m'aider à remplir l'évaluation des postes — c'était impossible avec les logiciels qu'on avait essayés avant.",
    nom: 'Sophie D.',
    role: 'Responsable QSE',
    entreprise: 'Coopérative Kérisole',
    secteur: 'Agroalimentaire',
    effectif: '85 salariés',
  },
  {
    quote: "William est passé une demi-journée sur site. On a tout fait ensemble, j'ai tout compris. Le DUERP était signé le soir même.",
    nom: 'Thomas R.',
    role: 'Gérant',
    entreprise: 'Menuiserie Le Bois Breton',
    secteur: 'BTP · Artisanat',
    effectif: '6 salariés',
  },
  {
    quote: "Le rappel annuel et la conservation automatique 40 ans, c'est ce qui m'a convaincue. Je ne veux plus jamais perdre mon DUERP dans un disque dur.",
    nom: 'Nathalie F.',
    role: 'Directrice',
    entreprise: "Restaurant L'Iodé",
    secteur: 'Restauration',
    effectif: '28 salariés',
  },
  {
    quote: "Méthodes INRS vraiment intégrées, pas juste citées. Mon service de santé au travail a validé le PDF sans un mot à redire.",
    nom: 'Julien P.',
    role: 'Directeur technique',
    entreprise: 'Atelier Le Relecq',
    secteur: 'Industrie mécanique',
    effectif: '22 salariés',
  },
  {
    quote: "Je voulais abandonner l'idée du DUERP — trop de paperasse. SafeAnalyse. m'a fait changer d'avis. C'est pédagogique, pas punitif.",
    nom: 'Emma V.',
    role: 'Fondatrice',
    entreprise: 'MicroBrasserie Morbihannaise',
    secteur: 'Agroalimentaire',
    effectif: '4 salariés',
  },
]

function StarRating() {
  return (
    <div className="flex gap-0.5" aria-label="5 étoiles sur 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" strokeWidth={1.5} />
      ))}
    </div>
  )
}

function TemoignageCard({ t, i }: { t: Temoignage; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const reduced = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={inView || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay: reduced ? 0 : (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <CardTilt max={2}>
        <div className="relative h-full bg-brand-off border border-brand-sand rounded-2xl p-6 md:p-7 shadow-[0_1px_3px_rgba(3,25,72,0.05)] transition-all hover:border-brand-accent-dark/30 hover:shadow-[0_18px_44px_-18px_rgba(3,105,161,0.28)] flex flex-col">
          <Quote aria-hidden className="w-6 h-6 text-brand-gold/50 mb-3" />
          <p className="text-sm md:text-base text-brand-navy leading-relaxed mb-6 flex-1">
            « {t.quote} »
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-brand-sand/70">
            <div>
              <div className="font-bold text-brand-navy text-sm">{t.nom}</div>
              <div className="text-xs text-brand-bronze">{t.role} · {t.entreprise}</div>
              <div className="text-[11px] text-brand-ink-mute mt-0.5">{t.secteur} · {t.effectif}</div>
            </div>
            <StarRating />
          </div>
        </div>
      </CardTilt>
    </motion.div>
  )
}

export function TemoignagesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {temoignages.map((t, i) => (
        <TemoignageCard key={t.nom + t.entreprise} t={t} i={i} />
      ))}
    </div>
  )
}
