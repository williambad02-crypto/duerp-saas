ultrathink

use library /vercel/next.js
use library /motiondotdev/motion
use library /tailwindlabs/tailwindcss

# Phase VITRINE V3 — Session A : Fondations visuelles + Hero + Nav

## Avant tout, lire impérativement

1. `CLAUDE.md` à la racine — positionnement Stratégie C
2. `DUERP/04_DEVELOPPEMENT/BRAND.md` — charte actuelle à enrichir
3. `DUERP/04_DEVELOPPEMENT/BRIEF_VITRINE_V3.md` — choix utilisateur
4. `DUERP/04_DEVELOPPEMENT/BRIEF_WILLIAM.md` — ton et valeurs (rassurant + humain + pédagogique)
5. `DUERP/04_DEVELOPPEMENT/ETUDE_MARCHE_DUERP.md` — frustrations cibles à exploiter

## Contexte

Refonte complète de la vitrine SafeAnalyse. en 3 sessions (A → B → C).

**Cette session A pose les fondations** : palette enrichie, navigation premium avec hover, hero immersif inspiré Apple (images qui suivent le scroll), footer sticky bas de page.

**Stratégie de positionnement** : Stratégie C — spécialiste DUERP haut de gamme + accompagnement humain pour PME industrielles, Morbihan first.

**Ton à respecter** : rassurant, humain, pédagogique. Pas de "révolutionner", "pas cher", "leader". Pas de jargon froid.

## Fichiers concernés

- `tailwind.config.ts` — palette enrichie
- `src/app/(marketing)/layout.tsx` — header + footer marketing
- `src/components/marketing/header.tsx` — nav avec hover, sticky, état actif
- `src/components/marketing/footer.tsx` — footer sticky bas de page
- `src/app/(marketing)/page.tsx` — refonte hero + sections introductives
- `src/components/marketing/hero-scroll.tsx` — composant nouveau, scroll-driven
- `src/styles/globals.css` — variables CSS si nécessaire

## 1. Enrichissement de la palette

La charte actuelle (navy + or vieilli + crème) manque de contraste et de fraîcheur. **On garde les couleurs de marque, on ajoute des tons utilitaires.**

Mise à jour `tailwind.config.ts` :

```typescript
colors: {
  brand: {
    // Existant — ne pas changer
    navy: '#031948',
    'navy-light': '#0A2E5C',
    'navy-deep': '#021134',          // NOUVEAU - pour fonds très contrastés
    cream: '#F5EEE1',
    'cream-light': '#FAF6ED',
    off: '#FDFBF5',
    gold: '#B8860B',
    'gold-light': '#DAA520',
    'gold-pale': '#FDF4D3',
    bronze: '#8B6F47',
    sand: '#E5DDC9',
    'sand-dark': '#C9BFA5',

    // NOUVEAU - couleurs d'accent pour contraste
    accent: '#0EA5E9',                // bleu ciel — pour highlights, liens, accents
    'accent-dark': '#0369A1',         // hover des accents
    success: '#10B981',                // vert frais — réussite, conformité
    'success-soft': '#D1FAE5',
    warning: '#F59E0B',                // orange chaud — attention, badges
    danger: '#EF4444',                 // rouge — erreurs, sanctions

    // NOUVEAU - gris neutres modernes
    'ink': '#0F172A',                  // texte ultra contrasté
    'ink-soft': '#334155',             // texte secondaire
    'ink-mute': '#64748B',             // texte placeholder
  },
  criticite: {
    vert: '#16A34A',
    jaune: '#CA8A04',
    orange: '#EA580C',
    rouge: '#DC2626',
  },
},
```

**Règles d'usage des nouvelles couleurs :**
- `accent` (bleu ciel) : liens dans le texte, highlights, soulignements, badges secondaires. **Ne remplace pas l'or** qui reste le CTA principal.
- `success` : badges "Conforme INRS", "Inclus", coches dans les listes
- `warning` : badges "Sanctions", encarts d'alerte légère
- `ink/ink-soft/ink-mute` : à utiliser à la place des `gray-*` pour cohérence

