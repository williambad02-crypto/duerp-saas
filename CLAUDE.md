# SafeAnalyse. — Contexte projet pour Claude Code

> **Lis ce fichier en début de chaque session avant de coder quoi que ce soit.**
> Il est mis à jour à chaque phase importante. Si tu trouves une info contradictoire dans le code vs ce fichier, considère ce fichier comme la source de vérité métier.

---

## 1. Identité du projet

**Nom commercial** : SafeAnalyse. (avec le point final, c'est volontaire)
**Nature** : SaaS d'évaluation des risques professionnels (DUERP) + prestation consulting sur site
**Cible géographique de lancement** : Morbihan / Bretagne sud
**Cible sectorielle prioritaire** : PME agroalimentaires + secteurs HSE sensibles (BTP, restauration, industrie)
**Tailles cibles** : TPE 1-10 + PME 11-50 + PME 51-250 (V2 envisagée pour différencier)

**URL prod actuelle** : https://duerp-saas.vercel.app (domaine custom prévu en V2)
**Repo GitHub** : `williambad02-crypto/duerp-saas`

**Fondateur** : William Maréchal — diplômé BUT HSE prévu septembre 2026, alternant 2 ans en PME agroalimentaire (MGD Nature), pompier volontaire, basé Morbihan.

---

## 2. Positionnement et stratégie (Stratégie C — Premium spécialisation)

**Validé suite à l'étude de marché d'avril 2026 (`DUERP/04_DEVELOPPEMENT/ETUDE_MARCHE_DUERP.md`).**

Positionnement = **spécialiste DUERP haut de gamme + accompagnement humain pour PME industrielles, Morbihan first**.

### Pricing officiel SafeAnalyse.

| Offre | Prix | Cible |
|---|---|---|
| **Pack Industrie** | 99€/mois ou 990€/an (2 mois offerts) | PME 1-50 salariés, jusqu'à 5 postes / 20 opérations |
| **Pack Premium** | 149€/mois ou 1490€/an | PME 50-250 salariés, postes & opérations illimités, audit semestriel inclus |
| **Consulting sur site** | 700€/jour (lancement) → 1000€/jour (post-diplôme sept 2026) | PME locale, déplacement Morbihan inclus, sinon barème kilométrique |
| **Inclus avec consulting** | 2 ans de SaaS Pack Premium offerts | Toute prestation ≥ 1 jour |

**Essai gratuit** : 14 jours sans CB
**Mode découverte** : 1 poste / 2 opérations en lecture seule, sans export PDF
**Engagement** : mensuel résiliable OU annuel avec 2 mois offerts
**Paiement** : Stripe CB + virement (sur facture pour les comptes annuels) + facture sur demande

### Différenciateurs à mettre en avant partout

1. **Outil créé par un professionnel HSE en exercice** (pas un éditeur tech sans expertise terrain)
2. **Pédagogique, simple, sans jargon** (vs Seirich/Oira complexes)
3. **Accompagnement local possible** (consulting Morbihan, déplacement ailleurs)
4. **Méthodes INRS intégrées** (ED 840, ISO 9612, ED 6035…)
5. **Conformité Code du travail garantie** (PDF prêt pour l'inspection, conservation 40 ans automatique)

### Mots/expressions BANNIS sur la vitrine et dans le code marketing

- "révolutionner", "disrupter"
- "pas cher", "low cost"
- "leader", "n°1"
- Tout ce qui peut faire "outil bancal"

### Ton de voix

Rassurant + humain + pédagogique. On vulgarise, on donne des exemples concrets tirés du terrain agroalimentaire. On ne fait pas du juridique froid.

---

## 3. Documentation métier — fichiers de référence

Toute la connaissance métier est dans `DUERP/`. **Lis le fichier de référence AVANT de coder une fonctionnalité métier.**

### Fondations (à lire systématiquement)

| Fichier | Rôle |
|---|---|
| `DUERP/INDEX.txt` | Vue d'ensemble, articulation entre fichiers |
| `DUERP/01_FONDATIONS/COTATION.txt` | Cotation G×P/G×DE — **source de vérité unique** |
| `DUERP/01_FONDATIONS/ED840_SYNTHESE.txt` | Liste des 20 risques INRS ED 840 |
| `DUERP/02_METHODOLOGIE/FONCTIONNEMENT_OUTIL.txt` | Vision produit et flux utilisateur |
| `DUERP/02_METHODOLOGIE/DEFINITIONS_RISQUES.txt` | Glossaire métier |
| `DUERP/02_METHODOLOGIE/STANDARD_PRESELECTION.txt` | 3 questions OUI/NON par module |
| `DUERP/03_MODULES_RISQUES/XX_MODULE/` | Méthode + réglementation par module normé |

### Stratégie et brand

| Fichier | Rôle |
|---|---|
| `DUERP/04_DEVELOPPEMENT/BUSINESS_PLAN.md` | Modèle économique détaillé (à mettre à jour stratégie C) |
| `DUERP/04_DEVELOPPEMENT/BRAND.md` | Charte graphique SafeAnalyse. |
| `DUERP/04_DEVELOPPEMENT/ETUDE_MARCHE_DUERP.md` | Étude marché avril 2026, justifie la stratégie C |
| `DUERP/04_DEVELOPPEMENT/BRIEF_WILLIAM.md` | Bio William, ton, valeurs, parcours |
| `DUERP/04_DEVELOPPEMENT/BRIEF_VITRINE_V3.md` | Choix UX/contenu vitrine V3 |
| `DUERP/04_DEVELOPPEMENT/BRIEF_PRICING.md` | Décisions pricing |
| `DUERP/04_DEVELOPPEMENT/brand/` | Logos SVG (full, symbol, white, navy) + favicons |

---

## 4. Architecture métier

```
Entreprise → Postes (UT) → Opérations → (Risque ED840 × Module) → Évaluation → Plan de Maîtrise → PDF DUERP
```

**Concepts clés** :
- L'unité d'analyse est l'**Opération** (pas le poste)
- Chaque poste a une opération spéciale **"Toutes opérations"** (créée auto par trigger DB) = risques transversaux non liés à une opération précise
- Criticité finale d'un poste pour un risque = **MAX** des criticités de toutes ses opérations sur ce risque
- 20 risques ED 840 INRS, chacun typé `AIGU`, `CHRONIQUE` ou `LES_DEUX`
- 9 modules normés (M01-M09), un par catégorie de risque chronique

### Cotation (source : `COTATION.txt`)

- **Risque AIGU** : Criticité = G(1-5) × P(1-4) → score 1-20
- **Risque CHRONIQUE APR standard** : G(1-5) × DE(1-4) → score 1-20
- **Risque CHRONIQUE module normé** : méthode spécifique (ex: Lex,8h pour bruit)
- **Plan de Maîtrise (PM)** : coefficient 0.0 / 0.25 / 0.5 / 0.75 / 1.0
- **Criticité résiduelle** = Criticité brute × (1 − PM)

**Zones de couleur** :
- Vert (1-4) : acceptable
- Jaune (5-9) : à planifier
- Orange (10-14) : prioritaire
- Rouge (15-20) : action immédiate

### Modules de risques

| Code | Module | Statut |
|---|---|---|
| M01 | Bruit | Actif |
| M02 | Vibrations | Coming soon V1, à implémenter V2 |
| M03 | TMS | Coming soon V1, à implémenter V2 |
| M04 | Charge physique | Coming soon V1 |
| M05 | RPS | Coming soon V1 |
| M06 | Chimique/CMR | Backlog |
| M07 | Biologique | Backlog |
| M08 | Thermique | Backlog |
| M09 | Rayonnements | Backlog |

---

## 5. Stack technique

- **Framework** : Next.js 16+, App Router, TypeScript strict
- **Base de données** : Supabase (PostgreSQL + Auth + RLS) — free tier
- **Paiements** : Stripe (Checkout + Webhooks + Customer Portal) + virement manuel pour annuel
- **Déploiement** : Vercel — free tier, déploiement auto sur push main
- **PDF** : @react-pdf/renderer
- **UI** : Tailwind CSS + shadcn/ui
- **Drag-and-drop** : @dnd-kit/sortable
- **Animations** : Motion (ex-Framer Motion)
- **Formulaires** : React Hook Form + Zod
- **État** : Zustand (légers, par domaine)
- **Icônes** : Lucide

### Routing

```
src/app/
├── (marketing)/          # Vitrine publique — layout marketing (header + footer marketing)
│   ├── page.tsx          # Landing /
│   ├── outil/
│   ├── reglementation/
│   ├── tarifs/
│   ├── a-propos/
│   ├── temoignages/
│   ├── faq/
│   ├── comparatif/
│   ├── contact/
│   ├── cgu/
│   ├── mentions-legales/
│   └── confidentialite/
├── auth/                 # Auth (login, signup) — pas de layout marketing/dashboard
└── dashboard/            # Outil SaaS authentifié — sidebar collapsible + header
    ├── postes/[id]/      # Page détail poste avec tableau APR éditable inline
    └── ...
```

### Conventions de code

1. **Langue** : commentaires en français, variables métier en français (`risque`, `evaluation`, `criticite`), code technique en anglais
2. **Validation** : toujours côté serveur via Server Action + Zod + RLS Supabase
3. **Mutations** : Server Actions pour 99% des cas, API Routes pour webhooks Stripe et génération PDF
4. **Optimistic updates** : oui pour l'édition inline du tableau APR
5. **Sauvegarde** : auto à chaque blur de cellule (pas de bouton "Enregistrer")
6. **Responsive** : tablette 1024px = cible terrain, doit fonctionner. Mobile = adapté mais moins prioritaire
7. **Erreurs** : toast d'erreur explicite, pas de message "An error occurred"
8. **Grilles de cotation** : constantes TypeScript dans `src/lib/cotation/` extraites de `COTATION.txt`

### Charte graphique (voir `BRAND.md` pour le détail)

- **Sidebar + header dashboard + chrome marketing** : palette navy `#031948` + or vieilli `#B8860B` + crème `#F5EEE1`
- **Tableau APR éditable** : palette neutre (blanc, gris `#F9FAFB`/`#E5E7EB`/`#374151`) — **n'utilise PAS la charte navy/or, c'est volontaire pour ressembler à un tableur pro**
- **Badges criticité** : couleurs fonctionnelles (vert/jaune/orange/rouge) partout, dans le tableau et dans la vitrine

---

## 6. État d'avancement (à jour avril 2026)

### Phase 1 — MVP fonctionnel — fait

- [x] 1A : Scaffold + Auth + Schéma DB + Vercel
- [x] 1B : Onboarding + Postes/Opérations
- [x] 1C : Présélection + Module Bruit
- [x] 1D : Tableau APR + Dashboard
- [x] 1E : Export PDF DUERP
- [x] 1F : Landing v1 + pages légales + déploiement prod

### Phase 2 — Monétisation + branding — fait

- [x] 2A : Stripe (abonnements + paywall + portail client)
- [x] PHASE_REVISION : Refonte module 5 APR avec 20 risques ED840
- [x] PHASE_VITRINE_BRANDING : séparation `(marketing)` vs `dashboard`, charte SafeAnalyse.
- [x] PHASE_VITRINE_V2 : nav, pages /outil /reglementation /a-propos /tarifs, animations
- [x] PHASE_TABLEAU_INLINE : édition inline du tableau APR + drag-and-drop
- [x] PHASE_UX_TABLEAU_A : sidebar collapsible, plein écran, nettoyage
- [x] PHASE_UX_TABLEAU_B2 : structure verticale rowspan + fixes sidebar/footer/déco + drag inter-opérations

### Phase 3 — Vitrine V3 + repositionnement Stratégie C — en cours

- [ ] PHASE_VITRINE_V3_A : Fondations (palette enrichie, nav hover, hero Apple-style)
- [ ] PHASE_VITRINE_V3_B : Pages contenu (/outil, /reglementation, /a-propos, /faq, /temoignages, /contact)
- [ ] PHASE_VITRINE_V3_C : Pages pricing (/tarifs Pack Industrie/Premium + /comparatif)
- [ ] Bascule pricing Stripe vers nouvelle grille (99€ / 149€)

### Phase 4 — Backlog post-lancement

- [ ] Modules M02-M05 (Vibrations, TMS, Charge physique, RPS)
- [ ] Multi-utilisateurs (rôles)
- [ ] Stockage PDF Supabase Storage
- [ ] Domaine custom safeanalyse.fr (à acheter)
- [ ] Modules M06-M09
- [ ] Système de parrainage clients
- [ ] Partenariat experts-comptables (canal de distribution)

---

## 7. Règles de développement strictes

### Ne JAMAIS faire sans validation utilisateur explicite

- Modifier le schéma DB sans migration documentée
- Toucher aux Server Actions existantes sans vérifier qu'elles continuent de marcher
- Changer la cotation (G×P, G×DE, PM, zones de couleur)
- Toucher au Webhook Stripe ou à la logique d'abonnement
- Supprimer ou renommer des fichiers dans `DUERP/`
- Casser le drag-and-drop ou l'édition inline du tableau APR

### Toujours faire

- Lire `DUERP/INDEX.txt` puis le fichier métier pertinent avant toute fonctionnalité métier
- Lire `BRAND.md` avant tout changement visuel
- Revalider `npm run build` à la fin de chaque phase
- Tester sur largeur 1024px (tablette terrain)
- Mettre à jour la section "État d'avancement" de ce fichier à la fin de chaque phase

### Sécurité

- RLS activée sur toutes les tables Supabase (chaque user voit uniquement ses données)
- Pas de secrets en dur dans le code (toujours via env vars)
- Pas de logs contenant des emails ou données utilisateur en prod

---

## 8. Commandes utiles

```bash
# Dev
npm run dev

# Build (à lancer avant chaque commit important)
npm run build

# Lint
npm run lint

# Migrations Supabase
# Les migrations sont dans supabase/migrations/, à appliquer manuellement dans le dashboard SQL editor

# Déploiement
git add .
git commit -m "..."
git push   # Vercel redéploie auto
```

---

## 9. Pour Claude Code spécifiquement

### Avant de commencer une tâche

1. Lire ce fichier en entier
2. Lire le fichier `DUERP/04_DEVELOPPEMENT/PHASE_*.md` correspondant à la tâche en cours
3. Lire les fichiers de référence métier listés dans le prompt
4. Si tu utilises Next.js, Supabase, Stripe, shadcn ou Motion → charger Context7 (`use library /vercel/next.js` etc.) pour avoir la doc à jour de la version installée

### Niveaux de réflexion à utiliser selon la tâche

- Petits fixes UI : pas de mot-clé spécial
- Refactoring moyen, design API, modif schéma DB simple : `think hard`
- Architecture, refonte multi-fichiers, migration complexe : `ultrathink`

### Si saturation contexte

- Utiliser `/compact focus on [sujet]` plutôt que `/clear` pour préserver le contexte clé
- Si découpe nécessaire, l'indiquer explicitement avant de commencer (« je vais traiter en 2 sessions, voici la coupe »)

### À la fin de chaque phase

- Mettre à jour la section 6 (État d'avancement) de ce fichier
- Proposer un message de commit clair
- Donner les commandes git push exactes
