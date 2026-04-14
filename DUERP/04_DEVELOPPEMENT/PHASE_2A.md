# Phase 2A — Stripe : Abonnements + Portail client

## Contexte

L'application est en ligne, fonctionnelle et gratuite (Phases 1A-1F).
On intègre maintenant Stripe pour monétiser. L'objectif : proposer des abonnements mensuels/annuels aux PME.

**Modèle économique :**
- Les clients (PME) paient un abonnement pour utiliser l'outil en autonomie
- William propose aussi des prestations sur place (consulting) — le client a son propre compte, William l'aide à remplir
- L'outil en ligne est la même expérience pour tous les utilisateurs (autonomes ou accompagnés)

**Coûts d'infrastructure :**
- Stripe : gratuit (commission de 1.4% + 0.25€ par transaction carte en France)
- Supabase : free tier (500 MB DB, suffisant pour le lancement)
- Vercel : free tier (suffisant pour le lancement)
- Total coût fixe mensuel : 0€

## Prérequis

Avant de commencer cette phase :
- Créer un compte Stripe (stripe.com) → mode test
- Récupérer les clés API dans Dashboard Stripe > Developers > API Keys
- Renseigner dans `.env.local` :
  ```
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  ```

## Ce que tu dois faire

### 1. Définir les plans tarifaires

Crée un script `scripts/setup-stripe.ts` qui configure les produits via l'API Stripe.

**Un seul plan, tout inclus :**

| | Mensuel | Annuel |
|---|---|---|
| Prix | 39€/mois | 390€/an (1 mois offert) |

Tout est inclus : postes illimités, tous les modules actifs, export PDF, historique des versions.

**Période d'essai** : 14 jours gratuits, accès complet, sans carte bancaire. Après 14 jours, l'utilisateur doit s'abonner pour continuer à modifier et exporter.

**Mode découverte (sans payer)** : l'utilisateur peut créer son compte, saisir son entreprise et évaluer 1 poste avec 2 opérations. Il voit le résultat mais ne peut pas exporter le PDF.

**Consulting** : les clients acquis via prestation sur site ont l'abonnement SaaS inclus pendant 1 an. Après 1 an, renouvellement classique via Stripe.

Le script affiche les `price_id` Stripe à configurer.

### 2. Flux d'abonnement — Stripe Checkout

**Page pricing mise à jour** — `/pricing` (déjà créée en Phase 1F dans la landing) :
- 1 card principale avec toggle mensuel / annuel
- Prix annuel affiché avec la réduction visible ("1 mois offert — 390€ au lieu de 468€")
- Liste des fonctionnalités incluses
- Bouton "Essai gratuit 14 jours" → redirige vers Stripe Checkout
- Si déjà connecté : pré-remplir l'email
- Section FAQ en dessous (Qu'est-ce qu'un DUERP ? Est-ce obligatoire ? etc.)

**API Route** — `/api/stripe/checkout` :
- Crée une Stripe Checkout Session
- Mode : `subscription`
- `trial_period_days: 14`
- Passe le `user_id` Supabase en metadata
- Success URL : `/dashboard?checkout=success`
- Cancel URL : `/pricing?checkout=cancelled`

### 3. Webhook Stripe — `/api/stripe/webhook`

API Route qui reçoit les événements Stripe :

| Événement | Action en base |
|---|---|
| `checkout.session.completed` | Créer l'enregistrement dans `abonnements` (plan, date début, date fin trial) |
| `customer.subscription.updated` | Mettre à jour plan/statut |
| `invoice.paid` | Renouveler la date de fin |
| `invoice.payment_failed` | Marquer comme "impayé", envoyer alerte |
| `customer.subscription.deleted` | Marquer comme "annulé" |

Sécurité :
- Vérifier la signature webhook (`STRIPE_WEBHOOK_SECRET`)
- Utiliser `SUPABASE_SERVICE_ROLE_KEY` pour écrire en base

### 4. Logique d'accès (Paywall)

Crée un hook `useAbonnement()` qui retourne l'état de l'abonnement :

```typescript
type StatutAbonnement = 'essai' | 'actif' | 'impaye' | 'annule' | 'aucun'
```

**Règles d'accès :**

| Statut | Accès |
|---|---|
| `essai` (14 jours) | Accès complet |
| `actif` | Accès complet |
| `impaye` | Lecture seule (peut voir mais pas modifier/créer) + bandeau "Mettez à jour votre paiement" |
| `annule` | Lecture seule + export PDF bloqué + bandeau "Réabonnez-vous" |
| `aucun` (jamais abonné) | Accès découverte : 1 poste, 2 opérations, pas de PDF. Bandeau "Démarrez votre essai gratuit" |

Composant `<PaywallGuard>` qui wrap les pages/actions protégées.

### 5. Portail client Stripe

Bouton "Gérer mon abonnement" dans `/dashboard/parametres` :
- Redirige vers Stripe Customer Portal (billing.stripe.com)
- L'utilisateur peut : changer de plan, modifier le paiement, annuler, voir les factures

**API Route** — `/api/stripe/portal` qui crée une session Billing Portal.

### 6. UI dans le dashboard

- Badge dans la sidebar : "Essai — X jours restants" ou "Abonné" ou "Expiré"
- Bandeau d'alerte si abonnement expiré/impayé
- Page `/dashboard/parametres` avec :
  - Statut de l'abonnement (essai / actif / expiré)
  - Période (mensuel / annuel) et date de renouvellement
  - Bouton "Gérer mon abonnement" (Stripe Portal)
  - Bouton "Passer à l'annuel" si mensuel (économie visible)

## Passage en production Stripe

Quand les tests sont OK :
1. Activer le mode live dans Stripe Dashboard
2. Remplacer les clés `sk_test_` par `sk_live_` dans Vercel
3. Reconfigurer le webhook avec l'URL de production
4. Tester avec une vraie carte (ou carte Stripe test en mode live)

## C'est fini quand

- [ ] Page pricing affiche 1 plan × 2 périodes (mensuel/annuel)
- [ ] L'essai gratuit 14 jours fonctionne via Stripe Checkout
- [ ] Le webhook traite tous les événements listés
- [ ] Le paywall bloque les bonnes fonctionnalités selon le statut
- [ ] Le mode découverte fonctionne (1 poste, pas de PDF)
- [ ] Le Stripe Portal est accessible depuis les paramètres
- [ ] Le badge plan/essai s'affiche dans le dashboard
- [ ] Les transitions essai → actif → annulé fonctionnent
- [ ] Tout fonctionne en mode test Stripe
