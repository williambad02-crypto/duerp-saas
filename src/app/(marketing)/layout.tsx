import Link from 'next/link'
import { CookieBanner } from '@/components/landing/cookie-banner'
import { Logo } from '@/components/brand/logo'
import { BrandName } from '@/components/brand/brand-name'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-brand-cream/95 backdrop-blur border-b border-brand-sand">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Logo variant="full" theme="default" height={28} />
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-brand-navy hover:text-brand-navy-light transition-colors px-3 py-1.5"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-semibold bg-brand-navy text-brand-off hover:bg-brand-navy-light transition-colors px-4 py-2 rounded-lg"
            >
              Essayer gratuitement
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-brand-navy text-brand-cream/70 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Logo variant="symbol" theme="white" height={28} />
                <BrandName color="cream" className="font-bold text-base" />
              </div>
              <p className="text-sm leading-relaxed">
                L&apos;outil qui simplifie l&apos;évaluation des risques professionnels pour les PME et TPE françaises.
              </p>
            </div>

            <div>
              <p className="font-semibold text-brand-cream text-sm mb-3">Légal</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/mentions-legales" className="hover:text-brand-cream transition-colors">Mentions légales</Link></li>
                <li><Link href="/cgu" className="hover:text-brand-cream transition-colors">Conditions d&apos;utilisation</Link></li>
                <li><Link href="/confidentialite" className="hover:text-brand-cream transition-colors">Politique de confidentialité</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-brand-cream text-sm mb-3">Contact</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/contact" className="hover:text-brand-cream transition-colors">Nous contacter</Link></li>
                <li><Link href="/auth/signup" className="hover:text-brand-cream transition-colors">Créer un compte</Link></li>
                <li><Link href="/auth/login" className="hover:text-brand-cream transition-colors">Se connecter</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-brand-navy-light pt-6 text-sm text-center text-brand-cream/40">
            &copy; {new Date().getFullYear()} SafeAnalyse. — Tous droits réservés
          </div>
        </div>
      </footer>

      <CookieBanner />
    </>
  )
}