## 2. Navigation — header sticky avec hover et état actif

### Structure

```tsx
<header className={cn(
  "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
  scrolled ? "bg-brand-cream/85 backdrop-blur-md border-b border-brand-sand h-16" : "bg-transparent h-20"
)}>
  <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
    {/* Logo à gauche */}
    <Link href="/"><Logo variant="full" /></Link>

    {/* Nav centrale */}
    <nav className="hidden lg:flex items-center gap-1">
      {navItems.map(item => <NavItem item={item} pathname={pathname} />)}
    </nav>

    {/* CTAs droite */}
    <div className="flex items-center gap-3">
      <Link href="/auth/login" className="text-brand-bronze hover:text-brand-navy text-sm font-medium">
        Se connecter
      </Link>
      <Button variant="cta" size="sm">Demander un échange</Button>
    </div>
  </div>
</header>
```

### Items du menu (ordre)

```typescript
const navItems = [
  { label: "L'outil", href: '/outil' },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'Réglementation', href: '/reglementation' },
  { label: 'Qui je suis', href: '/a-propos' },
  { label: 'Contact', href: '/contact' },
]
```

À droite, **un seul CTA fusionné** (selon le brief) : "Demander un échange" qui mène vers `/contact`. Ce bouton remplace "Demander une démo" et "Prendre rendez-vous". Le bouton "Essai gratuit" disparaît du header (il reste dans le hero et les pages dédiées) — l'objectif principal de la vitrine est le consulting (Stratégie C).

### Marqueur de page active

Sur l'item actif :
- Texte en `text-brand-navy font-semibold` au lieu de `text-brand-ink-soft`
- Petite barre dessous : `border-b-2 border-brand-accent` (animée si possible avec layoutId Motion)

### Comportement scroll

- Position 0 : header transparent, hauteur 80px, logo grande taille
- Scroll > 20px : fond crème translucide + blur, hauteur 64px, transition fluide 300ms

### Menu mobile (< 1024px)

- Bouton burger animé (3 lignes qui se transforment en croix)
- Au tap : menu plein écran qui slide depuis la droite avec backdrop sombre
- Items empilés en gros caractères, CTA en bas

## 3. Footer sticky bas de page

Le footer doit toujours être en bas du viewport, même si le contenu est court.

Layout `(marketing)/layout.tsx` :

```tsx
<div className="min-h-screen flex flex-col bg-brand-cream">
  <MarketingHeader />
  <main className="flex-1 pt-20">{children}</main>
  <MarketingFooter />
</div>
```

### Contenu du footer

Fond `bg-brand-navy-deep`, texte en nuances de crème.

4 colonnes :
- **Logo + accroche** : Logo blanc + phrase "Le DUERP fait sérieusement, sans usine à gaz."
- **Produit** : L'outil, Tarifs, Comparatif, FAQ
- **À propos** : Qui je suis, Réglementation, Témoignages, Contact
- **Légal** : CGU, Mentions légales, Confidentialité

Bas : copyright "© 2026 SafeAnalyse. — Morbihan, France · Fait avec 🛡️ pour les PME industrielles" + LinkedIn icône.

## 4. Hero — page d'accueil — inspiration Apple

L'utilisateur veut un hero immersif type Apple : images qui suivent le scroll, parallax léger, sensation de profondeur. Pas de vidéo.

### Structure du hero

**Section 1 : Hero principal (100vh, fond `bg-brand-navy-deep`)**

