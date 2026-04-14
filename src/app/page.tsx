import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { CookieBanner } from '@/components/landing/cookie-banner'

export const metadata = {
  title: "DUERP SaaS — Votre Document Unique en ligne, simple et conforme",
  description: "L'outil qui guide les PME dans leur évaluation des risques professionnels. Créez votre DUERP en ligne, exportez-le en PDF conforme à la loi du 2 août 2021.",
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <>
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">DUERP</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/auth/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Se connecter
            </Link>
            <Link href="/auth/signup" className={buttonVariants({ size: 'sm' })}>
              Essayer gratuitement
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white py-20 sm:py-32">
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl" />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-800/60 border border-blue-600/40 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Accès gratuit — 14 jours d&apos;essai complet, sans carte bancaire
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              Votre Document Unique<br />
              <span className="text-blue-300">en ligne, simple et conforme</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              L&apos;outil qui guide les PME et TPE françaises dans leur évaluation des risques professionnels.
              Conforme au Code du travail, exportable en PDF officiel.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className={buttonVariants({ size: 'lg', className: 'bg-white text-blue-900 hover:bg-blue-50 font-bold px-8 w-full sm:w-auto' })}
              >
                Créer mon DUERP gratuitement →
              </Link>
              <Link
                href="/auth/login"
                className={buttonVariants({ variant: 'ghost', size: 'lg', className: 'text-blue-200 hover:text-white hover:bg-blue-800/40 w-full sm:w-auto' })}
              >
                J&apos;ai déjà un compte
              </Link>
            </div>
            <p className="mt-6 text-sm text-blue-400">
              Aucune installation — 100 % en ligne — données hébergées en Europe
            </p>
          </div>
        </section>

        {/* ── Comment ça marche ───────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900">Comment ça marche ?</h2>
              <p className="mt-3 text-gray-500 max-w-xl mx-auto">
                Du zéro au DUERP finalisé en quelques heures, sans formation HSE requise.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {([
                { num: "1", titre: "Créez votre entreprise", desc: "Renseignez les informations de votre entreprise : nom, effectif, secteur d'activité, adresse.", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
                { num: "2", titre: "Déclarez vos postes", desc: "Listez les postes de travail de votre entreprise et décomposez-les en opérations concrètes.", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
                { num: "3", titre: "Évaluez chaque risque", desc: "Notre wizard vous guide module par module (bruit, TMS, RPS…) avec des grilles de cotation normées.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                { num: "4", titre: "Générez votre DUERP", desc: "Exportez le Document Unique en PDF horodaté, prêt à présenter à l'inspection du travail.", icon: "M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
              ] as const).map((step, i) => (
                <div key={i} className="flex flex-col items-start">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                    </svg>
                  </div>
                  <div className="text-xs font-bold text-blue-600 mb-1">ÉTAPE {step.num}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.titre}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Arguments ───────────────────────────────────────────────── */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900">Pourquoi choisir cet outil ?</h2>
              <p className="mt-3 text-gray-500 max-w-xl mx-auto">
                Conçu pour les dirigeants de PME qui veulent être conformes sans passer par un cabinet HSE.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { titre: "Conforme au Code du travail", desc: "Méthode fondée sur l'article L4121-1 du Code du travail et la loi du 2 août 2021. Versioning des documents avec conservation 40 ans.", bg: "bg-blue-50 border-blue-200", dot: "bg-blue-600" },
                { titre: "Guidé pas à pas", desc: "Pas besoin d'être expert HSE. Chaque module vous explique ce que vous devez évaluer et comment, avec des grilles normées (INRS, ANSES).", bg: "bg-green-50 border-green-200", dot: "bg-green-600" },
                { titre: "Adapté aux PME et TPE", desc: "Interface simple, accessible sur tablette, pensée pour les dirigeants de terrain. Pas de jargon inutile, que de l'efficacité.", bg: "bg-purple-50 border-purple-200", dot: "bg-purple-600" },
                { titre: "Export PDF professionnel", desc: "Générez en un clic un PDF structuré avec couverture, tableau APR, plan de maîtrise et programme annuel de prévention.", bg: "bg-orange-50 border-orange-200", dot: "bg-orange-500" },
              ].map((arg, i) => (
                <div key={i} className={`rounded-2xl border p-6 ${arg.bg}`}>
                  <div className={`w-2 h-2 rounded-full ${arg.dot} mb-4`} />
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{arg.titre}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{arg.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tarifs simples, sans surprise</h2>
            <p className="text-gray-500 mb-12 max-w-xl mx-auto">
              Un seul plan tout inclus. Vous payez quand vous êtes prêt.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm flex flex-col">
                <div className="text-sm font-medium text-gray-500 mb-2">Mensuel</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-gray-900">39€</span>
                  <span className="text-gray-400 text-sm">/mois</span>
                </div>
                <p className="text-xs text-gray-400 mb-6">Sans engagement</p>
                <ul className="text-sm text-gray-600 space-y-2 mb-8 text-left flex-1">
                  {["Postes et opérations illimités", "Tous les modules de risques", "Export PDF DUERP", "Versioning 40 ans", "Support par email"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className={buttonVariants({ variant: 'outline', className: 'w-full' })}>
                  Commencer l&apos;essai gratuit
                </Link>
              </div>
              <div className="rounded-2xl border-2 border-blue-700 bg-blue-700 p-8 shadow-md flex flex-col relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  1 MOIS OFFERT
                </div>
                <div className="text-sm font-medium text-blue-200 mb-2">Annuel</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-white">390€</span>
                  <span className="text-blue-300 text-sm">/an</span>
                </div>
                <p className="text-xs text-blue-300 mb-6">Soit 32,50€/mois — économisez 78€</p>
                <ul className="text-sm text-blue-100 space-y-2 mb-8 text-left flex-1">
                  {["Tout le plan mensuel inclus", "Facture annuelle unique", "Accès prioritaire aux nouveautés"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-300 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className={buttonVariants({ className: 'w-full bg-white text-blue-900 hover:bg-blue-50 font-bold' })}>
                  Commencer l&apos;essai gratuit
                </Link>
              </div>
            </div>
            <p className="mt-8 text-sm text-gray-400">
              14 jours d&apos;essai gratuit complet — aucune carte bancaire requise
            </p>
          </div>
        </section>

        {/* ── CTA final ───────────────────────────────────────────────── */}
        <section className="py-20 bg-blue-950 text-white text-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold mb-4">Prêt à réaliser votre DUERP ?</h2>
            <p className="text-blue-200 mb-8">
              Rejoignez les PME qui ont simplifié leur conformité HSE. Démarrez gratuitement, sans engagement.
            </p>
            <Link
              href="/auth/signup"
              className={buttonVariants({ size: 'lg', className: 'bg-white text-blue-900 hover:bg-blue-50 font-bold px-10' })}
            >
              Créer mon DUERP gratuitement →
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">D</span>
                </div>
                <span className="font-bold text-white text-base">DUERP</span>
              </div>
              <p className="text-sm leading-relaxed">
                L&apos;outil qui simplifie l&apos;évaluation des risques professionnels pour les PME et TPE françaises.
              </p>
            </div>
            <div>
              <p className="font-semibold text-white text-sm mb-3">Légal</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
                <li><Link href="/cgu" className="hover:text-white transition-colors">Conditions d&apos;utilisation</Link></li>
                <li><Link href="/confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white text-sm mb-3">Contact</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/contact" className="hover:text-white transition-colors">Nous contacter</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Créer un compte</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Se connecter</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-sm text-center text-gray-500">
            &copy; {new Date().getFullYear()} DUERP SaaS — Tous droits réservés
          </div>
        </div>
      </footer>

      <CookieBanner />
    </>
  )
}
