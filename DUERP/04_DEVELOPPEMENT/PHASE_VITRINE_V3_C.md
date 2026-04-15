ultrathink

use library /vercel/next.js
use library /stripe/stripe-node
use library /motiondotdev/motion

# Phase VITRINE V3 — Session C : Tarifs (Stratégie C) + Comparatif + bascule Stripe

## Avant tout, lire impérativement

1. `CLAUDE.md` à la racine — **section 2 Stratégie C avec les nouveaux prix**
2. `DUERP/04_DEVELOPPEMENT/ETUDE_MARCHE_DUERP.md` — pour le comparatif
3. `DUERP/04_DEVELOPPEMENT/BUSINESS_PLAN.md` — modèle économique (peut être obsolète, le CLAUDE.md fait foi)
4. Le code des Phases A et B doit être en place

## Contexte

Session C = la plus stratégique. On bascule SafeAnalyse. de l'ancien pricing (39€/mois unique) vers le nouveau pricing **Stratégie C** :

| Offre | Prix mensuel | Prix annuel (2 mois offerts) | Cible |
|---|---|---|---|
| **Pack Industrie** | 99€/mois | 990€/an | PME 1-50, jusqu'à 5 postes / 20 opérations |
| **Pack Premium** | 149€/mois | 1490€/an | PME 50-250, postes & opérations illimités, audit semestriel inclus |
| **Consulting** | 700€/jour (lancement) → 1000€/jour (post-sept 2026) | — | Sur devis, déplacement Morbihan inclus |

**Inclus avec consulting** : 2 ans de Pack Premium offerts (toute prestation ≥ 1 jour).
**Essai gratuit** : 14 jours sans CB.
**Mode découverte** : 1 poste / 2 opérations en lecture seule.

## Pages à traiter

1. `/tarifs` — refonte complète avec 2 packs SaaS + consulting visible
2. `/comparatif` — page dédiée vs cabinet HSE, Seirich/Oira, template Word/Excel
3. **Bascule Stripe** — mise à jour des produits Stripe + paywall dashboard

## 1. Page `/tarifs`

### Hero
- Fond `bg-brand-cream`
- Titre : "Un accompagnement sérieux, à un tarif transparent"
- Sous-titre : "Pas de devis caché, pas d'option à 50€. Vous payez ce qui est affiché, et tout est inclus."

Toggle **Mensuel / Annuel** centré sous le sous-titre, avec badge "2 mois offerts" sur Annuel.

### Section principale — 2 cards SaaS côte à côte

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
  {/* Pack Industrie */}
  <PricingCard
    name="Pack Industrie"
    price={isAnnual ? 990 : 99}
    period={isAnnual ? '/an' : '/mois'}
    description="Pour les TPE et PME jusqu'à 50 salariés"
    features={[
      'Jusqu'à 5 postes de travail',
      'Jusqu'à 20 opérations',
      'Les 20 risques ED 840 couverts',
      'Module Bruit (M01) inclus, modules M02-M05 dès leur sortie',
      'Export PDF DUERP conforme',
      'Conservation 40 ans automatique',
      'Mise à jour annuelle assistée',
      'Support email sous 24h ouvrées',
    ]}
    cta="Commencer l'essai gratuit"
    href="/auth/signup?plan=industrie"
  />

  {/* Pack Premium - HIGHLIGHT */}
  <PricingCard
    name="Pack Premium"
    price={isAnnual ? 1490 : 149}
    period={isAnnual ? '/an' : '/mois'}
    description="Pour les PME 50-250 salariés"
    highlight
    features={[
      'Postes et opérations illimités',
      'Tous les modules (M01 + M02-M05 dès leur sortie)',
      'Audit semestriel d\'évolution inclus (visio 1h)',
      'Plans de prévention (PAPRIPACT) intégrés',
      'Tableau de bord criticités multi-postes',
      'Export PDF DUERP conforme',
      'Conservation 40 ans automatique',
      'Support prioritaire (4h ouvrées)',
      'Onboarding personnalisé (visio 30 min)',
    ]}
    cta="Commencer l'essai gratuit"
    href="/auth/signup?plan=premium"
  />
</div>
```

### Section secondaire — Consulting

Encart distinct sous les cards SaaS :

```tsx
<div className="mt-16 bg-brand-navy-deep rounded-3xl p-12 text-brand-cream max-w-5xl mx-auto">
  <div className="grid md:grid-cols-2 gap-12 items-center">
    <div>
      <span className="inline-block px-3 py-1 bg-brand-gold-light/20 text-brand-gold-light text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
        Accompagnement sur site
      </span>
      <h3 className="text-3xl font-bold mb-4">Faites votre DUERP avec moi, sur place.</h3>
      <p className="text-brand-cream/80 mb-6">
        Pour les PME du Morbihan et de Bretagne sud, je me déplace dans votre entreprise pour réaliser le DUERP avec vous, directement dans l'outil. Vous gardez le compte SafeAnalyse. : ce qu'on construit ensemble vous appartient.
      </p>
      <ul className="space-y-2 text-brand-cream/90 mb-6">
        <li>✓ Visite des postes de travail avec vous</li>
        <li>✓ Saisie complète dans l'outil pendant la prestation</li>
        <li>✓ Restitution finale et plan d'action priorisé</li>
        <li>✓ <strong>2 ans de Pack Premium offerts</strong></li>
      </ul>
    </div>
    <div className="bg-brand-cream/5 border border-brand-cream/20 rounded-2xl p-8">
      <div className="text-sm text-brand-cream/60 mb-2">À partir de</div>
      <div className="text-5xl font-bold text-brand-gold-light mb-2">700€</div>
      <div className="text-brand-cream/80 mb-6">la journée — sur devis</div>
      <Button variant="cta" size="lg" className="w-full">Demander un devis</Button>
      <p className="text-xs text-brand-cream/60 mt-4">
        Frais kilométriques inclus jusqu'à 50 km autour de Lorient. Au-delà : barème kilométrique standard.
      </p>
    </div>
  </div>
