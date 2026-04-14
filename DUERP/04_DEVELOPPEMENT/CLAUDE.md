# DUERP SaaS — Contexte projet pour Claude Code

## Projet

SaaS d'évaluation des risques professionnels (DUERP) pour les PME françaises.
Permet à un employeur de réaliser son Document Unique de manière guidée et conforme.

**Modèle économique (voir BUSINESS_PLAN.md pour le détail) :**
- SaaS : un seul plan tout inclus — 39€/mois ou 390€/an (1 mois offert)
- Essai gratuit 14 jours (accès complet)
- Mode découverte gratuit (1 poste, 2 opérations, pas d'export PDF)
- Consulting : prestation sur site (500-1800€ selon effectif), inclut 1 an de SaaS
- Le client a toujours son propre compte — William l'aide sur site si consulting

**V1 : 1 utilisateur par entreprise.** Pas de gestion de rôles multi-utilisateurs.

## Documentation métier

Toute la connaissance métier est dans le dossier `DUERP/` à la racine du projet.
**Lis toujours le fichier de référence AVANT de coder une fonctionnalité.**

| Fichier | Rôle |
|---|---|
| `DUERP/INDEX.txt` | Vue d'ensemble, arborescence, articulation entre fichiers |
| `DUERP/02_METHODOLOGIE/FONCTIONNEMENT_OUTIL.txt` | Vision produit et flux utilisateur |
| `DUERP/02_METHODOLOGIE/DEFINITIONS_RISQUES.txt` | Glossaire (risque, danger, poste, opération, criticité...) |
| `DUERP/01_FONDATIONS/COTATION.txt` | Système de cotation — UNIQUE SOURCE DE VÉRITÉ |
| `DUERP/02_METHODOLOGIE/STANDARD_PRESELECTION.txt` | 3 questions de présélection par module |
| `DUERP/03_MODULES_RISQUES/XX_MODULE/` | Contenu métier de chaque module (METHODE + REGLEMENTATION) |

## Architecture métier

```
Entreprise → Postes → Opérations → (Risque × Module) → Évaluation → Plan de Maîtrise → PDF
```

- L'unité d'analyse est l'**Opération** (pas le poste)
- Opération spéciale **"Toutes opérations"** = risques transversaux au poste (bruit ambiant, RPS...)
- Criticité finale du poste = MAX des criticités de toutes ses opérations pour un risque donné

## Système de cotation (source : COTATION.txt)

- **Risque AIGU** : Criticité = Gravité (1→5) × Probabilité (1→4) → score 1 à 20
- **Risque CHRONIQUE** : méthode normée spécifique par module (voir fichiers METHODE)
- **Plan de Maîtrise (PM)** : coefficient 0.0 → 1.0
- **Criticité résiduelle** = Criticité brute × PM
- **Décision V1** : cotation G×P (pas G×P×E — option avancée prévue en V2)

Zones de couleur :
- Vert (1-4) : acceptable
- Jaune (5-9) : à planifier
- Orange (10-14) : prioritaire
- Rouge (15-20) : action immédiate

## Présélection (source : STANDARD_PRESELECTION.txt)

Avant chaque module : 3 questions OUI/NON par couple (Opération × Module).
- 0 OUI → Criticité 1 automatique, module ignoré
- 1+ OUI → Module complet déclenché

## Modules de risques

| Code | Module | Statut V1 |
|---|---|---|
| M01 | Bruit | Actif (implémenté) |
| M02 | Vibrations | Actif (coming soon en V1, implémenté en V2) |
| M03 | TMS | Actif (coming soon en V1, implémenté en V2) |
| M04 | Charge physique | Actif (coming soon en V1, implémenté en V2) |
| M05 | RPS | Actif (coming soon en V1, implémenté en V2) |
| M06 | Chimique/CMR | Coming soon |
| M07 | Biologique | Coming soon |
| M08 | Thermique | Coming soon |
| M09 | Rayonnements | Coming soon |

## Stack technique

- **Framework** : Next.js 15, App Router, TypeScript strict
- **Base de données** : Supabase (PostgreSQL + Auth + Storage) — free tier
- **Paiements** : Stripe (abonnement mensuel/annuel + essai 14 jours)
- **Déploiement** : Vercel — free tier, URL xxx.vercel.app
- **PDF** : @react-pdf/renderer (génération côté serveur)
- **UI** : Tailwind CSS + shadcn/ui
- **Formulaires** : React Hook Form + Zod
- **État** : Zustand (stores légers par domaine)

## Intégrations externes

### Supabase (free tier)
- Auth : email/password
- PostgreSQL : toutes les données métier
- RLS : chaque utilisateur ne voit que les données de son entreprise
- Limites free tier : 500 MB DB, 1 GB storage, 50k auth users/mois

### Stripe (pas de coût fixe — commission par transaction uniquement)
- Plan unique : 39€/mois ou 390€/an
- Essai gratuit 14 jours (trial_period_days)
- Webhook pour gérer les événements de cycle de vie
- Customer Portal pour la gestion autonome
- Clients consulting : abonnement créé manuellement (1 an, offert avec la prestation)

### Vercel (free tier)
- Déploiement depuis GitHub
- URL gratuite : xxx.vercel.app (domaine custom en V2)
- Preview deployments pour les branches

## Règles de développement

1. **Langue** : commentaires en français, variables métier en français
2. **Responsive** : tout écran doit fonctionner sur tablette (PME terrain)
3. **Validation** : toujours côté serveur via Supabase RLS
4. **Grilles de cotation** : constantes TypeScript extraites des fichiers .txt
5. **Erreurs** : gérer les états d'erreur et de chargement sur chaque écran
6. **Sauvegarde** : sauvegarde automatique (draft) pour les formulaires longs
7. **Server Actions** : mutations simples. API Routes : webhooks, PDF, cas complexes

## État d'avancement

<!-- METTRE À JOUR APRÈS CHAQUE PHASE -->

### Phase 1 — MVP fonctionnel (avant mise en ligne)
- [x] Phase 1A : Scaffold + Auth + Schéma DB + Config Vercel
- [x] Phase 1B : Onboarding + Navigation Postes/Opérations
- [x] Phase 1C : Présélection + Module Bruit (M01)
- [x] Phase 1D : Tableau APR + Dashboard + Polish
- [x] Phase 1E : Export PDF du DUERP
- [ ] Phase 1F : Landing page + Pages légales + Déploiement production

### Phase 2 — Monétisation + Modules
- [ ] Phase 2A : Stripe (abonnements + paywall + portail client)
- [ ] Phase 2B : Modules M02-M05 (Vibrations, TMS, Charge physique, RPS)

### Phase 3+ — Évolutions futures
- [ ] Multi-utilisateurs (rôles admin/contributeur/lecteur)
- [ ] Stockage PDF dans Supabase Storage
- [ ] Domaine custom
- [ ] Modules M06-M09
- [ ] Option G×P×E (cotation avancée)
- [ ] Rappel annuel de mise à jour par email
