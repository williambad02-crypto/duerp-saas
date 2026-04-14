# DUERP SaaS — Business Plan

## Le projet en une phrase

Un outil en ligne qui guide les PME françaises dans la réalisation de leur Document Unique d'Évaluation des Risques Professionnels, couplé à un service d'accompagnement sur site.

## Le marché

### L'obligation légale

Toute entreprise ayant au moins 1 salarié DOIT réaliser un DUERP (Code du travail, L4121-1). La mise à jour est obligatoire au moins une fois par an (et à chaque modification significative). L'absence de DUERP est sanctionnée d'une amende pouvant aller jusqu'à 1 500€ par unité de travail non évaluée, et engage la responsabilité pénale du dirigeant en cas d'accident.

### La cible

Les PME et TPE françaises sans service HSE dédié — soit la grande majorité des entreprises françaises :

- 4,2 millions d'entreprises en France
- 96% ont moins de 10 salariés (TPE)
- La plupart ne font pas ou mal leur DUERP par manque de compétence, de temps ou d'outils adaptés

### Le problème

Aujourd'hui, un dirigeant de PME a 3 options pour son DUERP :

| Option | Prix | Problème |
|---|---|---|
| Cabinet HSE | 500 — 2 000€ par DUERP | Trop cher pour les TPE, document livré mais pas compris |
| Outils existants (Seirich, Oira...) | Gratuits ou 20-50€/mois | Trop techniques, pas guidés, interface datée |
| Template Word/Excel | Gratuit | Aucune valeur ajoutée, risque de non-conformité |

### Notre positionnement

On se place entre le cabinet HSE (trop cher) et le template Word (trop léger) :

- Plus guidé et accessible que les outils techniques existants
- Moins cher qu'un cabinet HSE, avec un résultat comparable
- Option d'accompagnement humain pour ceux qui préfèrent être aidés

## L'offre

### 2 sources de revenus

#### 1. SaaS — Abonnement en ligne (self-service)

**Un seul plan, tout inclus.** Pas de tiers confusants.

| | Mensuel | Annuel |
|---|---|---|
| Prix | 39€/mois | 390€/an (= 1 mois offert) |

**Ce qui est inclus :**
- Création illimitée de postes et opérations
- Tous les modules de risques actifs
- Grilles d'évaluation guidées pas à pas
- Tableau APR de synthèse avec code couleur
- Export PDF du DUERP conforme
- Historique des versions (obligation légale 40 ans)
- Mises à jour de l'outil et des modules

**Essai gratuit 14 jours** — accès complet, sans carte bancaire. Après 14 jours, l'utilisateur doit s'abonner pour continuer à modifier et exporter.

**Mode découverte (sans inscription payante) :** l'utilisateur peut créer son compte, saisir son entreprise et évaluer 1 poste avec 2 opérations. Il voit le résultat mais ne peut pas exporter le PDF. Objectif : montrer la valeur avant de demander de payer.

#### 2. Consulting — Prestation sur site

Tu te déplaces chez le client pour réaliser l'évaluation des risques avec lui, directement dans l'outil.

**Grille tarifaire par effectif :**

| Effectif | Tarif prestation | Durée estimée | Inclus |
|---|---|---|---|
| 1-10 salariés (TPE) | 500€ | Demi-journée | Prestation + 1 an SaaS |
| 11-25 salariés | 800€ | 1 jour | Prestation + 1 an SaaS |
| 26-50 salariés | 1 200€ | 1-2 jours | Prestation + 1 an SaaS |
| 51-100 salariés | 1 800€ | 2-3 jours | Prestation + 1 an SaaS |
| 100+ salariés | Sur devis | Variable | Prestation + 1 an SaaS |

**Majoration selon le secteur :** les secteurs avec davantage de risques (BTP, industrie, chimie) nécessitent plus de temps. Prévoir une majoration de 20 à 40% par rapport à la grille de base pour ces secteurs. Les secteurs tertiaires et commerces restent au tarif de base.

**Le client repart avec :**
- Son compte SaaS actif pendant 1 an (abonnement inclus dans la prestation)
- Son DUERP rempli dans l'outil
- Son PDF exporté
- La possibilité de mettre à jour seul l'année suivante (ou de rappeler pour une nouvelle prestation)

**Renouvellement :** après 1 an, le client renouvelle l'abonnement SaaS seul (39€/mois ou 390€/an) ou re-commande une prestation.