</div>
```

### Section "Garanties"

3 cards rassurantes :
1. **Essai gratuit 14 jours** — Sans carte bancaire, accès complet à toutes les fonctionnalités
2. **Sans engagement** — Mensuel résiliable à tout moment, annuel avec 2 mois offerts
3. **Conformité garantie** — PDF prêt pour l'inspection, méthodes INRS

### Section FAQ tarifs

Accordion avec 6-8 questions spécifiques au pricing :
- Y a-t-il vraiment un essai gratuit sans carte bancaire ?
- Que se passe-t-il si je dépasse le quota Industrie (5 postes / 20 opérations) ?
- Puis-je passer du Pack Industrie au Premium ?
- Comment se passe la facturation annuelle ?
- Le consulting est-il limité au Morbihan ?
- Les modules M02-M05 sont inclus dans le prix actuel ?
- Que se passe-t-il à la fin de l'essai ?
- Y a-t-il un tarif association / collectivité ?

### CTA final
Section navy-deep : "Toujours hésitant ? Discutons-en." → bouton "Demander un échange" → `/contact`

## 2. Page `/comparatif`

### Hero
- Titre : "Pourquoi pas un autre outil ?"
- Sous-titre : "Comparons honnêtement SafeAnalyse. avec les alternatives existantes."

### Section "Les 4 grandes options"

Cards intro avec une phrase pour chaque concurrent type :
- **Cabinet HSE** — On délègue, c'est cher mais on n'y touche pas
- **SafeAnalyse.** — On a un outil simple + un humain joignable
- **Seirich / Oira (gratuits INRS)** — On se débrouille seul avec un outil pensé pour ergonomes
- **Template Word / Excel** — On bricole, c'est gratuit mais long et fragile

### Section principale — Tableau comparatif

```tsx
<table className="w-full max-w-6xl mx-auto">
  <thead>
    <tr>
      <th></th>
      <th className="bg-brand-navy text-brand-cream">SafeAnalyse.</th>
      <th>Cabinet HSE</th>
      <th>Seirich / Oira</th>
      <th>Template Word/Excel</th>
    </tr>
  </thead>
  <tbody>
    {/* Highlight la colonne SafeAnalyse */}
  </tbody>
</table>
```

Lignes (priorité aux critères du brief : temps, expertise, conformité, qualité du rendu) :

| Critère | SafeAnalyse. | Cabinet HSE | Seirich / Oira | Template W/E |
|---|---|---|---|---|
| **Coût annuel** | 990-1490€ + consulting si besoin | 1000-2000€ par audit (à refaire chaque année) | Gratuit | Gratuit |
| **Temps à y consacrer** | ~2h pour le premier setup | 0 (délégué) | Beaucoup (interface complexe) | Énormément |
| **Expertise requise** | Aucune (guidé pas-à-pas) | Aucune (cabinet le fait) | Élevée (pensé pour ergonomes INRS) | Élevée (vous écrivez tout) |
| **Méthodes INRS intégrées** | Oui (ED 840, ISO 9612, ED 6035…) | Oui | Partiellement (Seirich = chimique, Oira = sectoriel) | Non |
| **Mise à jour annuelle** | Simple et assistée | À repayer | Manuel | Manuel |
| **Conservation 40 ans** | Automatique | À votre charge | Non gérée | Manuel |
| **Conformité Code du travail** | PDF prêt pour inspection | Oui | Variable selon usage | Variable |
| **Accompagnement humain** | Oui (consulting Morbihan + support) | Inclus | Aucun | Aucun |
| **Évolution de l'outil** | Mises à jour incluses | Stable | INRS met à jour | Vous le faites |

**Style** : la colonne SafeAnalyse. est mise en valeur (fond `bg-brand-cream-light`, bordure or claire), les coches sont vertes (success), les "Non" sont en gris discret.

### Section "Quand choisir quoi ?"

Honnêteté assumée :
- **Choisissez un cabinet HSE si** : vous voulez tout déléguer une fois et ne plus y toucher pendant 2-3 ans, et le budget n'est pas un sujet.
- **Choisissez Seirich/Oira si** : vous avez une expertise HSE en interne et du temps pour vous former à des outils INRS.
- **Choisissez SafeAnalyse. si** : vous voulez maîtriser votre DUERP avec un outil simple, et avoir quelqu'un de joignable quand vous avez un doute.
- **Évitez les templates Word/Excel** : la conservation 40 ans et la mise à jour annuelle deviennent vite ingérables.

### CTA final
"Convaincu ? Démarrez l'essai gratuit ou demandez un échange."

## 3. Bascule Stripe — mise à jour des produits

### Étape 1 : créer les nouveaux produits dans le dashboard Stripe

À faire manuellement dans le dashboard Stripe (à documenter pour William) :
1. Désactiver l'ancien produit "39€/mois"
2. Créer "Pack Industrie Mensuel" — 99€/mois EUR récurrent
3. Créer "Pack Industrie Annuel" — 990€/an EUR récurrent
4. Créer "Pack Premium Mensuel" — 149€/mois EUR récurrent
5. Créer "Pack Premium Annuel" — 1490€/an EUR récurrent
6. Pour les 4 nouveaux produits : configurer essai 14 jours (`trial_period_days: 14`)

### Étape 2 : adapter le code

Mettre à jour `src/lib/stripe/products.ts` (ou équivalent) :

```typescript
export const STRIPE_PRODUCTS = {
  industrie_monthly: 'price_xxx',
  industrie_yearly: 'price_xxx',
  premium_monthly: 'price_xxx',
  premium_yearly: 'price_xxx',
} as const