```tsx
<section className="relative h-screen flex items-center justify-center overflow-hidden bg-brand-navy-deep">
  {/* Image/illustration en arrière-plan, parallax léger */}
  <motion.div
    className="absolute inset-0 z-0"
    style={{ y: useTransform(scrollY, [0, 800], [0, 200]) }}
  >
    <Image src="/marketing/hero-bg-industrial.jpg" alt="" fill className="object-cover opacity-30" />
  </motion.div>

  {/* Contenu centré */}
  <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
      <span className="inline-block px-3 py-1 bg-brand-gold-pale/20 text-brand-gold-light text-xs font-semibold uppercase tracking-wider rounded-full mb-6">
        Spécialiste DUERP — Morbihan & Bretagne sud
      </span>
      <h1 className="text-5xl md:text-7xl font-bold text-brand-cream leading-tight mb-6">
        Votre Document Unique,<br />
        <span className="text-brand-gold-light">fait sérieusement.</span>
      </h1>
      <p className="text-xl md:text-2xl text-brand-cream/80 max-w-3xl mx-auto mb-10">
        Un outil pédagogique conçu par un professionnel HSE, pour les PME industrielles qui veulent un DUERP conforme sans usine à gaz.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="cta" size="lg">Demander un échange</Button>
        <Button variant="secondary-light" size="lg">Découvrir l'outil</Button>
      </div>
    </motion.div>
  </div>

  {/* Indicateur de scroll en bas */}
  <motion.div
    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
    animate={{ y: [0, 10, 0] }}
    transition={{ repeat: Infinity, duration: 1.8 }}
  >
    <ChevronDown className="text-brand-cream/60 w-6 h-6" />
  </motion.div>
</section>
```

**Slogan principal proposé** : *"Votre Document Unique, fait sérieusement."*
(William n'avait pas de slogan — j'en propose un. À adapter si tu veux.)

### Section 2 : "Le constat" (sticky scroll, image qui change)

**Inspiration Apple iPhone product pages.** Au fur et à mesure du scroll, le texte change à droite et une image illustre à gauche.

