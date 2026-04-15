# Spec — PHASE_PLAN_ACTION

**Date** : 2026-04-15  
**Périmètre** : Plan d'action risques aigus + Contacts entreprise + Rappels email  
**Statut** : Approuvé — prêt pour implémentation

---

## 1. Vue d'ensemble

Le Plan d'action est une nouvelle page du dashboard qui centralise toutes les actions correctives à mener sur les risques aigus (criticité résiduelle > 0, hors vert masqué par défaut). Elle permet d'assigner un responsable, fixer une échéance, suivre le statut, et déclencher des rappels email automatiques. Quand une action est marquée "Terminé", la criticité résiduelle dans le tableau APR est mise à jour automatiquement.

Le périmètre de cette phase : **risques aigus uniquement**. Les risques chroniques seront intégrés dans une phase ultérieure.

---

## 2. Architecture DB

### Nouvelle table : `contacts_entreprise`

```sql
id              uuid PK default gen_random_uuid()
entreprise_id   uuid FK → entreprises.id NOT NULL
prenom          text NOT NULL
nom             text NOT NULL
email           text NOT NULL
role            text  -- 'dirigeant' | 'chef_equipe' | 'rrh' | 'responsable_hse' | 'autre'
rappels_actifs  boolean NOT NULL default true
created_at      timestamptz default now()
updated_at      timestamptz default now()
```

RLS : l'utilisateur ne voit que les contacts de son entreprise (via `entreprises.user_id = auth.uid()`).

### Nouvelle table : `actions_plan`

```sql
id                    uuid PK default gen_random_uuid()
evaluation_id         uuid FK → evaluations.id NOT NULL
contact_id            uuid FK → contacts_entreprise.id (nullable)
description           text
type_prevention       text  -- 'technique' | 'organisationnelle' | 'formation_epi'
facilite              text  -- 'facile' | 'moyen' | 'complexe'
echeance              date
statut                text NOT NULL default 'a_faire'  -- 'a_faire' | 'en_cours' | 'termine'
rappels_actifs        boolean NOT NULL default true
coefficient_pm_cible  numeric(3,2)  -- 0.0 | 0.25 | 0.5 | 0.75 | 1.0
criticite_cible       numeric(4,1)  -- auto-calculée : criticite_brute × (1 − coeff_pm_cible)
commentaire           text
date_realisation      date  -- remplie automatiquement quand statut → 'termine'
created_at            timestamptz default now()
updated_at            timestamptz default now()
```

RLS : via `evaluations → operations → postes → entreprises → user_id = auth.uid()`.

### Contrainte clé

Une évaluation peut avoir plusieurs actions (1:N). Pas de UNIQUE sur `evaluation_id`.

---

## 3. Page `/dashboard/plan-action`

### Layout

- En-tête : titre + sous-titre + **4 badges KPI** (À faire / En cours / Terminé / Export PDF)
- 2 onglets : **🔴 Priorités** (toutes actions triées par criticité résiduelle desc) et **🏭 Par poste** (groupées par poste)
- Barre de filtres : dropdown "Tous les postes" / dropdown "Tous les statuts" / checkbox "Afficher risques maîtrisés (verts)"

### Tableau inline (onglet Priorités)

Super-headers sur 3 zones :

| Zone | Colonnes | Comportement |
|---|---|---|
| Depuis l'APR (lecture seule) | Poste·Opération / Danger / C.résid. / Mesures existantes | Non éditable |
| Action corrective ✏️ | Description / Type PGP / Facilité / Responsable / Échéance / Statut / 🔔 | Édition inline au clic |
| Résultat | C. cible | Auto-calculée |

### Colonne Responsable

- Dropdown lié à `contacts_entreprise` de l'entreprise
- Chaque option affiche : prénom nom + rôle en gris
- Bouton **"+"** à droite du dropdown → ouvre un mini-formulaire inline (popover) :
  - Champs : Prénom, Nom, Email, Rôle (select)
  - Bouton "Enregistrer" → crée le contact dans `contacts_entreprise` ET sélectionne directement ce nouveau contact dans le dropdown
  - Note affichée : "Sauvegardé aussi dans Paramètres → Contacts"

### Colonne 🔔 (rappels)

Toggle Apple-style (vert `#16a34a` / gris `#e2e8f0`) par ligne d'action. Correspond à `actions_plan.rappels_actifs`. Sauvegarde auto au toggle.

### Édition inline

- Clic sur une cellule bleue → champ actif (input/select/date selon le type)
- Sauvegarde auto au blur (onBlur)
- Pas de bouton "Enregistrer" dans le tableau

### Logique criticité cible (colonne C. cible)

```
criticite_cible = criticite_brute × (1 − coefficient_pm_cible)
```

Calculée en temps réel côté client quand `coefficient_pm_cible` change, persistée en base.

### Mise à jour APR quand action terminée

