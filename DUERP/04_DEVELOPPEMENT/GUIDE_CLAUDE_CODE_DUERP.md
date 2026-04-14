 # Guide : Comment utiliser Claude Code pour construire le SaaS DUERP

## Comment ça marche concrètement

Claude Code fonctionne différemment de Claude en conversation. C'est un outil en ligne de commande qui :

1. **Lit automatiquement un fichier `CLAUDE.md`** à la racine de ton projet à chaque session. C'est sa "mémoire permanente".
2. **Exécute des commandes** : il peut créer des fichiers, lancer des scripts, installer des packages, etc.
3. **Travaille mieux avec des tâches focalisées** : un gros prompt = résultats médiocres. Des prompts courts et séquentiels = résultats précis.

## La méthode (en 3 couches)

### Couche 1 — `CLAUDE.md` (contexte permanent)
Fichier à la racine du projet. Claude Code le lit automatiquement. Contient le contexte projet, la stack, les règles, l'état d'avancement.

### Couche 2 — Un prompt par phase
Tu copies-colles le contenu d'un fichier PHASE_XX.md à chaque session. Un prompt = une phase = un livrable.

### Couche 3 — Validation entre phases
Tu vérifies que tout fonctionne avant de passer à la suite.

## Roadmap complète

### Phase 1 — MVP (avant mise en ligne)

| Phase | Fichier | Contenu | Sessions estimées |
|---|---|---|---|
| 1A | `PHASE_1A.md` | Scaffold + Auth + DB + Vercel | 1 |
| 1B | `PHASE_1B.md` | Onboarding + Postes/Opérations | 1 |
| 1C | `PHASE_1C.md` | Présélection + Module Bruit (M01) | 1-2 |
| 1D | `PHASE_1D.md` | Tableau APR + Dashboard + Polish | 1 |
| 1E | `PHASE_1E.md` | Export PDF du DUERP | 1 |
| 1F | `PHASE_1F.md` | Landing page + Pages légales + Mise en prod | 1 |

**À la fin de la Phase 1** : le site est en ligne, un utilisateur peut s'inscrire, évaluer ses risques (module Bruit), et télécharger son DUERP en PDF.

### Phase 2 — Monétisation + Modules

| Phase | Fichier | Contenu | Sessions estimées |
|---|---|---|---|
| 2A | `PHASE_2A.md` | Stripe (abonnements + paywall) | 1-2 |
| 2B | À créer | Modules M02-M05 | 3-4 |

### Phase 3+ — Évolutions
- Multi-utilisateurs, domaine custom, modules M06-M09, rappels email, etc.

## Coûts d'infrastructure au lancement : 0€

| Service | Plan | Coût | Limites |
|---|---|---|---|
| Supabase | Free | 0€ | 500 MB DB, 50k auth users |
| Vercel | Hobby | 0€ | 100 GB bandwidth |
| Stripe | Standard | 0€ fixe | 1.4% + 0.25€ par transaction |

## Workflow type d'une session

```
1. Ouvre ton terminal dans le dossier du projet
2. Lance Claude Code : claude
3. Claude Code lit automatiquement CLAUDE.md
4. Colle le prompt de la phase en cours (contenu du fichier PHASE_XX.md)
5. Claude Code travaille
6. Tu valides le résultat
7. Mets à jour "État d'avancement" dans CLAUDE.md
8. Session suivante → prompt suivant
```

## Setup initial (avant la première session)

1. **Installe Claude Code** : `npm install -g @anthropic-ai/claude-code`
2. **Crée un dossier projet** : `mkdir duerp-saas && cd duerp-saas`
3. **Copie CLAUDE.md** à la racine : `cp [chemin]/DUERP/04_DEVELOPPEMENT/CLAUDE.md .`
4. **Copie le dossier DUERP/** dans le projet : `cp -r [chemin]/DUERP .`
5. **Lance Claude Code** : `claude`
6. **Colle le contenu de PHASE_1A.md**

## Conseils importants

- **Ne saute pas de phase.** Chaque phase dépend de la précédente.
- **Valide le schéma DB avant le frontend.** Phase 1A demande explicitement ta validation.
- **Si Claude Code fait une erreur**, corrige-le immédiatement.
- **Mets à jour CLAUDE.md** après chaque phase (coche les [x]).
- **Teste sur tablette** après chaque phase (DevTools > responsive 768px).
