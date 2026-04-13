# Phase 1A — Scaffold + Auth + Schéma DB + Config Vercel

## Contexte

On construit un SaaS DUERP (évaluation des risques professionnels pour PME).
Lis `CLAUDE.md` à la racine du projet pour le contexte complet.

## Ce que tu dois faire dans cette phase

### 1. Scaffold du projet

Initialise le projet avec :

```
Next.js 15 (App Router) + TypeScript strict + Tailwind CSS + shadcn/ui
```

Configure le client Supabase (packages `@supabase/supabase-js` + `@supabase/ssr`).

Crée un fichier `.env.local.example` avec les variables nécessaires :

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (Phase 2A — laisser vide pour l'instant)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Structure des dossiers :

```
src/
├── app/                  # Routes (App Router)
│   ├── auth/             # Login, signup
│   ├── dashboard/        # App principale (protégée)
│   └── api/              # API Routes (webhooks Stripe, etc.)
├── components/           # Composants réutilisables
│   └── ui/               # shadcn/ui
├── lib/                  # Utilitaires, clients, constantes
│   ├── supabase/         # Client Supabase (server + client + middleware)
│   ├── stripe/           # Client Stripe (préparé mais pas actif)
│   └── constants/        # Constantes métier (cotation, modules...)
├── stores/               # Zustand stores
└── types/                # Types TypeScript
```

### 2. Authentification Supabase

Implémente :

- Page `/auth/login` — connexion email/password
- Page `/auth/signup` — inscription email/password
- Bouton de déconnexion dans le layout
- Middleware Next.js : toute route sous `/dashboard/*` nécessite auth
- Redirection automatique vers `/dashboard` après connexion
- Redirection vers `/auth/login` si non authentifié
- Utilise `@supabase/ssr` pour la gestion des cookies (pas le client browser directement)

### 3. Schéma de base de données

**IMPORTANT : Propose-moi le schéma SQL AVANT de l'exécuter. Je veux le valider.**

Lis ces fichiers pour comprendre le modèle de données :

- `DUERP/INDEX.txt` — architecture fonctionnelle
- `DUERP/02_METHODOLOGIE/DEFINITIONS_RISQUES.txt` — glossaire
- `DUERP/02_METHODOLOGIE/FONCTIONNEMENT_OUTIL.txt` — flux utilisateur
- `DUERP/01_FONDATIONS/COTATION.txt` — système de cotation

Tables à créer :

- `entreprises` — profil entreprise (lié à auth.users via user_id)
- `postes` — postes de travail (lié à entreprise)
- `operations` — opérations par poste (inclure flag `est_transversale` pour "Toutes opérations")
- `evaluations` — une évaluation = un couple (opération × module de risque)
- `preselections` — réponses aux 3 questions de présélection
- `plans_maitrise` — mesures existantes + coefficient PM
- `abonnements` — préparer la table pour Stripe (stripe_customer_id, stripe_subscription_id, plan, statut, date_fin)

Contraintes :

- RLS (Row Level Security) sur TOUTES les tables : un utilisateur ne voit que les données de son entreprise
- Clés étrangères avec CASCADE sur suppression
- Champ `statut` sur evaluations : 'brouillon' | 'en_cours' | 'termine'
- Timestamps `created_at` et `updated_at` sur chaque table

### 4. Layout Dashboard

Crée un layout de base pour `/dashboard` :

- Sidebar avec navigation (Accueil, Postes, Tableau APR)
- Header avec nom de l'entreprise + bouton déconnexion
- Zone de contenu principale
- Responsive : sidebar se transforme en menu hamburger sur mobile/tablette

### 5. Configuration Vercel

Prépare le projet pour le déploiement Vercel :

- Fichier `vercel.json` à la racine (si config custom nécessaire)
- Vérifier que le `next.config.ts` est compatible Vercel
- Ajouter un `.gitignore` propre (node_modules, .env.local, .next, etc.)
- Initialiser le repo Git avec un premier commit

Le déploiement effectif se fera manuellement via `vercel` CLI ou le dashboard Vercel — pas besoin d'automatiser ici.

## C'est fini quand

- [ ] `npm run dev` démarre sans erreur
- [ ] On peut s'inscrire, se connecter, se déconnecter
- [ ] Les routes `/dashboard/*` sont protégées
- [ ] Le schéma SQL est généré (fichier migration) et validé par moi
- [ ] La table `abonnements` existe (vide, prête pour Stripe)
- [ ] Le layout dashboard s'affiche avec la sidebar
- [ ] L'app est responsive sur tablette
- [ ] Le repo Git est initialisé avec un .gitignore propre
- [ ] `npm run build` passe sans erreur (prêt pour Vercel)