Quand `statut` passe à `'termine'` via Server Action :
1. `date_realisation` = today
2. `plans_maitrise.coefficient_pm` ← `action.coefficient_pm_cible` (pour l'évaluation liée)
3. `plans_maitrise.criticite_residuelle` recalculée : `criticite_brute × (1 − nouveau_pm)`

Le tableau APR reflète immédiatement l'amélioration sans action supplémentaire de l'utilisateur.

### Tri onglet Priorités

Ordre : criticité résiduelle décroissante → par échéance croissante (les plus urgents en premier).  
Risques verts (criticité résiduelle ≤ 4) masqués par défaut, checkbox pour les afficher.

### Onglet Par poste

Même tableau, groupé par poste avec un sous-total "X actions en cours" par groupe. Même édition inline.

---

## 4. Page `/dashboard/parametres/contacts`

Nouvelle sous-page dans les paramètres.

### Layout

- Titre + description : "Ces personnes peuvent être assignées comme responsables d'une action et recevoir des rappels par email."
- Bouton "+ Ajouter un contact" (ouvre un formulaire modal ou inline)
- Tableau :

| Colonne | Détail |
|---|---|
| Nom | Prénom + Nom |
| Email | email |
| Rôle | badge coloré par rôle |
| Rappels actifs | Toggle Apple-style (`rappels_actifs`) |
| Actions | ✏️ modifier / 🗑️ supprimer |

### Rôles disponibles

`Dirigeant` / `Chef d'équipe` / `RRH` / `Responsable HSE` / `Autre`

### Navigation Settings

Ajouter "Contacts" dans le menu des paramètres (entre "Entreprise" et "Abonnement" ou en fin de liste).

---

## 5. Système de rappels email

### Stack technique

- **Cron** : Vercel Cron — route `/api/cron/reminders` — schedule : `0 8 * * *` (8h chaque matin)
- **Email** : [Resend](https://resend.com) — free tier 3 000 emails/mois, SDK officiel Next.js
- **Sécurisation** : header `Authorization: Bearer CRON_SECRET` vérifié dans la route

### Déclencheurs

| Timing | Condition |
|---|---|
| J − 7 | `echeance = today + 7 jours` ET `statut ≠ 'termine'` |
| Jour J | `echeance = today` ET `statut ≠ 'termine'` |
| Mensuel | `echeance < today` ET `statut ≠ 'termine'` ET `day_of_month = 1` (1er de chaque mois, simple et robuste) |

### Règle de blocage (priorité)

1. `actions_plan.rappels_actifs = false` → aucun email pour cette action
2. `contacts_entreprise.rappels_actifs = false` → aucun email pour ce contact quelle que soit l'action

L'email est envoyé **uniquement si les deux sont à `true`**.

### Contenu de l'email

- Objet : `SafeAnalyse. — Rappel action : [description courte]`
- Corps : prénom du destinataire, description de l'action, poste/opération, criticité actuelle, échéance, lien direct vers `/dashboard/plan-action`
- Footer : lien "Se désabonner de ces rappels" → met `contacts_entreprise.rappels_actifs = false`

### Variables d'environnement requises

```
RESEND_API_KEY=re_...
CRON_SECRET=...
```

---

## 6. Navigation sidebar

Ajouter un item "Plan d'action" dans la sidebar dashboard :
- Position : après "Module Bruit", avant "Paramètres"
- Icône : clipboard ou checklist (Lucide `ClipboardList`)
- Href : `/dashboard/plan-action`

---

## 7. Migration DB

Numéro : **011**  
Fichier : `supabase/migrations/011_plan_action.sql`

Contenu :
1. Créer `contacts_entreprise` + RLS + index sur `entreprise_id`
2. Créer `actions_plan` + RLS + index sur `evaluation_id`
3. Trigger `updated_at` sur les deux tables
4. Trigger `date_realisation` : quand `statut` passe à `'termine'`, renseigner `date_realisation = now()` si null

---

## 8. Server Actions

### `src/app/dashboard/plan-action/_actions.ts`

- `getActionsPlan(entrepriseId)` : récupère toutes les actions avec leurs évaluations et contacts liés
- `upsertAction(payload)` : crée ou met à jour une action (appelé au blur de chaque cellule)
- `updateStatutAction(actionId, statut)` : change le statut — si 'termine', appelle aussi `mettreAJourPMApresAction()`
- `mettreAJourPMApresAction(actionId)` : met à jour `plans_maitrise` + recalcule `criticite_residuelle`
- `toggleRappelsAction(actionId, actif)` : bascule `rappels_actifs` sur l'action

### `src/app/dashboard/parametres/contacts/_actions.ts`

- `getContacts(entrepriseId)`
- `createContact(payload)`
- `updateContact(contactId, payload)`
- `deleteContact(contactId)` (soft delete ou suppression selon usage)
- `toggleRappelsContact(contactId, actif)`

### `src/app/api/cron/reminders/route.ts`

- Vérifie `Authorization: Bearer CRON_SECRET`
- Requête les actions à relancer (J-7, J, mensuel)
- Pour chaque action : vérifie les deux toggles → envoie via Resend si OK
- Retourne `{ sent: N, skipped: M }`

---

## 9. Composants UI

- `src/app/dashboard/plan-action/page.tsx` — Server Component, charge les données
- `src/app/dashboard/plan-action/_components/tableau-plan-action.tsx` — Client Component, tableau inline
- `src/app/dashboard/plan-action/_components/dropdown-responsable.tsx` — Client Component, dropdown + mini-formulaire "+"
- `src/app/dashboard/parametres/contacts/page.tsx` — page contacts Settings
- `src/app/dashboard/parametres/contacts/_components/liste-contacts.tsx` — Client Component

---

## 10. Hors périmètre (phase ultérieure)

- Intégration des risques chroniques dans le Plan d'action
- Export PDF du Plan d'action
- Historique des actions (audit trail)
- Notifications in-app (seulement email pour l'instant)
