import { createClient } from '@/lib/supabase/server'
import { PricingToggle } from './pricing-toggle'
import { redirect } from 'next/navigation'

export const metadata = {
  title: "Tarifs — SafeAnalyse.",
  description: "Un seul plan tout inclus. 14 jours d'essai gratuit sans carte bancaire.",
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si connecté et abonné actif → dashboard
  if (user) {
    const { data: abo } = await supabase
      .from('abonnements')
      .select('statut')
      .eq('user_id', user.id)
      .single()
    if (abo?.statut === 'active') redirect('/dashboard')
  }

  const faq = [
    {
      q: "Qu'est-ce qu'un DUERP ?",
      r: "Le Document Unique d'Évaluation des Risques Professionnels (DUERP) est un document obligatoire pour toute entreprise ayant au moins 1 salarié (art. L4121-3 du Code du travail). Il recense l'ensemble des risques professionnels auxquels sont exposés les salariés et fixe les actions de prévention correspondantes.",
    },
    {
      q: "Est-ce vraiment obligatoire ?",
      r: "Oui. Le défaut de DUERP est passible d'une amende pénale pouvant aller jusqu'à 1 500€ par infraction (3 000€ en cas de récidive). Depuis la loi du 2 août 2021, il doit être mis à jour au minimum une fois par an et conservé pendant 40 ans.",
    },
    {
      q: "Ai-je besoin d'une formation HSE pour utiliser cet outil ?",
      r: "Non. L'outil est conçu pour les dirigeants de PME sans expertise HSE. Chaque module vous explique la méthode d'évaluation, vous pose les bonnes questions et calcule automatiquement les niveaux de criticité.",
    },
    {
      q: "Mes données sont-elles sécurisées ?",
      r: "Oui. Les données sont stockées dans des bases de données PostgreSQL avec isolation stricte par utilisateur (Row Level Security). Chaque utilisateur ne peut accéder qu'à ses propres données. Les connexions sont chiffrées en TLS.",
    },
    {
      q: "Puis-je annuler à tout moment ?",
      r: "Oui. L'abonnement mensuel est sans engagement et peut être résilié à tout moment depuis votre espace client. Vos données sont conservées en lecture seule pendant 40 ans (obligation légale) après résiliation.",
    },
    {
      q: "Comment fonctionne la période d'essai ?",
      r: "L'essai gratuit de 14 jours vous donne accès à toutes les fonctionnalités sans restriction. Aucune carte bancaire n'est requise pour démarrer. À l'issue des 14 jours, vous devez souscrire un abonnement pour continuer à modifier vos évaluations et exporter le PDF.",
    },
  ]

  return (
    <div className="flex flex-col">

      {/* Hero pricing */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-blue-950 to-blue-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Tarifs simples,<br />sans surprise
          </h1>
          <p className="text-blue-200 text-lg mb-3">
            Un seul plan tout inclus. Accès immédiat. 14 jours d&apos;essai gratuit.
          </p>
          <p className="text-blue-400 text-sm">
            Aucune carte bancaire requise pour commencer
          </p>
        </div>
      </section>

      {/* Pricing cards avec toggle */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <PricingToggle isLoggedIn={!!user} />
        </div>
      </section>

      {/* Fonctionnalités incluses */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Tout est inclus dans chaque plan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "🏢", titre: "Postes et opérations illimités", desc: "Créez autant de postes de travail et d'opérations que nécessaire." },
              { icon: "📊", titre: "Tableau APR complet", desc: "Visualisez tous vos risques évalués filtrés et triés." },
              { icon: "📄", titre: "Export PDF professionnel", desc: "Générez votre DUERP officiel en PDF horodaté à tout moment." },
              { icon: "🔒", titre: "Versioning 40 ans", desc: "Chaque version générée est archivée conformément à la loi 2021." },
              { icon: "🧭", titre: "Modules guidés", desc: "Bruit (M01 actif), TMS, RPS, Vibrations (à venir)." },
              { icon: "📧", titre: "Support par email", desc: "Réponse sous 48h ouvrées pour toute question technique ou métier." },
            ].map((f) => (
              <div key={f.titre} className="flex gap-3 bg-white rounded-xl border border-gray-200 p-4">
                <span className="text-2xl shrink-0">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{f.titre}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Questions fréquentes</h2>
          <div className="space-y-6">
            {faq.map(({ q, r }) => (
              <div key={q} className="border-b border-gray-100 pb-6 last:border-0">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 bg-blue-950 text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-3">Prêt à commencer ?</h2>
          <p className="text-blue-200 text-sm mb-6">
            Rejoignez les PME qui ont simplifié leur conformité HSE.
          </p>
          <a
            href="/auth/signup"
            className="inline-block bg-white text-blue-900 font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition text-sm"
          >
            Créer mon compte gratuit →
          </a>
        </div>
      </section>

    </div>
  )
}