## Avantage concurrentiel

| Avantage | Détail |
|---|---|
| Simplicité | Interface guidée pas à pas, vocabulaire accessible, pas besoin d'être expert HSE |
| Hybride SaaS + humain | Le seul outil qui propose aussi un accompagnement sur site — les cabinets HSE ne donnent pas l'outil, les outils ne donnent pas l'humain |
| Expertise réelle | Fondateur diplômé BUT HSE — pas un développeur qui a lu la loi, un professionnel HSE qui code son outil |
| Prix compétitif | 390€/an vs 500-2000€ par DUERP chez un cabinet. Le client économise dès la 2ème année car il met à jour seul |
| Conformité légale | Méthodes basées sur les normes INRS (ED840, ED6035, ISO 9612), pas sur des grilles génériques |

## Projection financière — Année 1

### Hypothèses conservatrices

- Objectif : 10-50 clients en 12 mois
- Acquisition progressive : ~3-4 nouveaux clients par mois
- Mix : 70% SaaS seul, 30% consulting + SaaS
- Pas de dépense marketing significative (réseau + LinkedIn + partenariats)

### Estimation des revenus

| Source | Calcul | Total année 1 |
|---|---|---|
| SaaS (abonnements) | ~25 clients en moyenne × 39€ × 8 mois moyen | ~7 800€ |
| Consulting | ~10 prestations × 700€ moyen | ~7 000€ |
| **Total** | | **~14 800€** |

### Coûts

| Poste | Coût |
|---|---|
| Infrastructure (Supabase + Vercel) | 0€ (free tiers) |
| Stripe (commission ~2%) | ~300€ |
| Statut micro-entrepreneur | 0€ (création gratuite) |
| Domaine (optionnel année 1) | 0-15€ |
| Déplacements consulting | Variable (facturer au client ou inclure dans le tarif) |
| **Total coûts fixes** | **~300€** |

### Marge : ~14 500€ (hors déplacements)

Ce n'est pas un salaire à plein temps, mais c'est un démarrage viable pour valider le produit et construire la base clients. L'objectif année 2 est de passer à 100-200 clients SaaS et d'augmenter la part consulting.

## Stratégie d'acquisition

### Canal 1 — Réseau personnel et bouche à oreille
- Contacte les entreprises où tu as fait tes stages/alternance
- Propose un tarif "early adopter" (ex : -20% la première année)
- Demande des témoignages/recommandations

### Canal 2 — LinkedIn
- Publie du contenu éducatif : "5 erreurs que font les PME dans leur DUERP", "Comment savoir si votre DUERP est conforme", etc.
- Cible les dirigeants de PME, responsables RH, gérants de TPE
- Profil LinkedIn positionné comme "Consultant HSE + créateur d'un outil DUERP"

### Canal 3 — Partenariats
- **Experts-comptables** : ils voient les entreprises sans DUERP, ils peuvent recommander ton outil (commission ou partenariat)
- **Services de médecine du travail (SPST)** : ils font des visites, ils voient les manques
- **Chambres de commerce (CCI/CMA)** : ils organisent des ateliers pour les créateurs d'entreprise

### Canal 4 — SEO (moyen terme)
- Référencer le site sur "faire son DUERP en ligne", "outil DUERP PME", "document unique obligatoire"
- Blog avec des articles pratiques (pas avant d'avoir 10+ clients)

## Statut juridique recommandé

**Micro-entreprise (auto-entrepreneur)** pour démarrer :
- Gratuit à créer
- Plafond 2024 : 77 700€ CA pour les prestations de service
- Cotisations : ~22% du CA (soit ~3 250€ sur 14 800€)
- Pas de TVA en dessous de 36 800€ CA

Tu pourras passer en SAS/SASU quand le CA dépassera le plafond ou quand tu voudras lever des fonds.

## Roadmap produit

### V1 — Lancement (Phases 1A → 1F)
- Module Bruit (M01) complet
- 4 modules affichés "Coming soon" (M02-M05)
- Export PDF conforme
- Landing page + pages légales

### V2 — Expansion (Phases 2A → 2B)
- Stripe (abonnements + paywall)
- Modules M02-M05 (Vibrations, TMS, Charge physique, RPS)

### V3 — Croissance
- Multi-utilisateurs (rôles)
- Modules M06-M09
- Domaine custom
- Rappel annuel de mise à jour par email
- App mobile (PWA)
