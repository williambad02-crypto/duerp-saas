# Phase Branding — Application de la charte SafeAnalyse.

## Contexte

Le site s'appelle désormais **SafeAnalyse.** (plus "DUERP SaaS"). On applique la nouvelle charte graphique (palette Premium doré) définie dans `DUERP/04_DEVELOPPEMENT/BRAND.md`.

⚠️ **Prérequis** : cette phase doit être lancée APRÈS la refonte du Module 5 (PHASE_REVISION.md). Ne pas mélanger les deux chantiers.

## Fichier de référence à lire OBLIGATOIREMENT

`DUERP/04_DEVELOPPEMENT/BRAND.md` — charte graphique complète avec toutes les couleurs, typographie, règles d'usage.

## Logo — à placer

Les fichiers logo sont dans `DUERP/04_DEVELOPPEMENT/brand/` et doivent être copiés dans `public/logo/` du projet :

- `logo-full.svg` — logo complet (symbole + "SafeAnalyse.") navy
- `logo-full-white.svg` — version crème pour fond sombre
- `logo-symbol.svg` — symbole seul (le "S") navy
- `logo-symbol-white.svg` — symbole blanc

Les favicons devront être générés séparément sur [realfavicongenerator.net](https://realfavicongenerator.net) depuis `logo-symbol.svg`.

## Ce qu'il faut faire

### 1. Configuration Tailwind

Met à jour `tailwind.config.ts` pour définir les couleurs de la marque :

```typescript
colors: {
  // Marque SafeAnalyse
  brand: {
    navy: '#031948',
    'navy-light': '#0A2E5C',
    cream: '#F5EEE1',
    'cream-light': '#FAF6ED',
    off: '#FDFBF5',
    gold: '#B8860B',
    'gold-light': '#DAA520',
    'gold-pale': '#FDF4D3',
    bronze: '#8B6F47',
    sand: '#E5DDC9',
    'sand-dark': '#C9BFA5',
  },
  // Criticité (fonctionnel, non modifiable)
  criticite: {
    vert: '#16A34A',
    jaune: '#CA8A04',
    orange: '#EA580C',
    rouge: '#DC2626',
  },
}
```

### 2. Polices

Installe et configure Inter via next/font/google dans `src/app/layout.tsx` :

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
})
```

### 3. Renommage du site

Remplace **toutes les occurrences** de "DUERP SaaS" par **"SafeAnalyse."** dans :
- Les meta tags
- La landing page
- Les emails système
- Le PDF généré
- Les messages de bienvenue
- Le README

Style typographique du nom :
- **"Safe"** en Bold (700)
- **"Analyse"** en Regular (400)
- **"."** en Bold (700)

Crée un composant `<BrandName />` qui applique ce style automatiquement.

### 4. Landing page — refonte visuelle

- **Fond principal** : `bg-brand-cream` (#F5EEE1)
- **Header** : logo complet à gauche, nav en navy, fond crème
- **Hero** : Badge "14 jours gratuits" en or pâle, titre navy, sous-titre bronze, CTA en or vieilli
- **Section "Comment ça marche"** : fond `bg-brand-cream-light`, cartes blanc cassé avec bordure sable
- **Footer** : fond `bg-brand-navy`, texte `text-brand-cream`, logo en version blanche

### 5. Dashboard — refonte visuelle

**Sidebar** :
- Fond `bg-brand-navy` (#031948)
- Logo complet en version **blanche** en haut
- Items navigation : texte `text-brand-off`, hover `bg-brand-navy-light`
- Item actif : `bg-brand-navy-light` + barre gauche `bg-brand-gold-light` (4px)

**Header dashboard** :
- Fond `bg-brand-off`
- Breadcrumb en `text-brand-bronze`

**Zone de contenu** :
- Fond `bg-brand-cream-light`
- Cartes : `bg-brand-off`, bordure `border-brand-sand`
- Titres H1/H2 : `text-brand-navy`
- Texte descriptif : `text-brand-bronze`

**Formulaires** :
- Inputs : fond `bg-brand-off`, bordure `border-brand-sand`, focus `border-brand-navy`
- Labels : `text-brand-bronze`, font-medium, text-sm

### 6. Composants à créer

**`<BrandName />`**
```tsx
export function BrandName() {
  return (
    <span>
      <span className="font-bold">Safe</span>
      <span className="font-normal">Analyse</span>
      <span className="font-bold">.</span>
    </span>
  )
}
```

**`<Logo />`** avec variants `full`/`symbol` et `default`/`white`.

**Boutons typés**
- `<Button variant="primary">` → navy
- `<Button variant="cta">` → or vieilli (uniquement conversion)
- `<Button variant="secondary">` → outline navy

### 7. Favicon et meta

- Copie les favicons à la racine de `public/`
- Met à jour les meta dans `src/app/layout.tsx` :
  ```typescript
  export const metadata = {
    title: 'SafeAnalyse. — Votre DUERP en ligne, simple et conforme',
    description: 'L\'outil DUERP guidé pour les PME françaises...',
    openGraph: {
      title: 'SafeAnalyse. — Votre DUERP en ligne',
      description: '...',
      images: ['/logo/og-image.png'],
      url: 'https://duerp-saas.vercel.app',
    },
    themeColor: '#031948',
  }
  ```

### 8. Email Supabase (templates)

À faire manuellement depuis le dashboard Supabase. Remplacer "DUERP SaaS" par "SafeAnalyse." et utiliser la couleur navy #031948 pour les boutons.

### 9. PDF — mise à jour du style

- Utiliser la police Inter (si supportée, sinon Helvetica)
- Logo en haut de la page de garde
- Titre "Document Unique d'Évaluation des Risques Professionnels — SafeAnalyse." en navy
- Pied de page : "Généré via SafeAnalyse." en bronze

### 10. Validation

À la fin :
- `npm run build` doit passer sans erreur
- Teste landing page, signup, dashboard, formulaires, PDF
- Vérifie que le logo s'affiche dans tous les contextes
- Vérifie que "SafeAnalyse." apparaît partout à la place de "DUERP SaaS"

### 11. Commit et push

```
git add .
git commit -m "Charte graphique SafeAnalyse. - Palette Premium doré"
git push
```

## Ce qu'il ne faut PAS toucher

- La logique métier (calculs de criticité, règles de présélection)
- Le schéma de base de données
- Les API Routes Stripe
- Le flux d'authentification
- Les fichiers de migration SQL

Juste le style et le nommage.