```tsx
<section className="relative bg-brand-cream">
  <div className="grid grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto">
    {/* Colonne gauche : image sticky qui change */}
    <div className="lg:sticky lg:top-20 h-screen flex items-center justify-center p-12">
      <div className="relative w-full h-[500px]">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            style={{ opacity: useTransform(scrollProgress, [i / steps.length, (i + 0.5) / steps.length, (i + 1) / steps.length], [0, 1, 0]) }}
          >
            <Image src={step.image} alt={step.title} fill className="object-contain" />
          </motion.div>
        ))}
      </div>
    </div>

    {/* Colonne droite : 4 blocs qui défilent */}
    <div className="py-32 space-y-[60vh]">
      {steps.map((step, i) => (
        <div key={i} className="px-12">
          <span className="text-brand-accent font-mono text-sm">0{i + 1}</span>
          <h3 className="text-3xl font-bold text-brand-navy mt-2 mb-4">{step.title}</h3>
          <p className="text-lg text-brand-ink-soft">{step.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

**4 étapes** (textes à utiliser) :
1. **Vous n'avez pas le temps.** Faire un DUERP entre deux clients, ça finit toujours en bas de la pile.
2. **Les outils existants sont des usines à gaz.** Tableurs interminables, logiciels INRS pensés pour les ergonomes.
3. **Un cabinet HSE coûte cher.** 1500€ pour un audit one-shot, et l'année prochaine on recommence.
4. **SafeAnalyse. fait le pont.** Un outil simple guidé par un pro, avec accompagnement local quand vous en avez besoin.

### Section 3 : "Pour qui" (3 cards alignées)

Fond `bg-brand-cream-light`. Trois cards (PME agro, BTP, restauration) avec icône Lucide, titre, description courte.

### Section 4 : "Comment ça marche" (4 étapes simplifiées)

Reprise du contenu actuel mais avec animations stagger au scroll.

### Section 5 : "Pourquoi pas un autre outil ?" (teaser comparatif)

Mini-comparatif visuel SafeAnalyse vs Cabinet HSE vs Outils gratuits → CTA "Voir le comparatif détaillé" → `/comparatif`.

### Section 6 : "Pourquoi William" (encart fondateur)

Petit encart avec photo (placeholder pour l'instant), 2-3 phrases sur William, CTA "Découvrir mon parcours" → `/a-propos`.

### Section 7 : CTA final (fond navy deep)

Reprend le ton du hero. "Discutons de votre DUERP" + bouton CTA "Demander un échange".

## 5. Variantes du composant Button à créer/mettre à jour

```tsx
type ButtonVariant = 'cta' | 'primary' | 'secondary' | 'secondary-light' | 'ghost' | 'link'
```

- **cta** : fond `brand-gold-light`, hover `brand-gold`, texte `brand-navy-deep`, font-semibold, ombre douce
- **primary** : fond `brand-navy`, texte `brand-cream`, hover `brand-navy-light`
- **secondary** : bordure `brand-navy`, texte `brand-navy`, fond transparent, hover fond `brand-navy/5`
- **secondary-light** : bordure `brand-cream`, texte `brand-cream`, fond transparent (à utiliser sur fond foncé)
- **ghost** : pas de fond, texte `brand-bronze`, hover `brand-navy`
- **link** : juste un lien souligné

## 6. Animations à mettre en place

Bibliothèque : Motion (déjà installée si Phase VITRINE_V2 faite, sinon `npm install motion`).

**Règles** :
- Fade-in au scroll : `initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}`
- Stagger sur listes : `staggerChildren: 0.1`
- Parallax sur images de fond : `useScroll` + `useTransform`
- Sticky-scroll story-telling : technique décrite section 4 ci-dessus
- Hover boutons : scale 1.03 + ombre

**Pas trop !** William a précisé "moyennes, placées au bon endroit pour ne pas faire too much". Donc anim sur le hero, sur la section sticky-scroll, sur les CTA, et fade-in léger sur les sections — c'est tout.

## 7. Images placeholder

Crée le dossier `public/marketing/` avec des placeholders nommés explicitement :

```
public/marketing/
├── hero-bg-industrial.jpg    # Image industrie agroalimentaire (placeholder gris pour l'instant)
├── step-01-no-time.jpg
├── step-02-spreadsheet.jpg
├── step-03-cabinet.jpg
├── step-04-safeanalyse.jpg
└── william-portrait.jpg
```

Pour les placeholders : génère des SVG simples avec le nom au centre (ou utilise des images Unsplash via URL si autorisé), William fournira les vraies images plus tard.

## C'est fini quand

- [ ] `tailwind.config.ts` étendu avec accent / success / warning / danger / ink-*
- [ ] Header sticky avec transition scroll fluide
- [ ] Menu nav avec marqueur d'état actif (barre accent dessous)
- [ ] Bouton CTA fusionné "Demander un échange" en remplacement de démo + RDV
- [ ] Menu mobile burger animé, slide-in droite
- [ ] Footer collé en bas de page (flex-1 sur main)
- [ ] Footer en navy-deep avec 4 colonnes + LinkedIn
- [ ] Hero plein écran avec image parallax fond
- [ ] Section sticky-scroll storytelling 4 étapes (image qui change à gauche)
- [ ] 5 sections suivantes en place avec contenu défini ci-dessus
- [ ] Animations stagger + fade-in subtiles partout
- [ ] Variantes Button mises à jour (cta, secondary-light…)
- [ ] Dossier `public/marketing/` créé avec placeholders
- [ ] Responsive OK desktop + tablette 1024px (mobile peut être incomplet, traité plus tard)
- [ ] `npm run build` passe

## Ne PAS toucher

- `src/app/dashboard/` — l'outil reste tel quel
- `src/app/auth/` — login/signup intacts
- Le tableau APR (Phase UX_TABLEAU_B2 vient juste d'être faite)
- Schéma DB, Server Actions, Stripe webhooks
- Les pages /outil /reglementation /tarifs /a-propos /contact existantes — on les refait en Phase B et C, pour l'instant on ne touche que la nav et la landing

## À la fin

Mettre à jour `CLAUDE.md` section 6 : cocher `[x] PHASE_VITRINE_V3_A`.

## Conseil

Si tu satures, fais `/compact focus on hero scroll-driven storytelling section` et continue.

## Commit

```bash
git add .
git commit -m "Vitrine V3 A - palette enrichie + nav hover + hero Apple-style"
git push
```
