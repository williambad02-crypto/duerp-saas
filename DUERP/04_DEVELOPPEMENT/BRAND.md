# SafeAnalyse. — Charte graphique

## Nom de la marque

**SafeAnalyse.** (avec le point final comme élément graphique)

- Jamais écrire "SafetyAnalysis" (version anglaise abandonnée)
- Toujours écrire "SafeAnalyse" avec un **A** majuscule sur "Analyse" dans les contextes de marque
- Le point final est partie intégrante du nom dans les contextes formels (logo, titres)
- En texte courant, on peut écrire "SafeAnalyse" sans le point
- Style typographique : **"Safe"** en Bold (700) + "Analyse" en Regular (400) + **"."** en Bold

**Positionnement :** L'outil DUERP simple et conforme pour les PME françaises.
**Personnalité :** Pro · Rassurant · Premium · Classique élégant

## Palette de couleurs — Premium doré

### Toutes les couleurs

| # | Rôle | Hex | Usage principal |
|---|---|---|---|
| 1 | **Navy du logo** | `#031948` | Couleur du logo, texte principal, boutons primaires, sidebar |
| 2 | **Navy clair** | `#0A2E5C` | Hover sur les boutons primaires, variations |
| 3 | **Crème doux (fond logo)** | `#F5EEE1` | Fond principal des pages publiques (landing, marketing) |
| 4 | **Crème très clair** | `#FAF6ED` | Fond alternatif (dashboard, sections) |
| 5 | **Blanc cassé** | `#FDFBF5` | Fond des cartes, des inputs, des zones de saisie |
| 6 | **Or vieilli** | `#B8860B` | CTA de conversion uniquement ("Démarrer l'essai", "S'abonner") |
| 7 | **Or clair** | `#DAA520` | Hover sur les CTA dorés, accents actifs dans la sidebar |
| 8 | **Or pâle** | `#FDF4D3` | Fond des badges "Essai gratuit", highlights doux |
| 9 | **Bronze** | `#8B6F47` | Texte secondaire, descriptions, labels, métadonnées |
| 10 | **Sable** | `#E5DDC9` | Bordures de cartes, séparateurs, lignes |
| 11 | **Sable foncé** | `#C9BFA5` | Bordures d'inputs au focus, détails |

### Couleurs de criticité (fonctionnelles, non modifiables)

| Niveau | Score | Fond badge | Texte badge | Code fort |
|---|---|---|---|---|
| Faible | 1-4 | `#D1FAE5` | `#065F46` | `#16A34A` |
| Modéré | 5-9 | `#FEF3C7` | `#92400E` | `#CA8A04` |
| Élevé | 10-14 | `#FFEDD5` | `#9A3412` | `#EA580C` |
| Critique | 15-20 | `#FEE2E2` | `#991B1B` | `#DC2626` |

### États système

| État | Hex | Usage |
|---|---|---|
| Succès | `#059669` | Validation, sauvegarde réussie |
| Avertissement | `#D97706` | Attention, champs obligatoires |
| Erreur | `#DC2626` | Erreurs de formulaire, messages critiques |
| Information | `#2563EB` | Messages d'aide, tooltips |

## Répartition par écran / composant

### Landing page (accueil public)

- **Header** : fond crème `#F5EEE1`, logo navy, navigation en navy
- **Hero** : fond crème `#F5EEE1`, titre en navy `#031948`, sous-titre en bronze `#8B6F47`, CTA en or vieilli `#B8860B`
- **Sections alternées** : fond crème très clair `#FAF6ED` pour rythmer
- **Cartes** : blanc cassé `#FDFBF5` avec bordure sable `#E5DDC9`
- **Footer** : fond navy `#031948`, texte crème

### Dashboard (application)

- **Sidebar** : fond navy `#031948`, logo en version blanche/crème, navigation en blanc cassé
- **Item actif sidebar** : fond `#0A2E5C` (navy clair) ou accent or clair `#DAA520`
- **Header dashboard** : fond blanc cassé `#FDFBF5`, breadcrumb en bronze `#8B6F47`
- **Contenu principal** : fond crème très clair `#FAF6ED`
- **Cartes de données** : blanc cassé `#FDFBF5`, bordure sable `#E5DDC9`
- **Titres** : navy `#031948`
- **Texte secondaire / descriptions** : bronze `#8B6F47`

## Typographie

### Police principale — Inter

Police Google Fonts gratuite. À importer dans le projet :

```typescript
// Dans src/app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
})
```

### Hiérarchie typographique

