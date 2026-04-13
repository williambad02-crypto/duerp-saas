# Phase 1B — Onboarding entreprise + Navigation Postes/Opérations

## Contexte

Le scaffold, l'auth et le schéma DB sont en place (Phase 1A).
On construit maintenant le premier parcours utilisateur : créer son entreprise, puis gérer ses postes et opérations.

## Fichiers de référence à lire

- `DUERP/02_METHODOLOGIE/FONCTIONNEMENT_OUTIL.txt` — Section "MODULE 2 — INFORMATIONS ENTREPRISE"
- `DUERP/02_METHODOLOGIE/DEFINITIONS_RISQUES.txt` — Section "L'UNITÉ DE TRAVAIL (UT)" pour comprendre ce qu'est un Poste

## Ce que tu dois faire

### 1. Onboarding — Création de l'entreprise

Après la première connexion, si l'utilisateur n'a pas encore d'entreprise → rediriger vers `/dashboard/onboarding`.

Formulaire (React Hook Form + Zod) :

- Nom de l'entreprise (obligatoire)
- Secteur d'activité (select parmi une liste prédéfinie — BTP, Industrie, Agroalimentaire, Tertiaire, Santé, Agriculture, Transport, Commerce, Autre)
- Effectif (nombre — obligatoire)
- SIRET (optionnel, 14 chiffres)
- Adresse du site évalué (optionnel)

Après validation → insertion en base → redirection vers `/dashboard`.

Le dashboard affiche un message d'accueil avec un bouton "Commencer l'évaluation → Gérer mes postes".

### 2. Vue liste des Postes — `/dashboard/postes`

Afficher la liste des postes de l'entreprise dans un tableau/grille de cards :

- Nom du poste
- Nombre d'opérations
- Nombre de risques évalués
- Badge de criticité maximale du poste (couleur vert/jaune/orange/rouge)
- Bouton "Voir" → accède au détail du poste

Bouton "Ajouter un poste" en haut de page.

**État vide** : si aucun poste, afficher un message pédagogique :
> "Commencez par créer vos postes de travail. Un poste regroupe les salariés exposés aux mêmes risques (ex : Soudeur, Cariste, Agent administratif)."

### 3. Création/Édition d'un Poste

Modale ou page dédiée :

- Nom du poste (obligatoire) — ex: "Soudeur", "Cariste", "Secrétaire"
- Description (optionnel) — contexte libre

Après création → redirection vers la page détail du poste.

### 4. Page détail d'un Poste — `/dashboard/postes/[id]`

En haut : nom du poste + description + bouton éditer + bouton supprimer (avec confirmation).

En dessous : liste des opérations de ce poste.

### 5. Gestion des Opérations

Pour chaque poste, l'utilisateur peut :

- **Ajouter une opération** : nom (obligatoire) + description (optionnel)
- **Ajouter l'opération "Toutes opérations"** : bouton distinct, mis en évidence visuellement (couleur différente ou icône). Cette opération a le flag `est_transversale = true`. Elle ne peut exister qu'une fois par poste — si elle existe déjà, le bouton est désactivé.
- **Modifier / Supprimer** une opération

Chaque opération dans la liste affiche :

- Nom
- Badge "Transversale" si `est_transversale = true`
- Nombre de modules évalués / total
- Bouton "Évaluer les risques" → mène à l'écran de présélection (Phase 1C)

**État vide** : si aucune opération, afficher un message pédagogique :
> "Décomposez ce poste en opérations. Une opération est une tâche distincte (ex : soudage à l'arc, meulage, déplacement de pièces). Pour les risques qui touchent tout le poste (bruit ambiant, stress...), utilisez 'Toutes opérations'."

## C'est fini quand

- [ ] Après première connexion → redirection vers onboarding
- [ ] Formulaire entreprise fonctionne et enregistre en base
- [ ] Liste des postes s'affiche (ou état vide si aucun)
- [ ] On peut créer, modifier, supprimer un poste
- [ ] Page détail d'un poste affiche ses opérations
- [ ] On peut créer des opérations normales et l'opération "Toutes opérations"
- [ ] L'opération "Toutes opérations" ne peut être créée qu'une fois par poste
- [ ] Tous les formulaires ont une validation Zod
- [ ] Tout fonctionne sur tablette
