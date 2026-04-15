import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

const footerLinks = {
  produit: [
    { label: "L'outil", href: '/outil' },
    { label: 'Tarifs', href: '/tarifs' },
    { label: 'Comparatif', href: '/comparatif' },
    { label: 'FAQ', href: '/faq' },
  ],
  apropos: [
    { label: 'Qui je suis', href: '/a-propos' },
    { label: 'Réglementation', href: '/reglementation' },
    { label: 'Témoignages', href: '/temoignages' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: "CGU", href: '/cgu' },
    { label: 'Mentions légales', href: '/mentions-legales' },
    { label: 'Confidentialité', href: '/confidentialite' },
  ],
}

export function MarketingFooter() {
  return (
    <footer className="bg-brand-navy-deep text-brand-cream/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* Grille 4 colonnes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Colonne 1 — Marque + accroche */}
          <div className="lg:col-span-1">
            <Logo variant="full" theme="white" height={28} className="mb-4" />
            <p className="text-sm leading-relaxed text-brand-cream/60 mb-5">
              Le DUERP fait sérieusement, sans usine à gaz.
            </p>
            <Link
              href="/contact"
              className="inline-block text-xs font-semibold bg-brand-gold text-brand-off hover:bg-brand-gold-light px-4 py-2 rounded-lg transition-colors"
            >
              Demander un échange →
            </Link>
          </div>

          {/* Colonne 2 — Produit */}
          <div>
            <p className="font-semibold text-brand-cream text-sm mb-4 uppercase tracking-wider text-xs">
              Produit
            </p>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.produit.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand-cream transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 — À propos */}
          <div>
            <p className="font-semibold text-brand-cream text-sm mb-4 uppercase tracking-wider text-xs">
              À propos
            </p>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.apropos.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand-cream transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 — Légal */}
          <div>
            <p className="font-semibold text-brand-cream text-sm mb-4 uppercase tracking-wider text-xs">
              Légal
            </p>
            <ul className="space-y-2.5 text-sm mb-8">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand-cream transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Réseaux */}
            <p className="font-semibold text-brand-cream text-xs mb-3 uppercase tracking-wider">
              Suivre
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn de SafeAnalyse."
                className="flex items-center gap-1.5 text-sm hover:text-brand-cream transition-colors"
              >
                {/* Icône LinkedIn SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Barre de bas */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-cream/35">
          <span>
            © 2026 SafeAnalyse. — Morbihan, France · Fait avec 🛡️ pour les PME industrielles
          </span>
          <span>Données hébergées en Europe · RGPD conforme</span>
        </div>
      </div>
    </footer>
  )
}
