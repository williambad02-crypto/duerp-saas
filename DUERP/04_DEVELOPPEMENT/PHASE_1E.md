# Phase 1E — Export PDF du DUERP

## Contexte

L'application est fonctionnelle de bout en bout (Phases 1A-1D) : un utilisateur peut créer son entreprise, ses postes, ses opérations, évaluer le risque Bruit, et voir le tableau APR.

Il manque le livrable final : le PDF du Document Unique. Sans ce PDF, l'outil n'a aucune valeur légale pour l'utilisateur. C'est la fonctionnalité la plus critique du produit.

## Fichiers de référence à lire

- `DUERP/02_METHODOLOGIE/FONCTIONNEMENT_OUTIL.txt` — Sections "MODULE 1 — TABLEAU DE BORD" (bouton générer) et "VERSIONING & CONSERVATION LÉGALE"
- `DUERP/01_FONDATIONS/REGLEMENTATION.txt` — ce que doit contenir un DUERP légalement
- `DUERP/01_FONDATIONS/COTATION.txt` — zones de criticité pour le code couleur dans le PDF

## Ce que tu dois faire

### 1. Choix technique : génération PDF

Utilise **@react-pdf/renderer** (génération côté serveur via API Route).
Alternative si performance insuffisante : Puppeteer headless sur une API Route serverless.

Installe le package :
```
npm install @react-pdf/renderer
```

### 2. Structure du document PDF

Le PDF doit contenir les sections suivantes, dans cet ordre :

**Page de garde :**
- Titre : "Document Unique d'Évaluation des Risques Professionnels"
- Nom de l'entreprise
- Adresse du site évalué
- Effectif
- Date de génération
- Mention : "Généré via [nom du SaaS]"

**Page 2 — Sommaire :**
- Liste des postes évalués avec liens vers les pages correspondantes

**Section par poste :**
- Nom du poste
- Liste des opérations
- Pour chaque opération : tableau des risques évalués avec :
  - Module de risque
  - Résultat de la présélection (applicable / non applicable)
  - Si applicable : criticité brute, mesures PM existantes, coefficient PM, criticité résiduelle
  - Code couleur (vert/jaune/orange/rouge) sur la criticité
- Sous-total : criticité maximale du poste

**Tableau APR récapitulatif :**
- Même format que le tableau en ligne (Phase 1D)
- Trié par criticité résiduelle décroissante

**Plan de maîtrise global :**
- Liste de toutes les mesures existantes par poste/opération
- Pour les risques orange/rouge : mention "Action prioritaire requise"

**Pied de page :**
- Numéro de page
- Date de génération
- Version du document (numéro auto-incrémenté)

### 3. API Route de génération — `/api/pdf/generer`

- Méthode : POST
- Auth requise (vérifier le user via Supabase)
- Récupère TOUTES les données de l'entreprise (postes, opérations, évaluations, plans de maîtrise)
- Génère le PDF
- Retourne le fichier en stream (Content-Type: application/pdf)

### 4. Bouton "Générer le DUERP" dans le dashboard

- Bouton visible sur la page dashboard principale
- Au clic : appel à l'API, loading spinner, puis téléchargement automatique du PDF
- Nom du fichier : `DUERP_[NomEntreprise]_[Date].pdf`

### 5. Versioning basique

- Chaque génération de PDF crée un enregistrement dans une nouvelle table `versions_duerp` :
  - `id`, `entreprise_id`, `numero_version` (auto-incrémenté), `date_generation`, `generated_by`
- Afficher l'historique des versions dans le dashboard (date, numéro, bouton re-télécharger)
- Note : en V1, on ne stocke pas le PDF lui-même (il est régénéré à la demande). Le stockage dans Supabase Storage viendra en V2.

### 6. Adaptation selon l'effectif

Lire l'effectif de l'entreprise :
- Moins de 50 salariés → PDF simplifié (pas de Programme Annuel de Prévention)
- 50 salariés et plus → PDF complet avec section "Programme Annuel de Prévention" (en V1 : section vide avec mention "À compléter")

## C'est fini quand

- [ ] Le bouton "Générer le DUERP" produit un PDF téléchargeable
- [ ] Le PDF contient : page de garde, sommaire, détail par poste, tableau APR, plan de maîtrise
- [ ] Les codes couleur sont visibles dans le PDF
- [ ] Le numéro de version s'incrémente à chaque génération
- [ ] L'historique des versions est visible dans le dashboard
- [ ] Le PDF est lisible et professionnel (pas un export brut)
- [ ] La génération fonctionne même avec des données partielles (postes sans évaluation)