| Usage | Taille | Poids | Line-height |
|---|---|---|---|
| Hero titre (H1) | 48-60px / 3rem-3.75rem | 800 (ExtraBold) | 1.1 |
| Titre de section (H2) | 36px / 2.25rem | 700 (Bold) | 1.2 |
| Titre de sous-section (H3) | 24px / 1.5rem | 700 (Bold) | 1.3 |
| Titre de carte (H4) | 20px / 1.25rem | 600 (SemiBold) | 1.4 |
| Texte principal | 16px / 1rem | 400 (Regular) | 1.6 |
| Texte secondaire | 14px / 0.875rem | 400 (Regular) | 1.5 |
| Petit texte / labels | 12px / 0.75rem | 500 (Medium) | 1.4 |
| Boutons | 14-16px | 600 (SemiBold) | 1 |

## Composants UI

### Boutons

**Primaire — action standard**
```css
background: #031948;
color: #FDFBF5;
hover: background #0A2E5C;
border: none;
padding: 12px 24px;
border-radius: 8px;
font: Inter 600, 14-16px;
```

**CTA Or — actions de conversion uniquement**
Usage restreint à : "Démarrer l'essai gratuit", "S'abonner", "Générer le DUERP"
```css
background: #B8860B;
color: #FDFBF5;
hover: background #DAA520;
/* reste identique au primaire */
```

**Secondaire**
```css
background: transparent;
color: #031948;
border: 1px solid #031948;
hover: background rgba(3, 25, 72, 0.05);
```

**Lien texte**
```css
color: #031948;
text-decoration: underline;
hover: color #B8860B;
```

### Cartes

```css
background: #FDFBF5;
border: 1px solid #E5DDC9;
border-radius: 12px;
padding: 24px;
box-shadow: 0 1px 3px rgba(3, 25, 72, 0.05);
hover: box-shadow 0 4px 12px rgba(3, 25, 72, 0.08);
```

### Inputs / formulaires

```css
background: #FDFBF5;
border: 1px solid #E5DDC9;
border-radius: 8px;
padding: 10px 14px;
font: Inter 400, 14-16px;
color: #031948;

focus: border 2px solid #031948;
       box-shadow: 0 0 0 3px rgba(3, 25, 72, 0.1);

error: border 2px solid #DC2626;

label: color #8B6F47; font-size 14px; font-weight 500;
```

### Badges de criticité (pilules)

```css
border-radius: 9999px;
padding: 4px 12px;
font: Inter 600, 12px;
height: 24px;
```

### Badge "Essai" ou highlight

```css
background: #FDF4D3;
color: #8B6F47;
border-radius: 9999px;
padding: 4px 12px;
font: Inter 500, 12px;
```

## Logo

### Fichiers disponibles

Les fichiers logo sont dans `04_DEVELOPPEMENT/brand/` :

- `logo-full.svg` — Logo complet (symbole + "SafeAnalyse.") en navy
- `logo-full-white.svg` — Version crème pour fond navy
- `logo-symbol.svg` — Symbole seul (le "S") en navy
- `logo-symbol-white.svg` — Symbole seul en blanc

### À préparer

- Favicons à générer sur [realfavicongenerator.net](https://realfavicongenerator.net) depuis `logo-symbol.svg`
- À placer dans `public/favicon/` du projet

### Règles d'usage

- **Marge minimale** autour du logo : équivalent à la hauteur du "S" symbole
- **Taille minimale** : 24px de hauteur (sinon illisible)
- **Fond** : privilégier crème `#F5EEE1` ou blanc cassé `#FDFBF5`
- **Sur fond navy** (sidebar) : utiliser la version blanche du logo
- **Ne pas déformer**, **ne pas changer les couleurs**, **ne pas recadrer**
- **Sidebar ouverte** : logo complet
- **Sidebar collapsée / mobile** : symbole seul
- **Header** : logo complet
- **Favicon** : symbole seul

## Meta tags et SEO

```html
<title>SafeAnalyse. — Votre DUERP en ligne, simple et conforme</title>
<meta name="description" content="L'outil DUERP guidé pour les PME françaises. Évaluation des risques professionnels simplifiée, conforme au Code du travail. Essai gratuit 14 jours.">
<meta property="og:title" content="SafeAnalyse. — Votre DUERP en ligne">
<meta property="og:description" content="L'outil DUERP guidé pour les PME françaises. Évaluation des risques professionnels simplifiée, conforme au Code du travail.">
<meta property="og:image" content="/logo/og-image.png">
<meta property="og:url" content="https://duerp-saas.vercel.app">
<meta name="theme-color" content="#031948">
```

## Récapitulatif visuel

```
COULEURS DOMINANTES — Premium doré
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Navy profond      ████  #031948  → Logo, texte, boutons
Crème doux        ████  #F5EEE1  → Fond landing
Crème très clair  ████  #FAF6ED  → Fond dashboard
Blanc cassé       ████  #FDFBF5  → Cartes, inputs
Or vieilli        ████  #B8860B  → CTA conversion
Or clair          ████  #DAA520  → Hover CTA
Bronze            ████  #8B6F47  → Texte secondaire
Sable             ████  #E5DDC9  → Bordures
```