export type PlanType = 'industrie' | 'premium'
export type BillingPeriod = 'monthly' | 'yearly'
```

Mettre à jour le checkout pour accepter `?plan=industrie|premium&period=monthly|yearly` en query params.

Mettre à jour le webhook Stripe pour gérer le mapping plan → quota :
- Industrie → max 5 postes, 20 opérations, modules de base
- Premium → illimité

Ajouter dans la table `abonnements` la colonne `plan_type` (enum 'industrie' | 'premium').

### Étape 3 : paywall et limites côté dashboard

Si l'utilisateur Pack Industrie tente de créer un 6e poste :
- Toast d'erreur : "Vous avez atteint la limite du Pack Industrie. Passez au Pack Premium pour des postes illimités."
- Bouton "Passer au Premium" qui ouvre le Customer Portal Stripe pour upgrade

Ajouter une bannière dans le dashboard pour les utilisateurs proches de la limite (ex: 4 postes / 5).

### Étape 4 : migration des clients existants

S'il y a déjà des clients sur l'ancien plan 39€ :
- Les laisser sur leur plan actuel (grandfathering)
- Ajouter un flag `legacy_plan: true` dans leur abonnement
- Leur envoyer un email expliquant la nouvelle structure (pas dans cette phase, en suivi)

## 4. Animations

Reprendre les patterns Phase A et B. Animation spéciale sur le toggle Mensuel/Annuel : transition fluide du prix avec `motion.span key={price}` qui re-render avec un fade.

## C'est fini quand

- [ ] `/tarifs` — 2 cards Pack Industrie / Pack Premium avec toggle mensuel/annuel
- [ ] `/tarifs` — section consulting visible et désirable
- [ ] `/tarifs` — 3 garanties + FAQ tarifs en accordion
- [ ] `/comparatif` — page dédiée avec tableau 4 colonnes
- [ ] `/comparatif` — section "quand choisir quoi" honnête
- [ ] Stripe : 4 produits créés (à faire manuellement par William, code prêt à recevoir les price IDs)
- [ ] Code mis à jour pour gérer les 2 plans + 2 périodes
- [ ] Webhook Stripe mappe correctement plan → quota
- [ ] Paywall fonctionnel côté dashboard (bloque création au-delà de 5 postes en Industrie)
- [ ] Bannière "approche de la limite" affichée à 4/5 postes
- [ ] Clients existants en grandfathering (flag legacy_plan)
- [ ] `npm run build` passe

## Étapes manuelles pour William (à documenter dans la console)

```
1. Aller dans le dashboard Stripe
2. Désactiver l'ancien produit 39€ (le passer en archived)
3. Créer 4 nouveaux produits avec les prix indiqués
4. Copier les 4 price IDs dans .env.local et Vercel :
   STRIPE_PRICE_INDUSTRIE_MONTHLY=price_xxx
   STRIPE_PRICE_INDUSTRIE_YEARLY=price_xxx
   STRIPE_PRICE_PREMIUM_MONTHLY=price_xxx
   STRIPE_PRICE_PREMIUM_YEARLY=price_xxx
5. Redéployer
```

## Ne PAS toucher

- Les pages déjà refondues en Phase A et B
- Le tableau APR
- Les Server Actions de gestion des risques
- Les anciens clients déjà en cours d'abonnement (grandfathering)

## À la fin

Mettre à jour `CLAUDE.md` section 6 : cocher `[x] PHASE_VITRINE_V3_C` ET `[x] Bascule pricing Stripe`.

## Commit

```bash
git add .
git commit -m "Vitrine V3 C - tarifs Pack Industrie/Premium + comparatif + bascule Stripe"
git push
```
