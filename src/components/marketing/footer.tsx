import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { BrandName } from '@/components/brand/brand-name'

export function MarketingFooter() {
  return (
    <footer className="bg-brand-navy text-brand-cream/70 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Marque — col large */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Logo variant="symbol" theme="white" height={28} />
              <BrandName color="cream" className="font-bold text-base" />
            </div>
            <p className="text-sm leading-relaxed mb-4">
              L&apos;outil DUERP guidé pour les PME françaises.
              Conforme au Code du travail, exportable en PDF officiel.
            </p>
            <Link
              href="/auth/signup"
              className="inline-block text-xs font-semibold bg-brand-gold text-brand-off hover:bg-brand-gold-light px-4 py-2 rounded-lg transition-colors"
            >
              Essai gratuit 14 jours →
            </Link>
          </div>

          {/* Produit */}
          <div>
            <p className="font-semibold text-brand-cream text-sm mb-3">Produit</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/outil" className="hover:text-brand-cream transition-colors">L&apos;outil</Link></li>
              <li><Link href="/tarifs" className="hover:text-brand-cream transition-colors">Tarifs</Link></li>
              <li><Link href="/auth/signup" className="hover:text-brand-cream transition-colors">Essai gratuit</Link></li>
              <li><Link href="/auth/login" className="hover:text-brand-cream transition-colors">Se connecter</Link></li>
            </ul>
          </div>

          {/* À propos */}
          <div>
            <p className="font-semibold text-brand-cream text-sm mb-3">À propos</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/a-propos" className="hover:text-brand-cream transition-colors">Qui je suis</Link></li>
              <li><Link href="/reglementation" className="hover:text-brand-cream transition-colors">Réglementation</Link></li>
              <li><Link href="/contact" className="hover:text-brand-cream transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Légal & Suivi */}
          <div>
            <p className="font-semibold text-brand-cream text-sm mb-3">Légal</p>
            <ul className="space-y-2 text-sm mb-6">
              <li><Link href="/cgu" className="hover:text-brand-cream transition-colors">Conditions d&apos;utilisation</Link></li>
              <li><Link href="/mentions-legales" className="hover:text-brand-cream transition-colors">Mentions légales</Link></li>
              <li><Link href="/confidentialite" className="hover:text-brand-cream transition-colors">Confidentialité</Link></li>
            </ul>
            <p className="font-semibold text-brand-cream text-sm mb-3">Suivi</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-brand-cream transition-colors">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="mailto:contact@safeanalyse.fr" className="hover:text-brand-cream transition-colors">
                  contact@safeanalyse.fr
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-cream/40">
          <span>&copy; {new Date().getFullYear()} SafeAnalyse. — Tous droits réservés</span>
          <span>Données hébergées en Europe · RGPD conforme</span>
        </div>
      </div>
    </footer>
  )
}
