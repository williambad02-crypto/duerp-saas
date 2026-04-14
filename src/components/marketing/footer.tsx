import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { BrandName } from '@/components/brand/brand-name'

export function MarketingFooter() {
  return (
    <footer className="bg-brand-navy text-brand-cream/70 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
          {/* Marque */}
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Logo variant="symbol" theme="white" height={28} />
              <BrandName color="cream" className="font-bold text-base" />
            </div>
            <p className="text-sm leading-relaxed">
              L&apos;outil DUERP guidé pour les PME françaises.
            </p>
          </div>

          {/* L'outil */}
          <div>
            <p className="font-semibold text-brand-cream text-sm mb-3">L&apos;outil</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/outil" className="hover:text-brand-cream transition-colors">Fonctionnalités</Link></li>
              <li><Link href="/reglementation" className="hover:text-brand-cream transition-colors">Réglementation</Link></li>
              <li><Link href="/tarifs" className="hover:text-brand-cream transition-colors">Tarifs</Link></li>
              <li><Link href="/a-propos" className="hover:text-brand-cream transition-colors">Qui je suis</Link></li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <p className="font-semibold text-brand-cream text-sm mb-3">Légal</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/mentions-legales" className="hover:text-brand-cream transition-colors">Mentions légales</Link></li>
              <li><Link href="/cgu" className="hover:text-brand-cream transition-colors">Conditions d&apos;utilisation</Link></li>
              <li><Link href="/confidentialite" className="hover:text-brand-cream transition-colors">Confidentialité</Link></li>
            </ul>
          </div>

          {/* Contact */}
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
  )
}
