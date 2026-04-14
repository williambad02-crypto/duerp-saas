# Phase VITRINE V2 — Navigation, pages complètes et animations

## Contexte

La charte SafeAnalyse. est en place, la landing existe. On passe maintenant à une version 2 de la vitrine publique :
1. Vrai menu de navigation en haut avec 5 entrées
2. 4 pages supplémentaires dédiées
3. Page pricing avec tableau comparatif vs concurrence
4. Animations subtiles pour rendre le site vivant et agréable
5. Correction du logo (fond transparent)

## Fichiers de référence à lire

- `DUERP/04_DEVELOPPEMENT/BRAND.md` — charte
- `DUERP/04_DEVELOPPEMENT/BUSINESS_PLAN.md` — offre, cible, argumentaire
- `DUERP/02_METHODOLOGIE/FONCTIONNEMENT_OUTIL.txt` — ce que fait l'outil

## 1. Correction du logo (fond transparent)

Le fichier actuel `public/logo/logo-full.svg` contient 2 `<rect fill="#ffffff">` qui créent un carré blanc derrière le logo quand il est posé sur fond coloré. Il faut remplacer ces fills par `fill="none"` pour que le fond soit transparent.

**Action :** je fournis le fichier corrigé. Remplace simplement `public/logo/logo-full.svg` par le nouveau. Refais pareil pour `logo-symbol.svg` si besoin.

Alternative via commande si tu veux automatiser :
```bash
sed -i '' 's/<rect\([^/]*\)fill="#ffffff"/<rect\1fill="none"/g' public/logo/logo-full.svg
sed -i '' 's/<rect\([^/]*\)fill="#FFFFFF"/<rect\1fill="none"/g' public/logo/logo-full.svg
```

## 2. Menu de navigation en haut (header marketing)

