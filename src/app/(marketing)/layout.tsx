import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { CookieBanner } from '@/components/landing/cookie-banner'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
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
            <Link
              href="/auth/login"
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              Se connecter
            </Link>
            <Link
              href="/auth/signup"
              className={buttonVariants({ size: 'sm' })}
            >
              Essayer gratuitement
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

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
