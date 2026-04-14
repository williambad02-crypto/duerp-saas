# Guide de déploiement — DUERP SaaS

## Prérequis

- Compte GitHub (code source)
- Compte Supabase (base de données + auth)
- Compte Vercel (hébergement)
- Compte Stripe (paiements — Phase 2A)

---

## 1. Base de données Supabase

### 1.1 Créer le projet

1. Aller sur [supabase.com](https://supabase.com) → **New Project**
2. Choisir une région européenne (ex: `eu-central-1` Frankfurt)
3. Noter le mot de passe DB — vous en aurez besoin pour les migrations

### 1.2 Exécuter les migrations SQL

Dans le dashboard Supabase → **SQL Editor**, exécuter dans l'ordre :

```sql
-- Migration 001 : Schéma principal (tables + RLS + triggers)
-- Copier-coller le contenu de supabase/migrations/001_schema.sql

-- Migration 002 : Versioning DUERP
-- Copier-coller le contenu de supabase/migrations/002_versions_duerp.sql

-- Migration 003 : Table de contact
-- Copier-coller le contenu de supabase/migrations/003_contacts.sql
```

### 1.3 Configurer l'authentification

Dans Supabase → **Authentication** :

1. **Providers** → Email : activer "Confirm email"
2. **URL Configuration** :
   - Site URL : `https://votre-app.vercel.app`
   - Redirect URLs : `https://votre-app.vercel.app/auth/callback`
3. **Email Templates** → Personnaliser en français (voir section 5)

### 1.4 Récupérer les clés API

Supabase → **Settings** → **API** :
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (**secret — ne jamais exposer côté client**)

---

## 2. Déploiement Vercel

### 2.1 Push sur GitHub

```bash
git init
git add .
git commit -m "Initial commit — DUERP SaaS V1"
git remote add origin https://github.com/votre-compte/duerp-saas.git
git push -u origin main
```

### 2.2 Importer le projet sur Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → **Import Git Repository**
2. Sélectionner votre repo GitHub
3. Framework Preset : **Next.js** (auto-détecté)
4. Root Directory : `.` (racine du repo)

### 2.3 Variables d'environnement

Dans Vercel → **Project Settings** → **Environment Variables**, ajouter :

| Variable | Valeur | Environnements |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé `anon public` Supabase | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://votre-app.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://votre-preview.vercel.app` | Preview |

> Pour la Phase 2A (Stripe), ajouter également :
> - `STRIPE_SECRET_KEY` (secret — **Production + Preview uniquement**)
> - `STRIPE_WEBHOOK_SECRET` (secret — obtenu lors de la configuration du webhook)
> - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (public)
> - `STRIPE_PRICE_MENSUEL_ID` (obtenu via `npx tsx scripts/setup-stripe.ts`)
> - `STRIPE_PRICE_ANNUEL_ID` (obtenu via `npx tsx scripts/setup-stripe.ts`)

### 2.4 Déclencher le déploiement

Cliquer **Deploy** — Vercel build et déploie automatiquement.
URL de production : `https://votre-app.vercel.app`

---

## 3. Variables d'environnement en local

Créer un fichier `.env.local` à la racine (déjà dans `.gitignore`) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Phase 2A — Stripe
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 4. Checklist pré-mise en ligne

### Base de données
- [ ] Projet Supabase créé en région Europe
- [ ] Migrations 001, 002, 003 exécutées sans erreur
- [ ] Auth email/password activée
- [ ] Redirect URL configurée vers l'URL Vercel
- [ ] Tester la création de compte + connexion

### Application
- [ ] `npm run build` passe sans erreur en local
- [ ] Variables d'environnement renseignées dans Vercel
- [ ] Déploiement Vercel réussi (vert)
- [ ] Parcours complet testé sur l'URL de production :
  - [ ] Landing page s'affiche
  - [ ] Création de compte
  - [ ] Onboarding entreprise
  - [ ] Création poste → opération
  - [ ] Présélection bruit → évaluation M01
  - [ ] Tableau APR
  - [ ] Export PDF
- [ ] Pages légales accessibles : `/mentions-legales`, `/cgu`, `/confidentialite`
- [ ] Formulaire de contact fonctionnel
- [ ] Bandeau cookies s'affiche au premier visit

### Légal (avant publicité)
- [ ] Remplacer tous les `[À COMPLÉTER]` dans les pages légales
- [ ] Vérifier les mentions légales avec un juriste si souhaité

---

## 5. Personnalisation des emails Supabase (français)

### Email de confirmation d'inscription

**Supabase** → **Authentication** → **Email Templates** → **Confirm signup** :

```html
<h2>Confirmez votre adresse email</h2>
<p>Bonjour,</p>
<p>Merci de vous être inscrit sur DUERP SaaS. Cliquez sur le lien ci-dessous pour confirmer votre adresse email :</p>
<p><a href="{{ .ConfirmationURL }}">Confirmer mon email</a></p>
<p>Ce lien expire dans 24 heures.</p>
<p>Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</p>
<p>L'équipe DUERP SaaS</p>
```

### Email de réinitialisation de mot de passe

**Authentication** → **Email Templates** → **Reset password** :

```html
<h2>Réinitialisation de votre mot de passe</h2>
<p>Bonjour,</p>
<p>Vous avez demandé la réinitialisation de votre mot de passe DUERP SaaS.</p>
<p><a href="{{ .ConfirmationURL }}">Réinitialiser mon mot de passe</a></p>
<p>Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
<p>L'équipe DUERP SaaS</p>
```

---

## 6. Domaine personnalisé (optionnel — V2)

1. Acheter un domaine (ex: `duerp-app.fr`) chez OVH, Gandi...
2. Vercel → **Project Settings** → **Domains** → **Add Domain**
3. Configurer les DNS selon les instructions Vercel
4. Mettre à jour `NEXT_PUBLIC_APP_URL` + Supabase redirect URL

---

## 7. Monitoring (optionnel)

- **Vercel Analytics** : activer dans Project Settings → Analytics (free tier)
- **Supabase Logs** : Database → Logs pour surveiller les requêtes
- **Errors** : Vercel → Functions → Logs pour les erreurs API