**Entrées du menu** (dans l'ordre, de gauche à droite après le logo) :

| Label | Route | Contenu |
|---|---|---|
| L'outil | `/outil` | Fonctionnalités détaillées du SaaS |
| Réglementation | `/reglementation` | DUERP en clair, obligations, sanctions |
| Qui je suis | `/a-propos` | Profil de William, expertise, parcours |
| Tarifs | `/tarifs` | Pricing + tableau comparatif |
| Contact | `/contact` | Formulaire de contact |

À droite du menu, deux boutons :
- "Se connecter" (style secondaire, outline navy)
- "Essai gratuit" (style CTA or vieilli)

### Comportement du header

- **Sticky** : reste en haut au scroll
- **Fond translucide** avec backdrop-blur quand on scroll : passe de `bg-brand-cream` (top) à `bg-brand-cream/80 backdrop-blur` (scrolled)
- **Bordure inférieure** discrète au scroll : `border-b border-brand-sand`
- **Menu mobile** : hamburger animé qui ouvre un menu plein écran avec les entrées empilées

### Marqueur de page active

Le menu indique la page active par :
- Texte en `text-brand-navy` au lieu de `text-brand-bronze`
- Fine barre sous le lien : `border-b-2 border-brand-gold-light`

## 3. Pages à créer

### Page `/outil` — "L'outil en détail"

Structure :

**Section Hero** (fond crème)
- Titre : "Tout ce dont vous avez besoin pour faire votre DUERP"
- Sous-titre : "Des grilles guidées, des méthodes INRS, et un PDF conforme en quelques clics."

**Section "Le parcours utilisateur"** (fond crème clair)
- 4 blocs illustrés (icônes + description) alignés sur les 4 étapes :
  1. Créer l'entreprise
  2. Déclarer les postes et opérations
  3. Évaluer les risques
  4. Exporter le DUERP

**Section "Les 20 risques couverts"** (fond crème)
- Liste des 20 risques ED 840 avec icônes et description courte
- Indication visuelle des risques avec module normé (bruit, vibrations, TMS, charge physique, RPS) vs APR standard
- Grid 3 colonnes desktop, 2 tablette, 1 mobile

**Section "Méthodes INRS intégrées"** (fond crème clair)
- Liste des normes utilisées : ED 6035, ISO 9612, ED 6161, OSEV INRS, TMS PRO, RPS-DU, etc.
- Cards avec logo INRS + nom de la norme + description

**Section "Export PDF conforme"** (fond crème)
- Screenshot ou mockup du PDF exporté
- Bullet points : couverture, tableau APR, plan de maîtrise, versioning 40 ans

**CTA final** (fond navy)
- "Prêt à essayer ? 14 jours gratuits, sans carte bancaire."

### Page `/reglementation` — "La réglementation DUERP en clair"

**Objectif pédagogique** : pas du jargon juridique, du concret pour un dirigeant de PME.

Structure :

**Hero**
- Titre : "Le DUERP : ce que dit la loi, simplement"
- Sous-titre : "Un résumé accessible de vos obligations en tant qu'employeur"

**Section "Qu'est-ce que le DUERP ?"** (1 paragraphe pédagogique)
- Définition simple
- Qui doit le faire (dès 1 salarié)
- Document obligatoire, pas une option

**Section "Vos obligations principales"** (3-4 cards)
- Article L4121-1 : Obligation de sécurité
- Article R4121-1 : Le DUERP lui-même
- Article R4121-2 : Mise à jour annuelle + à chaque changement
- Loi du 2 août 2021 : Conservation 40 ans

Chaque card : icône + référence légale + explication en langage simple

**Section "Que se passe-t-il si je ne le fais pas ?"**
- Amendes financières (jusqu'à 1 500€ par UT)
- Responsabilité pénale en cas d'accident
- Faute inexcusable de l'employeur
- Présenté sans alarmisme, factuel

**Section "Les 9 principes généraux de prévention"**
- Liste des 9 principes avec exemple concret pour chaque
- Accordion pour détails

**Section "Comment SafeAnalyse. vous aide"** (fond crème clair)
- 3-4 points sur comment l'outil prend en charge ces obligations

**CTA** : "Commencer mon DUERP maintenant"

### Page `/a-propos` — "Qui je suis"

**Objectif** : humaniser le produit, créer de la confiance.

Structure :

**Hero** (avec photo optionnelle)
- Titre : "Un outil créé par un professionnel HSE, pour les PME françaises"
- Sous-titre : "Je m'appelle William, je suis diplômé en Hygiène Sécurité Environnement"

**Section "Mon parcours"**
- Formation (BUT HSE)
- Expériences (stages, alternance)
- Ce qui m'a amené à créer SafeAnalyse.

**Section "Ma démarche"**
- Pourquoi j'ai créé cet outil
- Pour qui : les PME sans service HSE qui galèrent avec leur DUERP
- Ce qui me différencie : je code MON outil, je ne vends pas un produit acheté

**Section "Accompagnement possible"**
- Présentation du service consulting
- Tarifs de prestation sur site (voir BUSINESS_PLAN.md)
- CTA : "Demander un devis"

**Section "Contact"**
- Email, LinkedIn, téléphone (si tu veux le mettre)

### Page `/tarifs` — "Tarifs et comparaison"

Structure :

**Hero**
- Titre : "Un outil accessible, sans mauvaise surprise"
- Sous-titre : "Un seul tarif, tout inclus. Essai gratuit 14 jours."

**Section Pricing principale** (comme sur la landing mais centrée)
- Toggle mensuel / annuel
- Carte unique 39€/mois ou 390€/an
- Liste des features incluses
- CTA or : "Commencer l'essai gratuit"

**Section "Comparaison avec les alternatives"** — tableau comparatif

Tableau à 4 colonnes :

| | SafeAnalyse. | Cabinet HSE | Outils gratuits (Seirich, Oira) | Template Word/Excel |
|---|---|---|---|---|
| Prix | **39€/mois** | 500-2000€/DUERP | Gratuit | Gratuit |
| Guidé pas à pas | ✓ | N/A (ils le font pour vous) | ✗ Complexe | ✗ |
| Mise à jour annuelle | ✓ Simple | À repayer | ✓ | Manuel |
| Export PDF conforme | ✓ | ✓ | Partiel | ✗ |
| Méthodes INRS | ✓ Intégrées | ✓ | Partiel | ✗ |
| Conservation 40 ans | ✓ Automatique | Vous la gérez | ✗ | Manuel |
| Accompagnement possible | ✓ Optionnel | ✓ (inclus) | ✗ | ✗ |
| Temps à y consacrer | ~2h au début | 0 (délégué) | Beaucoup | Énormément |

**Légende visuelle :**
- ✓ vert pour SafeAnalyse.
- Couleurs neutres pour les autres colonnes
- Mettre SafeAnalyse. en **colonne surlignée** (fond `bg-brand-cream-light`)

**Section "Prestation sur site"** (en dessous du tableau)
- Grille des tarifs par effectif (500€ TPE → 1800€ PME de 100 salariés)
- Inclut 1 an de SaaS
- CTA : "Demander un devis"

**Section FAQ** — 6-8 questions classiques sur le pricing

**CTA final** (fond navy)
- "Commencer l'essai gratuit"

### Page `/contact` — déjà existante

Appliquer la charte graphique. Simplifier si besoin.

## 4. Animations et lisibilité

### Bibliothèque recommandée : Motion (ex-Framer Motion)

```bash
npm install motion
```

### Animations à ajouter (subtiles, pas agressives)

**Sur toutes les pages publiques :**

1. **Fade-in au scroll** pour chaque section :
   ```tsx
   // Utiliser <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
   ```
   - Les sections apparaissent en glissant légèrement vers le haut au scroll
   - `once: true` pour ne pas rejouer à chaque scroll

2. **Stagger sur les grilles** (cards de features, risques, etc.) :
   - Les cards apparaissent les unes après les autres (délai de 0.1s entre chaque)

3. **Hover subtil sur les cards** :
   - Scale 1.02 en hover
   - Ombre qui s'intensifie légèrement
   - Transition 200ms

4. **Boutons CTA** :
   - Légère scale 1.03 au hover
   - Effet de "brillance" qui traverse le bouton or (optionnel, subtil)

5. **Header sticky** :
   - Transition fluide de fond translucide/opaque au scroll
   - Hauteur qui rétrécit légèrement au scroll (de 80px à 64px)

6. **Menu mobile** :
   - Slide-in depuis la droite avec ease-out

**Sur l'app / dashboard :**

7. **Transitions de page** douces (fade) lors des navigations internes

8. **Toast / notifications** : slide-in depuis le haut-droit, auto-dismiss après 3s

9. **Loading states** : skeleton shimmer plutôt que spinner (plus élégant)

### Règles générales pour la lisibilité

**Typographie :**
- Line-height 1.6 pour les paragraphes (déjà dans BRAND.md)
- Taille minimale 16px pour le texte courant
- Contraste WCAG AA : vérifier que bronze/crème respecte bien
- Max-width sur les paragraphes : 72 caractères (~`max-w-prose` en Tailwind)

**Espacement :**
- Sections avec padding vertical généreux : `py-20` minimum sur desktop
- Entre les sections, éviter le changement de fond trop fréquent (max 2 alternances)

**Images / illustrations :**
- Ajouter des illustrations SVG abstraites en fond (formes organiques très discrètes en crème très clair / sable)
- Ne surcharge pas, juste de la profondeur

**Iconographie :**
- Utilise **Lucide Icons** partout (cohérent, élégant)
- Taille : 20px dans le texte, 24px pour les icônes décoratives, 48px pour les héros de sections

**Ombres et profondeur :**
- Ombres douces, pas contrastées
- Cartes : `shadow-[0_2px_10px_rgba(3,25,72,0.06)]` pour quelque chose de doux
- Éviter `shadow-xl` qui est trop brutal

**Microinteractions :**
- Tous les éléments cliquables ont un état hover visible mais subtil
- Les inputs ont un focus ring navy
- Les boutons indiquent clairement qu'ils sont cliquables (cursor-pointer, transition)

## 5. Structure finale du routing

```
src/app/
├── (marketing)/
│   ├── layout.tsx                    # Header + footer marketing
│   ├── page.tsx                      # Landing /
│   ├── outil/page.tsx                # Nouvelle
│   ├── reglementation/page.tsx       # Nouvelle
│   ├── a-propos/page.tsx             # Nouvelle
│   ├── tarifs/page.tsx               # Nouvelle (avec comparatif)
│   ├── contact/page.tsx              # Existante, restylée
│   ├── cgu/page.tsx                  # Existante
│   ├── mentions-legales/page.tsx     # Existante
│   └── confidentialite/page.tsx      # Existante
├── auth/...
└── dashboard/...
```

## 6. Mise à jour du footer

Reflète la nouvelle structure :

- **Produit** : L'outil, Tarifs, Essai gratuit
- **À propos** : Qui je suis, Réglementation, Contact
- **Légal** : CGU, Mentions légales, Confidentialité
- **Suivi** : LinkedIn (si créé), Email

## C'est fini quand

- [ ] Le logo n'a plus de fond blanc (transparent partout)
- [ ] Le menu de navigation est sticky avec 5 entrées + 2 CTA
- [ ] Le menu mobile (hamburger) fonctionne et est animé
- [ ] Les 4 nouvelles pages sont créées et stylées
- [ ] Le tableau comparatif sur `/tarifs` met bien en valeur SafeAnalyse.
- [ ] Les animations de fade-in au scroll fonctionnent partout
- [ ] Les hover states sont subtils et cohérents
- [ ] Le footer reflète la nouvelle structure
- [ ] `npm run build` passe sans erreur
- [ ] Tout est responsive (tablette + mobile)
- [ ] L'indicateur de page active fonctionne dans le menu

## Commit final

```bash
git add .
git commit -m "Phase VITRINE V2 - navigation, pages complètes, animations"
git push
```

## Conseil

Cette phase est grosse (nouvelles pages + animations + nav). Si c'est trop pour une seule session, découpe :
- **Session 1** : logo corrigé + nav + menu mobile + animations header
- **Session 2** : pages /outil et /reglementation
- **Session 3** : pages /a-propos et /tarifs (avec comparatif)
- **Session 4** : animations globales (fade-in scroll, stagger, hover)
