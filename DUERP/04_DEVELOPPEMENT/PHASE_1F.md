# Phase 1F — Landing page + Pages légales + Mise en production

## Contexte

L'application est complète pour la V1 : évaluation des risques (M01 Bruit), tableau APR, export PDF.
Avant de mettre en ligne, il faut une landing page publique, les pages légales minimales, et configurer le déploiement.

## Ce que tu dois faire

### 1. Landing page — `/` (page d'accueil publique)

Page marketing simple et efficace. Pas besoin d'un site complexe.

**Structure de la page :**

- **Hero** : titre accrocheur + sous-titre + CTA "Créer mon DUERP gratuitement"
  - Titre suggestion : "Votre Document Unique en ligne, simple et conforme"
  - Sous-titre : "L'outil qui guide les PME dans leur évaluation des risques professionnels"
  
- **Section "Comment ça marche"** : 4 étapes visuelles
  1. Créez votre entreprise
  2. Déclarez vos postes et opérations
  3. Évaluez chaque risque avec nos grilles guidées
  4. Générez votre DUERP en PDF, prêt pour l'inspection

- **Section "Pourquoi cet outil"** : 3-4 arguments
  - Conforme au Code du travail (L4121-1, Loi 2021)
  - Guidé pas à pas, pas besoin d'expertise HSE
  - Adapté aux PME et TPE
  - Export PDF professionnel

- **Section pricing** : les plans tarifaires (voir Phase 2A)
  - En attendant Stripe : afficher "Accès anticipé gratuit" ou un seul plan

- **Footer** : liens vers CGU, Mentions légales, Politique de confidentialité, Contact

**Design** : sobre, professionnel, couleurs inspirées du thème dashboard. Pas de fioritures.

### 2. Pages légales (obligatoires en France)

Même sans statut juridique finalisé, il faut des pages avec les mentions minimales.
Crée ces pages avec des placeholders [À COMPLÉTER] pour les infos manquantes.

**`/mentions-legales`** :
- Éditeur du site : [Nom / Raison sociale — À COMPLÉTER]
- Responsable de la publication : William Maréchal
- Hébergeur : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA
- Contact : [email — À COMPLÉTER]

**`/cgu`** (Conditions Générales d'Utilisation) :
- Objet du service
- Conditions d'accès (inscription, compte)
- Obligations de l'utilisateur
- Propriété intellectuelle
- Limitation de responsabilité (l'outil aide mais ne remplace pas un expert HSE)
- Résiliation
- Droit applicable : droit français, tribunaux de [ville — À COMPLÉTER]

**`/confidentialite`** (Politique de confidentialité / RGPD) :
- Données collectées (email, nom entreprise, données d'évaluation)
- Finalité du traitement (fourniture du service)
- Base légale (exécution du contrat)
- Durée de conservation (40 ans pour le DUERP, obligation légale)
- Droits des utilisateurs (accès, rectification, suppression, portabilité)
- Sous-traitants (Supabase pour la DB, Vercel pour l'hébergement, Stripe pour les paiements)
- Contact DPO : [email — À COMPLÉTER]
- Cookies : uniquement cookies techniques (pas de tracking tiers en V1)

### 3. Bandeau cookies

Composant simple : bannière en bas de page qui informe que le site utilise uniquement des cookies techniques nécessaires au fonctionnement. Bouton "J'ai compris" qui enregistre le choix (pas besoin de consentement pour les cookies techniques, mais afficher l'info est une bonne pratique).

### 4. Page contact — `/contact`

Formulaire simple :
- Nom
- Email
- Message
- Bouton envoyer → envoie un email à ton adresse (via Supabase Edge Function ou un service comme Resend)

### 5. Configuration production

**Variables d'environnement Vercel :**
Documenter dans un fichier `DEPLOYMENT.md` à la racine du projet :

```markdown
## Variables d'environnement à configurer dans Vercel

### Supabase
- NEXT_PUBLIC_SUPABASE_URL → Dashboard Supabase > Settings > API
- NEXT_PUBLIC_SUPABASE_ANON_KEY → Dashboard Supabase > Settings > API
- SUPABASE_SERVICE_ROLE_KEY → Dashboard Supabase > Settings > API (garder secret)

### Stripe (Phase 2A)
- STRIPE_SECRET_KEY → Dashboard Stripe > Developers > API Keys
- STRIPE_WEBHOOK_SECRET → Dashboard Stripe > Developers > Webhooks
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → Dashboard Stripe > Developers > API Keys

### App
- NEXT_PUBLIC_APP_URL → L'URL de ton site (ex: https://duerp-app.vercel.app)
```

**Checklist pré-déploiement :**
- [ ] Créer un projet Supabase (supabase.com → New Project)
- [ ] Exécuter les migrations SQL sur la DB Supabase
- [ ] Configurer l'auth Supabase (activer email/password, personnaliser les emails)
- [ ] Push le code sur GitHub
- [ ] Connecter le repo GitHub à Vercel (vercel.com → Import Project)
- [ ] Renseigner les variables d'environnement dans Vercel
- [ ] Vérifier le build et le déploiement
- [ ] Tester le parcours complet sur l'URL Vercel

### 6. Personnalisation des emails Supabase

Dans le dashboard Supabase > Authentication > Email Templates :
- Email de confirmation d'inscription → personnaliser en français
- Email de réinitialisation de mot de passe → personnaliser en français
- Redirect URL → configurer vers ton URL Vercel

## C'est fini quand

- [ ] La landing page s'affiche à `/` avec un design professionnel
- [ ] Le CTA "Créer mon DUERP" redirige vers `/auth/signup`
- [ ] Les 3 pages légales existent (mentions, CGU, confidentialité) avec placeholders
- [ ] Le bandeau cookies s'affiche au premier visit
- [ ] La page contact fonctionne
- [ ] Le fichier DEPLOYMENT.md documente tout le setup
- [ ] L'application est déployée sur Vercel et accessible en ligne
- [ ] Le parcours complet fonctionne sur l'URL de production
