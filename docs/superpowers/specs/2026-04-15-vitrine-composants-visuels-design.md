# Kit Composants Visuels Vitrine — Design Spec

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer un kit de 8 composants visuels réutilisables pour donner à la vitrine SafeAnalyse. une expérience de défilement à la Apple — immersive, fluide, sans excès.

**Architecture:** Composants indépendants dans `src/components/marketing/ui/`, stackables et composables. Motion v12 pour les orchestrations scroll/interaction, CSS natif pour les effets de fond. Zéro nouvelle dépendance npm.

**Tech Stack:** Next.js 16 App Router, motion v12 (`useScroll`, `useTransform`, `useInView`, `animate`), Tailwind CSS v4, TypeScript strict.

**Charte graphique:** Navy `#031948`, Crème `#F5EEE1`, Or `#B8860B`, Inter. Personnalité : Pro · Rassurant · Premium · Classique élégant.

---

## Composants du kit

### 1. TextReveal
Révèle un texte mot par mot (ou ligne par ligne) au scroll. Utilisé pour les headlines de section, les titres H2/H3.

- `words` prop (string) → split sur les espaces
- Chaque mot est un `<motion.span>` avec `opacity: 0→1` + `y: 20→0`
- Déclenché par `useInView` (threshold 0.3), stagger 40ms entre mots
- Variante `line` pour révéler par ligne (titres courts)

### 2. HeroReveal
Hero full-viewport avec layers animés au chargement de la page. Remplace le hero actuel de la landing.

- Badge "Essai gratuit 14 jours" → animate-hero-badge (déjà en globals.css)
- Titre H1 → TextReveal immédiat (no scroll trigger, delay 200ms)
- Sous-titre → fade+translate, delay 400ms
- CTA → fade+translate, delay 550ms
- Fond : crème `#F5EEE1` avec GrainOverlay
- Scroll indicator (chevron animé) en bas

### 3. SectionReveal
Wrapper générique qui anime l'entrée d'une section ou d'un bloc au scroll. Remplace AnimateOnScroll existant avec une API plus propre.

```tsx
<SectionReveal variant="fade-up" delay={0.1}>
  <MonContenu />
</SectionReveal>
```

- Variants : `fade-up` (défaut), `fade-in`, `fade-left`, `fade-right`
- `delay` prop en secondes
- `useInView` avec `once: true`
- Compatible SSR (opacity 0 initial, pas de layout shift)

### 4. BentoGrid
Grille de features style Apple — cellules de tailles variées, stagger d'entrée, hover depth.

- Layout CSS grid avec `grid-template-areas` configurable
- Chaque cellule = `BentoCard` avec `SectionReveal` intégré (stagger index × 80ms)
- `BentoCard` props: `title`, `description`, `icon`, `size` (`sm`|`md`|`lg`), `className`
- Hover : `scale(1.02)` + `box-shadow` amplifiée (motion whileHover)
- Fond cartes : blanc cassé `#FDFBF5`, bordure sable `#E5DDC9`

### 5. StatCounter
Chiffre qui s'incrémente de 0 à la valeur cible quand il entre dans le viewport.

```tsx
<StatCounter value={20} label="risques ED 840 couverts" suffix="+" />
```

- `useInView` déclenche l'animation une seule fois
- `animate()` de motion pour interpoler 0→value en 1.2s avec easing `easeOut`
- `value`, `label`, `prefix`, `suffix` props
- Typographie : valeur en Bold 800 navy, label en Regular bronze

### 6. CardTilt
Carte avec effet de perspective 3D au survol de la souris. Subtil (max ±8°).

- `onMouseMove` → calcule position relative → applique `rotateX` + `rotateY` via motion
- `onMouseLeave` → reset à 0,0 avec spring
- `perspective: 800px` sur le wrapper
- Utilisé pour les cartes pricing et témoignages

### 7. GrainOverlay
Texture grain/bruit sur les fonds crème. CSS pur, zéro JS.

- Pseudo-élément `::after` avec SVG base64 `feTurbulence` comme fond
- `opacity: 0.035` — imperceptible sauf en plein écran
- Classe utilitaire `.grain` applicable sur n'importe quel fond crème
- Défini dans globals.css

### 8. MarqueeStrip
Ticker horizontal infini pour des citations courtes ou des indicateurs de confiance.

- Duplication du contenu × 2 pour seamless loop
- Animation CSS `@keyframes marquee` avec `transform: translateX(-50%)`
- `pauseOnHover` prop
- Vitesse configurable via `duration` prop (défaut 30s)

---

## Application aux pages

| Page | Composants utilisés |
|---|---|
| `/` (landing) | HeroReveal, SectionReveal, BentoGrid, StatCounter, MarqueeStrip |
| `/outil` | SectionReveal, BentoGrid, TextReveal |
| `/tarifs` | SectionReveal, CardTilt, StatCounter |
| `/a-propos` | SectionReveal, TextReveal, CardTilt |
| `/temoignages` | SectionReveal, CardTilt, MarqueeStrip |
| Toutes | GrainOverlay (fond), SectionReveal (sections) |

---

## Contraintes

- Pas de nouvelle dépendance npm — motion v12 + CSS natif uniquement
- `"use client"` uniquement sur les composants qui en ont besoin (`StatCounter`, `CardTilt`)
- Les composants purement CSS (`GrainOverlay`) et les Server Components (`BentoGrid` statique) restent côté serveur
- `once: true` sur tous les `useInView` — pas de re-animation au scroll up
- Pas d'animation sur `prefers-reduced-motion` — détecter via `useReducedMotion()` de motion
