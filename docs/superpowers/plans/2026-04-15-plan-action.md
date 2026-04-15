# PHASE_PLAN_ACTION Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter la page Plan d'action risques aigus, la gestion des contacts entreprise dans les Settings, et le système de rappels email automatiques via Vercel Cron + Resend.

**Architecture:** Table `contacts_entreprise` (contacts assignables + toggle rappels) + table `actions_plan` (1:N par évaluation aigu, édition inline). Quand une action passe à "Terminé", le PM de l'évaluation liée est mis à jour dans `plans_maitrise`, ce qui recalcule la criticité résiduelle dans l'APR automatiquement. Les rappels sont envoyés par un cron Vercel quotidien via l'API Resend.

**Tech Stack:** Next.js 16 App Router, Supabase PostgreSQL + RLS, Server Actions, Tailwind CSS, Resend (email), Vercel Cron

---

## Carte des fichiers

| Fichier | Statut | Responsabilité |
|---|---|---|
| `supabase/migrations/011_plan_action.sql` | Créer | Tables + RLS + triggers |
| `src/app/dashboard/plan-action/_actions.ts` | Créer | Server Actions plan d'action |
| `src/app/dashboard/plan-action/page.tsx` | Créer | Server Component, chargement données |
| `src/app/dashboard/plan-action/_components/tableau-plan-action.tsx` | Créer | Client Component, tableau inline principal |
| `src/app/dashboard/plan-action/_components/dropdown-responsable.tsx` | Créer | Client Component, dropdown contacts + mini-form "+" |
| `src/app/dashboard/plan-action/_components/filtre-colonnes.tsx` | Créer | Client Component, filtres + visibilité colonnes |
| `src/app/dashboard/parametres/contacts/_actions.ts` | Créer | Server Actions contacts entreprise |
| `src/app/dashboard/parametres/contacts/page.tsx` | Créer | Page Settings contacts |
| `src/app/dashboard/parametres/contacts/_components/liste-contacts.tsx` | Créer | Client Component, tableau contacts éditable |
| `src/lib/email/reminders.ts` | Créer | Logique envoi email via Resend |
| `src/app/api/cron/reminders/route.ts` | Créer | Route cron quotidienne |
| `src/components/dashboard/sidebar.tsx` | Modifier | Ajouter item "Plan d'action" |
| `src/app/dashboard/parametres/page.tsx` | Modifier | Ajouter lien vers /contacts |
| `vercel.json` | Modifier | Déclarer le cron job |

---

## Task 1 — Migration SQL 011

**Files:**
- Create: `supabase/migrations/011_plan_action.sql`

- [ ] **Étape 1 : Créer le fichier de migration**

```sql
-- Migration 011 — Tables contacts_entreprise + actions_plan
-- À appliquer dans Supabase Dashboard → SQL Editor
-- Dépend de : migration 010 (evaluations_bruit)

-- ─── contacts_entreprise ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contacts_entreprise (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entreprise_id UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  prenom        TEXT NOT NULL,
  nom           TEXT NOT NULL,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'autre'
                  CHECK (role IN ('dirigeant','chef_equipe','rrh','responsable_hse','autre')),
  rappels_actifs BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contacts_entreprise_id
  ON contacts_entreprise(entreprise_id);

ALTER TABLE contacts_entreprise ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts: user voit ses contacts"
  ON contacts_entreprise FOR ALL
  USING (
    entreprise_id IN (
      SELECT id FROM entreprises WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    entreprise_id IN (
      SELECT id FROM entreprises WHERE user_id = auth.uid()
    )
  );

CREATE TRIGGER set_updated_at_contacts
  BEFORE UPDATE ON contacts_entreprise
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── actions_plan ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS actions_plan (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id        UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  contact_id           UUID REFERENCES contacts_entreprise(id) ON DELETE SET NULL,
  description          TEXT,
  type_prevention      TEXT CHECK (type_prevention IN ('technique','organisationnelle','formation_epi')),
  facilite             TEXT CHECK (facilite IN ('facile','moyen','complexe')),
  echeance             DATE,
  statut               TEXT NOT NULL DEFAULT 'a_faire'
                         CHECK (statut IN ('a_faire','en_cours','termine')),
  rappels_actifs       BOOLEAN NOT NULL DEFAULT true,
  coefficient_pm_cible NUMERIC(3,2) CHECK (coefficient_pm_cible IN (0.0,0.25,0.5,0.75,1.0)),
  criticite_cible      NUMERIC(4,1),
  commentaire          TEXT,
  date_realisation     DATE,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_actions_plan_evaluation_id
  ON actions_plan(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_actions_plan_contact_id
  ON actions_plan(contact_id);

ALTER TABLE actions_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "actions_plan: user voit ses actions"
  ON actions_plan FOR ALL
  USING (
    evaluation_id IN (
      SELECT e.id FROM evaluations e
      JOIN operations op ON op.id = e.operation_id
      JOIN postes p ON p.id = op.poste_id
      JOIN entreprises ent ON ent.id = p.entreprise_id
      WHERE ent.user_id = auth.uid()
    )
  )
  WITH CHECK (
    evaluation_id IN (
      SELECT e.id FROM evaluations e
      JOIN operations op ON op.id = e.operation_id
      JOIN postes p ON p.id = op.poste_id
      JOIN entreprises ent ON ent.id = p.entreprise_id
      WHERE ent.user_id = auth.uid()
    )
  );

-- Trigger updated_at
CREATE TRIGGER set_updated_at_actions_plan
  BEFORE UPDATE ON actions_plan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger auto date_realisation quand statut → 'termine'
CREATE OR REPLACE FUNCTION set_date_realisation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.statut = 'termine' AND OLD.statut <> 'termine' AND NEW.date_realisation IS NULL THEN
    NEW.date_realisation := CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_date_realisation
  BEFORE UPDATE ON actions_plan
  FOR EACH ROW EXECUTE FUNCTION set_date_realisation();
```

- [ ] **Étape 2 : Appliquer dans Supabase Dashboard**

Ouvre Supabase Dashboard → SQL Editor → colle et exécute le fichier ci-dessus.
Vérifie que les 2 tables apparaissent dans Table Editor.

- [ ] **Étape 3 : Commit**

```bash
git add supabase/migrations/011_plan_action.sql
git commit -m "db: migration 011 — tables contacts_entreprise + actions_plan"
```

---

## Task 2 — Server Actions contacts

**Files:**
- Create: `src/app/dashboard/parametres/contacts/_actions.ts`

- [ ] **Étape 1 : Créer les actions**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function getClientAndEntreprise() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: entreprise } = await supabase
    .from('entreprises').select('id').eq('user_id', user.id).single()
  if (!entreprise) redirect('/dashboard/onboarding')
  return { supabase, entrepriseId: entreprise.id }
}

export interface Contact {
  id: string
  prenom: string
  nom: string
  email: string
  role: 'dirigeant' | 'chef_equipe' | 'rrh' | 'responsable_hse' | 'autre'
  rappels_actifs: boolean
}

export async function getContacts(): Promise<Contact[]> {
  const { supabase, entrepriseId } = await getClientAndEntreprise()
  const { data } = await supabase
    .from('contacts_entreprise')
    .select('id, prenom, nom, email, role, rappels_actifs')
    .eq('entreprise_id', entrepriseId)
    .order('nom')
  return (data ?? []) as Contact[]
}

export async function createContact(payload: {
  prenom: string
  nom: string
  email: string
  role: Contact['role']
}): Promise<Contact> {
  const { supabase, entrepriseId } = await getClientAndEntreprise()
  const { data, error } = await supabase
    .from('contacts_entreprise')
    .insert({ ...payload, entreprise_id: entrepriseId })
    .select('id, prenom, nom, email, role, rappels_actifs')
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/parametres/contacts')
  revalidatePath('/dashboard/plan-action')
  return data as Contact
}

export async function updateContact(
  contactId: string,
  payload: Partial<Omit<Contact, 'id'>>
): Promise<void> {
  const { supabase } = await getClientAndEntreprise()
  const { error } = await supabase
    .from('contacts_entreprise')
    .update(payload)
    .eq('id', contactId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/parametres/contacts')
  revalidatePath('/dashboard/plan-action')
}

export async function deleteContact(contactId: string): Promise<void> {
  const { supabase } = await getClientAndEntreprise()
  const { error } = await supabase
    .from('contacts_entreprise')
    .delete()
    .eq('id', contactId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/parametres/contacts')
  revalidatePath('/dashboard/plan-action')
}

export async function toggleRappelsContact(
  contactId: string,
  actif: boolean
): Promise<void> {
  const { supabase } = await getClientAndEntreprise()
  await supabase
    .from('contacts_entreprise')
    .update({ rappels_actifs: actif })
    .eq('id', contactId)
  revalidatePath('/dashboard/parametres/contacts')
}
```

- [ ] **Étape 2 : Commit**

```bash
git add src/app/dashboard/parametres/contacts/_actions.ts
git commit -m "feat: server actions contacts_entreprise"
```

---

## Task 3 — Composant ListeContacts

**Files:**
- Create: `src/app/dashboard/parametres/contacts/_components/liste-contacts.tsx`

- [ ] **Étape 1 : Créer le composant**

```typescript
'use client'

import { useState, useTransition } from 'react'
import {
  createContact,
  updateContact,
  deleteContact,
  toggleRappelsContact,
  type Contact,
} from '../_actions'

const ROLES: Record<Contact['role'], string> = {
  dirigeant: 'Dirigeant',
  chef_equipe: "Chef d'équipe",
  rrh: 'RRH',
  responsable_hse: 'Responsable HSE',
  autre: 'Autre',
}

const ROLE_COLORS: Record<Contact['role'], string> = {
  dirigeant: 'bg-amber-100 text-amber-800',
  chef_equipe: 'bg-indigo-100 text-indigo-800',
  rrh: 'bg-pink-100 text-pink-800',
  responsable_hse: 'bg-green-100 text-green-800',
  autre: 'bg-gray-100 text-gray-700',
}

interface FormState {
  prenom: string
  nom: string
  email: string
  role: Contact['role']
}

const EMPTY_FORM: FormState = { prenom: '', nom: '', email: '', role: 'autre' }

export function ListeContacts({ contacts: initial }: { contacts: Contact[] }) {
  const [contacts, setContacts] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [isPending, startTransition] = useTransition()

  function handleToggleRappels(contactId: string, current: boolean) {
    setContacts(prev =>
      prev.map(c => c.id === contactId ? { ...c, rappels_actifs: !current } : c)
    )
    startTransition(async () => {
      await toggleRappelsContact(contactId, !current)
    })
  }

  function startEdit(contact: Contact) {
    setEditId(contact.id)
    setForm({ prenom: contact.prenom, nom: contact.nom, email: contact.email, role: contact.role })
  }

  async function handleSave() {
    if (!form.prenom || !form.nom || !form.email) return
    startTransition(async () => {
      if (editId) {
        await updateContact(editId, form)
        setContacts(prev => prev.map(c => c.id === editId ? { ...c, ...form } : c))
        setEditId(null)
      } else {
        const created = await createContact(form)
        setContacts(prev => [...prev, created])
        setShowForm(false)
      }
      setForm(EMPTY_FORM)
    })
  }

  async function handleDelete(contactId: string) {
    if (!confirm('Supprimer ce contact ? Les actions qui lui sont assignées perdront leur responsable.')) return
    startTransition(async () => {
      await deleteContact(contactId)
      setContacts(prev => prev.filter(c => c.id !== contactId))
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Ces personnes peuvent être assignées comme responsables d&apos;une action et recevoir des rappels par email.
        </p>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM) }}
          className="bg-brand-navy text-brand-cream text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-navy/90 transition-colors"
        >
          + Ajouter un contact
        </button>
      </div>

      {/* Formulaire ajout / édition */}
      {(showForm || editId) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-sm font-semibold text-brand-navy mb-3">
            {editId ? 'Modifier le contact' : 'Nouveau contact'}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Prénom</label>
              <input
                value={form.prenom}
                onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Jean"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Nom</label>
              <input
                value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Dupont"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs text-gray-500 font-medium block mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="jean.dupont@entreprise.fr"
            />
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-500 font-medium block mb-1">Rôle</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as Contact['role'] }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {Object.entries(ROLES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isPending || !form.prenom || !form.nom || !form.email}
              className="flex-1 bg-brand-navy text-brand-cream text-sm font-medium py-2 rounded-lg hover:bg-brand-navy/90 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM) }}
              className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {contacts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">
            Aucun contact. Ajoutez des personnes pour les assigner aux actions.
          </p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rôle</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Rappels</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c, i) => (
                <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-3 font-semibold text-brand-navy">{c.prenom} {c.nom}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[c.role]}`}>
                      {ROLES[c.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {/* Toggle Apple-style */}
                    <button
                      onClick={() => handleToggleRappels(c.id, c.rappels_actifs)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                        c.rappels_actifs ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      title={c.rappels_actifs ? 'Rappels actifs — cliquer pour désactiver' : 'Rappels désactivés — cliquer pour activer'}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          c.rappels_actifs ? 'translate-x-4' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => startEdit(c)}
                        className="text-gray-400 hover:text-brand-navy transition-colors"
                        title="Modifier"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Étape 2 : Commit**

```bash
git add src/app/dashboard/parametres/contacts/_components/liste-contacts.tsx
git commit -m "feat: composant ListeContacts avec toggles Apple-style"
```

---

## Task 4 — Page Paramètres/Contacts

**Files:**
- Create: `src/app/dashboard/parametres/contacts/page.tsx`
- Modify: `src/app/dashboard/parametres/page.tsx`

- [ ] **Étape 1 : Créer la page contacts**

```typescript
import { getContacts } from './_actions'
import { ListeContacts } from './_components/liste-contacts'

export const metadata = { title: 'Contacts — SafeAnalyse.' }

export default async function ContactsPage() {
  const contacts = await getContacts()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contacts de l&apos;entreprise</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gérez les personnes pouvant être assignées comme responsables d&apos;actions préventives.
        </p>
      </div>
      <ListeContacts contacts={contacts} />
    </div>
  )
}
```

- [ ] **Étape 2 : Ajouter un lien "Contacts" dans la page Paramètres existante**

Dans `src/app/dashboard/parametres/page.tsx`, ajoute ce bloc juste avant le `</div>` final (après le bloc "Entreprise") :

```typescript
      {/* Contacts */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Contacts de l&apos;entreprise</h2>
            <p className="text-sm text-gray-500 mt-0.5">Responsables d&apos;actions, destinataires des rappels email.</p>
          </div>
          <a
            href="/dashboard/parametres/contacts"
            className="text-sm font-medium text-brand-navy hover:underline"
          >
            Gérer →
          </a>
        </div>
      </div>
```

- [ ] **Étape 3 : Vérifier que la page `/dashboard/parametres/contacts` s'affiche correctement (tableau vide au premier lancement)**

```bash
npm run dev
# Ouvrir http://localhost:3000/dashboard/parametres/contacts
```

- [ ] **Étape 4 : Commit**

```bash
git add src/app/dashboard/parametres/contacts/page.tsx src/app/dashboard/parametres/page.tsx
git commit -m "feat: page Settings → Contacts entreprise"
```

---

## Task 5 — Server Actions plan-action

**Files:**
- Create: `src/app/dashboard/plan-action/_actions.ts`

- [ ] **Étape 1 : Créer les actions**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { Contact } from '../parametres/contacts/_actions'

async function getClientAndEntreprise() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: entreprise } = await supabase
    .from('entreprises').select('id').eq('user_id', user.id).single()
  if (!entreprise) redirect('/dashboard/onboarding')
  return { supabase, entrepriseId: entreprise.id }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ActionPlan {
  id: string
  evaluation_id: string
  contact_id: string | null
  description: string | null
  type_prevention: 'technique' | 'organisationnelle' | 'formation_epi' | null
  facilite: 'facile' | 'moyen' | 'complexe' | null
  echeance: string | null
  statut: 'a_faire' | 'en_cours' | 'termine'
  rappels_actifs: boolean
  coefficient_pm_cible: number | null
  criticite_cible: number | null
  commentaire: string | null
  date_realisation: string | null
}

export interface EvaluationAvecAction {
  // Données APR (lecture seule)
  id: string
  danger: string
  criticite_brute: number | null
  type_risque: string
  poste_nom: string
  operation_nom: string
  mesures_existantes: string | null
  criticite_residuelle: number | null
  // Action liée (peut être null si pas encore créée)
  action: ActionPlan | null
  // Contact assigné
  contact: Contact | null
}

// ─── Lecture ─────────────────────────────────────────────────────────────────

export async function getEvaluationsAiguesAvecActions(): Promise<EvaluationAvecAction[]> {
  // RLS sur evaluations filtre automatiquement par user_id → pas besoin de filtre explicite entreprise_id
  const { supabase } = await getClientAndEntreprise()

  const { data } = await supabase
    .from('evaluations')
    .select(`
      id,
      danger,
      criticite_brute,
      type_risque,
      mesures_existantes,
      operations!inner (
        nom,
        postes!inner (
          nom
        )
      ),
      plans_maitrise (
        criticite_residuelle
      ),
      actions_plan (
        id,
        contact_id,
        description,
        type_prevention,
        facilite,
        echeance,
        statut,
        rappels_actifs,
        coefficient_pm_cible,
        criticite_cible,
        commentaire,
        date_realisation,
        contacts_entreprise:contact_id (
          id, prenom, nom, email, role, rappels_actifs
        )
      )
    `)
    .eq('type_risque', 'aigu')
    .order('criticite_brute', { ascending: false })

  if (!data) return []

  return data.map((ev: any) => {
    const action = ev.actions_plan?.[0] ?? null
    return {
      id: ev.id,
      danger: ev.danger,
      criticite_brute: ev.criticite_brute,
      type_risque: ev.type_risque,
      poste_nom: ev.operations?.postes?.nom ?? '',
      operation_nom: ev.operations?.nom ?? '',
      mesures_existantes: ev.mesures_existantes ?? null,
      criticite_residuelle: ev.plans_maitrise?.[0]?.criticite_residuelle ?? null,
      action: action
        ? {
            id: action.id,
            evaluation_id: ev.id,
            contact_id: action.contact_id,
            description: action.description,
            type_prevention: action.type_prevention,
            facilite: action.facilite,
            echeance: action.echeance,
            statut: action.statut,
            rappels_actifs: action.rappels_actifs,
            coefficient_pm_cible: action.coefficient_pm_cible,
            criticite_cible: action.criticite_cible,
            commentaire: action.commentaire,
            date_realisation: action.date_realisation,
          }
        : null,
      contact: action?.contacts_entreprise ?? null,
    }
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function upsertAction(payload: {
  evaluationId: string
  actionId?: string
  champ: keyof Omit<ActionPlan, 'id' | 'evaluation_id'>
  valeur: string | number | boolean | null
}): Promise<{ actionId: string }> {
  const { supabase } = await getClientAndEntreprise()

  // Calculer criticite_cible si on change le coefficient_pm_cible
  let extraFields: Record<string, unknown> = {}
  if (payload.champ === 'coefficient_pm_cible' && typeof payload.valeur === 'number') {
    // On a besoin de la criticite_brute — on la récupère
    const { data: ev } = await supabase
      .from('evaluations')
      .select('criticite_brute')
      .eq('id', payload.evaluationId)
      .single()
    if (ev?.criticite_brute != null) {
      extraFields.criticite_cible = +(ev.criticite_brute * (1 - payload.valeur)).toFixed(1)
    }
  }

  if (payload.actionId) {
    // Update
    await supabase
      .from('actions_plan')
      .update({ [payload.champ]: payload.valeur, ...extraFields })
      .eq('id', payload.actionId)
    revalidatePath('/dashboard/plan-action')
    return { actionId: payload.actionId }
  } else {
    // Insert
    const { data, error } = await supabase
      .from('actions_plan')
      .insert({ evaluation_id: payload.evaluationId, [payload.champ]: payload.valeur, ...extraFields })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/plan-action')
    return { actionId: data.id }
  }
}

export async function terminerAction(actionId: string, evaluationId: string, coefficientPmCible: number): Promise<void> {
  const { supabase } = await getClientAndEntreprise()

  // 1. Marquer l'action comme terminée (le trigger DB set_date_realisation s'occupe de date_realisation)
  await supabase
    .from('actions_plan')
    .update({ statut: 'termine' })
    .eq('id', actionId)

  // 2. Mettre à jour le PM dans plans_maitrise
  const { data: pm } = await supabase
    .from('plans_maitrise')
    .select('id, criticite_residuelle')
    .eq('evaluation_id', evaluationId)
    .single()

  if (pm) {
    const { data: ev } = await supabase
      .from('evaluations')
      .select('criticite_brute')
      .eq('id', evaluationId)
      .single()
    const nouvelleCriticite = ev?.criticite_brute != null
      ? +(ev.criticite_brute * (1 - coefficientPmCible)).toFixed(1)
      : pm.criticite_residuelle

    await supabase
      .from('plans_maitrise')
      .update({ coefficient_pm: coefficientPmCible, criticite_residuelle: nouvelleCriticite })
      .eq('id', pm.id)
  }

  revalidatePath('/dashboard/plan-action')
  revalidatePath('/dashboard/apr')
  revalidatePath('/dashboard/postes')
}

export async function toggleRappelsAction(actionId: string, actif: boolean): Promise<void> {
  const { supabase } = await getClientAndEntreprise()
  await supabase.from('actions_plan').update({ rappels_actifs: actif }).eq('id', actionId)
  revalidatePath('/dashboard/plan-action')
}
```

- [ ] **Étape 2 : Commit**

```bash
git add src/app/dashboard/plan-action/_actions.ts
git commit -m "feat: server actions plan-action (upsert, terminer, rappels)"
```

---

## Task 6 — Composant DropdownResponsable

**Files:**
- Create: `src/app/dashboard/plan-action/_components/dropdown-responsable.tsx`

- [ ] **Étape 1 : Créer le composant**

```typescript
'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { createContact, type Contact } from '../../parametres/contacts/_actions'

const ROLES: Record<Contact['role'], string> = {
  dirigeant: 'Dirigeant',
  chef_equipe: "Chef d'équipe",
  rrh: 'RRH',
  responsable_hse: 'Resp. HSE',
  autre: 'Autre',
}

interface Props {
  contacts: Contact[]
  selectedId: string | null
  onChange: (contactId: string | null, newContact?: Contact) => void
  disabled?: boolean
}

export function DropdownResponsable({ contacts: initialContacts, selectedId, onChange, disabled }: Props) {
  const [contacts, setContacts] = useState(initialContacts)
  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', role: 'autre' as Contact['role'] })
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  const selected = contacts.find(c => c.id === selectedId)

  // Fermer si clic à l'extérieur
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setShowForm(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(contactId: string | null) {
    onChange(contactId)
    setOpen(false)
  }

  function handleCreateContact() {
    if (!form.prenom || !form.nom || !form.email) return
    startTransition(async () => {
      const newContact = await createContact(form as { prenom: string; nom: string; email: string; role: Contact['role'] })
      setContacts(prev => [...prev, newContact])
      onChange(newContact.id, newContact)
      setShowForm(false)
      setOpen(false)
      setForm({ prenom: '', nom: '', email: '', role: 'autre' })
    })
  }

  if (disabled) {
    return (
      <span className="text-sm text-gray-500">
        {selected ? `${selected.prenom} ${selected.nom}` : '—'}
      </span>
    )
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-1">
        <button
          onClick={() => { setOpen(!open); setShowForm(false) }}
          className="flex-1 flex items-center gap-1.5 border border-gray-200 rounded-md px-2 py-1 text-sm bg-white hover:border-blue-300 transition-colors text-left min-w-0"
        >
          <span className="text-gray-400 text-xs">👤</span>
          <span className="truncate text-gray-700">
            {selected ? `${selected.prenom} ${selected.nom}` : 'Assigner…'}
          </span>
          <span className="ml-auto text-gray-400 text-xs shrink-0">▾</span>
        </button>
        <button
          onClick={() => { setShowForm(!showForm); setOpen(false) }}
          className="w-6 h-6 rounded-md border border-dashed border-blue-300 bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center text-sm font-bold shrink-0 transition-colors"
          title="Ajouter un nouveau contact"
        >
          +
        </button>
      </div>

      {/* Dropdown contacts */}
      {open && !showForm && (
        <div className="absolute z-20 top-full left-0 mt-1 w-56 bg-white border border-blue-100 rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={() => handleSelect(null)}
            className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 border-b border-gray-100"
          >
            — Non assigné
          </button>
          {contacts.map(c => (
            <button
              key={c.id}
              onClick={() => handleSelect(c.id)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 hover:bg-blue-50 transition-colors ${
                c.id === selectedId ? 'bg-blue-50 font-semibold text-brand-navy' : 'text-gray-700'
              }`}
            >
              <span>{c.prenom} {c.nom}</span>
              <span className="text-xs text-gray-400 shrink-0">{ROLES[c.role]}</span>
            </button>
          ))}
          <button
            onClick={() => { setShowForm(true); setOpen(false) }}
            className="w-full text-left px-3 py-2 text-sm text-blue-600 font-semibold border-t border-dashed border-gray-100 hover:bg-blue-50 flex items-center gap-1"
          >
            ＋ Ajouter une personne…
          </button>
        </div>
      )}

      {/* Mini-formulaire */}
      {showForm && (
        <div className="absolute z-20 top-full left-0 mt-1 w-72 bg-white border border-blue-200 rounded-lg shadow-lg p-3">
          <div className="text-xs font-semibold text-brand-navy mb-2">Nouveau contact</div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              value={form.prenom}
              onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
              placeholder="Prénom"
              className="border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
            <input
              value={form.nom}
              onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
              placeholder="Nom"
              className="border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
          </div>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="email@entreprise.fr"
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs mb-2 focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
          <select
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value as Contact['role'] }))}
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs mb-3 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
          >
            {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleCreateContact}
              disabled={isPending || !form.prenom || !form.nom || !form.email}
              className="flex-1 bg-brand-navy text-brand-cream text-xs font-semibold py-1.5 rounded hover:bg-brand-navy/90 disabled:opacity-50"
            >
              {isPending ? 'Enreg…' : 'Enregistrer'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 border border-gray-200 text-gray-500 text-xs py-1.5 rounded hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">💾 Sauvegardé dans Paramètres → Contacts</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Étape 2 : Commit**

```bash
git add src/app/dashboard/plan-action/_components/dropdown-responsable.tsx
git commit -m "feat: composant DropdownResponsable avec mini-formulaire inline"
```

---

## Task 7 — Composant FiltreBarre + ColonnesVisibilite

**Files:**
- Create: `src/app/dashboard/plan-action/_components/filtre-colonnes.tsx`

- [ ] **Étape 1 : Créer le composant**

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'

export interface Filtres {
  poste: string
  statut: string
  type_prevention: string
  facilite: string
  afficher_verts: boolean
}

export const FILTRES_DEFAUT: Filtres = {
  poste: '',
  statut: '',
  type_prevention: '',
  facilite: '',
  afficher_verts: false,
}

export type ColonneId =
  | 'mesures_existantes'
  | 'type_prevention'
  | 'facilite'
  | 'responsable'
  | 'echeance'
  | 'rappels'
  | 'criticite_cible'

export interface ColonnesVisibles {
  mesures_existantes: boolean
  type_prevention: boolean
  facilite: boolean
  responsable: boolean
  echeance: boolean
  rappels: boolean
  criticite_cible: boolean
}

export const COLONNES_DEFAUT: ColonnesVisibles = {
  mesures_existantes: false,
  type_prevention: true,
  facilite: true,
  responsable: true,
  echeance: true,
  rappels: true,
  criticite_cible: true,
}

const COLONNES_LABELS: Record<ColonneId, string> = {
  mesures_existantes: 'Mesures existantes',
  type_prevention: 'Type PGP',
  facilite: 'Facilité',
  responsable: 'Responsable',
  echeance: 'Échéance',
  rappels: '🔔 Rappels',
  criticite_cible: 'C. cible',
}

const STORAGE_KEY = 'plan-action-columns'

interface Props {
  postes: string[]
  filtres: Filtres
  onFiltresChange: (f: Filtres) => void
  colonnes: ColonnesVisibles
  onColonnesChange: (c: ColonnesVisibles) => void
}

export function FiltreBarre({ postes, filtres, onFiltresChange, colonnes, onColonnesChange }: Props) {
  const [showColonnes, setShowColonnes] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Charger depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) onColonnesChange(JSON.parse(saved))
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sauvegarder dans localStorage
  function handleColonneToggle(key: ColonneId) {
    const next = { ...colonnes, [key]: !colonnes[key] }
    onColonnesChange(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }

  // Fermer le popover en cliquant dehors
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowColonnes(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-amber-800 font-medium">Filtrer :</span>

      {/* Poste */}
      <select
        value={filtres.poste}
        onChange={e => onFiltresChange({ ...filtres, poste: e.target.value })}
        className="text-xs border border-amber-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-300"
      >
        <option value="">Tous les postes</option>
        {postes.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      {/* Statut */}
      <select
        value={filtres.statut}
        onChange={e => onFiltresChange({ ...filtres, statut: e.target.value })}
        className="text-xs border border-amber-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-300"
      >
        <option value="">Tous les statuts</option>
        <option value="a_faire">À faire</option>
        <option value="en_cours">En cours</option>
        <option value="termine">Terminé</option>
      </select>

      {/* Type PGP */}
      <select
        value={filtres.type_prevention}
        onChange={e => onFiltresChange({ ...filtres, type_prevention: e.target.value })}
        className="text-xs border border-amber-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-300"
      >
        <option value="">Tous les types</option>
        <option value="technique">🔧 Technique</option>
        <option value="organisationnelle">📋 Organisationnelle</option>
        <option value="formation_epi">🎓 Formation / EPI</option>
      </select>

      {/* Facilité */}
      <select
        value={filtres.facilite}
        onChange={e => onFiltresChange({ ...filtres, facilite: e.target.value })}
        className="text-xs border border-amber-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-300"
      >
        <option value="">Toutes facilités</option>
        <option value="facile">Facile</option>
        <option value="moyen">Moyen</option>
        <option value="complexe">Complexe</option>
      </select>

      {/* Risques verts */}
      <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer ml-1">
        <input
          type="checkbox"
          checked={filtres.afficher_verts}
          onChange={e => onFiltresChange({ ...filtres, afficher_verts: e.target.checked })}
          className="rounded border-gray-300 text-blue-500"
        />
        Afficher risques maîtrisés (verts)
      </label>

      {/* Bouton Colonnes */}
      <div ref={popoverRef} className="relative ml-auto">
        <button
          onClick={() => setShowColonnes(!showColonnes)}
          className="flex items-center gap-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-600 hover:border-gray-300 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          Colonnes ▾
        </button>

        {showColonnes && (
          <div className="absolute right-0 top-full mt-1 z-20 w-52 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">Afficher / masquer</div>
            {(Object.keys(COLONNES_LABELS) as ColonneId[]).map(key => (
              <label key={key} className="flex items-center gap-2 py-1 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={colonnes[key]}
                  onChange={() => handleColonneToggle(key)}
                  className="rounded border-gray-300 text-blue-500"
                />
                <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">
                  {COLONNES_LABELS[key]}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Étape 2 : Commit**

```bash
git add src/app/dashboard/plan-action/_components/filtre-colonnes.tsx
git commit -m "feat: composant FiltreBarre + gestion visibilité colonnes (localStorage)"
```

---

## Task 8 — Composant TableauPlanAction

**Files:**
- Create: `src/app/dashboard/plan-action/_components/tableau-plan-action.tsx`

- [ ] **Étape 1 : Créer le composant**

```typescript
'use client'

import { useState, useTransition } from 'react'
import {
  upsertAction,
  terminerAction,
  toggleRappelsAction,
  type EvaluationAvecAction,
  type ActionPlan,
} from '../_actions'
import { DropdownResponsable } from './dropdown-responsable'
import {
  FiltreBarre,
  FILTRES_DEFAUT,
  COLONNES_DEFAUT,
  type Filtres,
  type ColonnesVisibles,
} from './filtre-colonnes'
import type { Contact } from '../../parametres/contacts/_actions'

// ─── Helpers d'affichage ──────────────────────────────────────────────────────

function BadgeCriticite({ valeur }: { valeur: number | null }) {
  if (valeur == null) return <span className="text-gray-300 text-xs">—</span>
  const [bg, text] =
    valeur >= 15 ? ['bg-red-100 text-red-700', 'rouge'] :
    valeur >= 10 ? ['bg-orange-100 text-orange-700', 'orange'] :
    valeur >= 5  ? ['bg-yellow-100 text-yellow-700', 'jaune'] :
                   ['bg-green-100 text-green-700', 'vert']
  void text
  return (
    <span className={`${bg} font-bold text-sm px-2 py-0.5 rounded-full`}>{valeur}</span>
  )
}

const STATUT_LABELS: Record<ActionPlan['statut'], string> = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  termine: 'Terminé ✓',
}

const STATUT_COLORS: Record<ActionPlan['statut'], string> = {
  a_faire: 'bg-yellow-100 text-yellow-700',
  en_cours: 'bg-blue-100 text-blue-700',
  termine: 'bg-green-100 text-green-700',
}

const PGP_LABELS: Record<string, string> = {
  technique: '🔧 Technique',
  organisationnelle: '📋 Orga.',
  formation_epi: '🎓 Formation/EPI',
}

const FACILITE_COLORS: Record<string, string> = {
  facile: 'bg-green-100 text-green-700',
  moyen: 'bg-yellow-100 text-yellow-700',
  complexe: 'bg-red-100 text-red-700',
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  evaluations: EvaluationAvecAction[]
  contacts: Contact[]
  onglet: 'priorites' | 'par_poste'
}

export function TableauPlanAction({ evaluations, contacts, onglet }: Props) {
  const [rows, setRows] = useState(evaluations)
  const [filtres, setFiltres] = useState<Filtres>(FILTRES_DEFAUT)
  const [colonnes, setColonnes] = useState<ColonnesVisibles>(COLONNES_DEFAUT)
  const [isPending, startTransition] = useTransition()

  // ── Filtrage ────────────────────────────────────────────────────────────────
  const postes = [...new Set(rows.map(r => r.poste_nom))].sort()

  const filtered = rows.filter(row => {
    const crit = row.criticite_residuelle ?? row.criticite_brute ?? 0
    if (!filtres.afficher_verts && crit <= 4) return false
    if (filtres.poste && row.poste_nom !== filtres.poste) return false
    if (filtres.statut && (row.action?.statut ?? 'a_faire') !== filtres.statut) return false
    if (filtres.type_prevention && row.action?.type_prevention !== filtres.type_prevention) return false
    if (filtres.facilite && row.action?.facilite !== filtres.facilite) return false
    return true
  })

  // ── Groupement par poste (onglet "Par poste") ───────────────────────────────
  const grouped = onglet === 'par_poste'
    ? filtered.reduce<Record<string, EvaluationAvecAction[]>>((acc, row) => {
        (acc[row.poste_nom] ??= []).push(row)
        return acc
      }, {})
    : null

  // ── Mutation helper ─────────────────────────────────────────────────────────
  function updateRowAction(evalId: string, patch: Partial<ActionPlan>) {
    setRows(prev => prev.map(r => {
      if (r.id !== evalId) return r
      return { ...r, action: r.action ? { ...r.action, ...patch } : { id: '', evaluation_id: evalId, contact_id: null, description: null, type_prevention: null, facilite: null, echeance: null, statut: 'a_faire', rappels_actifs: true, coefficient_pm_cible: null, criticite_cible: null, commentaire: null, date_realisation: null, ...patch } }
    }))
  }

  function handleCellBlur(
    evalId: string,
    actionId: string | undefined,
    champ: keyof Omit<ActionPlan, 'id' | 'evaluation_id'>,
    valeur: string | number | boolean | null
  ) {
    startTransition(async () => {
      const result = await upsertAction({ evaluationId: evalId, actionId, champ, valeur })
      updateRowAction(evalId, { id: result.actionId, [champ]: valeur })
    })
  }

  async function handleStatutChange(row: EvaluationAvecAction, newStatut: ActionPlan['statut']) {
    const action = row.action
    updateRowAction(row.id, { statut: newStatut })

    if (newStatut === 'termine' && action?.coefficient_pm_cible != null) {
      startTransition(async () => {
        await terminerAction(action.id, row.id, action.coefficient_pm_cible!)
      })
    } else {
      handleCellBlur(row.id, action?.id, 'statut', newStatut)
    }
  }

  function handleToggleRappels(row: EvaluationAvecAction) {
    const newVal = !(row.action?.rappels_actifs ?? true)
    updateRowAction(row.id, { rappels_actifs: newVal })
    if (row.action?.id) {
      startTransition(async () => { await toggleRappelsAction(row.action!.id, newVal) })
    }
  }

  // ── Rendu d'une ligne ────────────────────────────────────────────────────────
  function renderRow(row: EvaluationAvecAction) {
    const action = row.action
    const statut: ActionPlan['statut'] = action?.statut ?? 'a_faire'
    const rappelsActifs = action?.rappels_actifs ?? true

    return (
      <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
        {/* Poste · Opération */}
        <td className="px-3 py-2 text-sm whitespace-nowrap">
          <span className="font-semibold text-brand-navy">{row.poste_nom}</span>
          <span className="text-gray-400 text-xs block">{row.operation_nom}</span>
        </td>
        {/* Danger */}
        <td className="px-3 py-2 text-sm text-gray-700">{row.danger}</td>
        {/* C. résid. */}
        <td className="px-3 py-2 text-center">
          <BadgeCriticite valeur={row.criticite_residuelle ?? row.criticite_brute} />
        </td>
        {/* Mesures existantes */}
        {colonnes.mesures_existantes && (
          <td className="px-3 py-2 text-xs text-gray-500 max-w-[120px] truncate border-r-2 border-blue-100">
            {row.mesures_existantes || <span className="text-gray-300 italic">Aucune</span>}
          </td>
        )}
        {/* Description */}
        <td className="px-2 py-1 min-w-[160px] bg-blue-50/30">
          <input
            defaultValue={action?.description ?? ''}
            placeholder="Cliquer pour saisir…"
            onBlur={e => handleCellBlur(row.id, action?.id, 'description', e.target.value || null)}
            className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-300 placeholder:italic focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1 py-0.5"
          />
        </td>
        {/* Type PGP */}
        {colonnes.type_prevention && (
          <td className="px-2 py-1 bg-blue-50/30">
            <select
              defaultValue={action?.type_prevention ?? ''}
              onBlur={e => handleCellBlur(row.id, action?.id, 'type_prevention', e.target.value || null)}
              className="text-xs bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-300 rounded w-full text-gray-600"
            >
              <option value="">—</option>
              {Object.entries(PGP_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </td>
        )}
        {/* Facilité */}
        {colonnes.facilite && (
          <td className="px-2 py-1 text-center bg-blue-50/30">
            <select
              defaultValue={action?.facilite ?? ''}
              onBlur={e => handleCellBlur(row.id, action?.id, 'facilite', e.target.value || null)}
              className="text-xs bg-transparent border-none focus:outline-none w-full text-center"
            >
              <option value="">—</option>
              <option value="facile">Facile</option>
              <option value="moyen">Moyen</option>
              <option value="complexe">Complexe</option>
            </select>
          </td>
        )}
        {/* Responsable */}
        {colonnes.responsable && (
          <td className="px-2 py-1 bg-blue-50/30 min-w-[160px]">
            <DropdownResponsable
              contacts={contacts}
              selectedId={action?.contact_id ?? null}
              onChange={(contactId, newContact) => {
                updateRowAction(row.id, { contact_id: contactId })
                handleCellBlur(row.id, action?.id, 'contact_id', contactId)
                if (newContact) {
                  // Le nouveau contact est déjà créé en DB via createContact
                }
              }}
            />
          </td>
        )}
        {/* Échéance */}
        {colonnes.echeance && (
          <td className="px-2 py-1 bg-blue-50/30">
            <input
              type="date"
              defaultValue={action?.echeance ?? ''}
              onBlur={e => handleCellBlur(row.id, action?.id, 'echeance', e.target.value || null)}
              className="text-xs bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-300 rounded w-full"
            />
          </td>
        )}
        {/* Statut */}
        <td className="px-2 py-1 bg-blue-50/30">
          <select
            value={statut}
            onChange={e => handleStatutChange(row, e.target.value as ActionPlan['statut'])}
            className={`text-xs font-semibold rounded-full px-2 py-0.5 border-none focus:outline-none cursor-pointer ${STATUT_COLORS[statut]}`}
          >
            {Object.entries(STATUT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </td>
        {/* 🔔 Rappels */}
        {colonnes.rappels && (
          <td className="px-2 py-1 text-center bg-blue-50/30">
            <button
              onClick={() => handleToggleRappels(row)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                rappelsActifs ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                rappelsActifs ? 'translate-x-4' : 'translate-x-1'
              }`} />
            </button>
          </td>
        )}
        {/* C. cible */}
        {colonnes.criticite_cible && (
          <td className="px-3 py-2 text-center bg-green-50/40">
            <BadgeCriticite valeur={action?.criticite_cible ?? null} />
          </td>
        )}
      </tr>
    )
  }

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const kpiAFaire = rows.filter(r => (r.action?.statut ?? 'a_faire') === 'a_faire').length
  const kpiEnCours = rows.filter(r => r.action?.statut === 'en_cours').length
  const kpiTermine = rows.filter(r => r.action?.statut === 'termine').length

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-white border border-amber-100 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
          <div className="text-2xl font-extrabold text-red-600">{kpiAFaire}</div>
          <div className="text-xs text-amber-700 uppercase tracking-wide font-medium">À faire</div>
        </div>
        <div className="bg-white border border-amber-100 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
          <div className="text-2xl font-extrabold text-orange-500">{kpiEnCours}</div>
          <div className="text-xs text-amber-700 uppercase tracking-wide font-medium">En cours</div>
        </div>
        <div className="bg-white border border-amber-100 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
          <div className="text-2xl font-extrabold text-green-600">{kpiTermine}</div>
          <div className="text-xs text-amber-700 uppercase tracking-wide font-medium">Terminé</div>
        </div>
        {isPending && (
          <span className="text-xs text-gray-400 animate-pulse ml-2">Enregistrement…</span>
        )}
      </div>

      {/* Filtres */}
      <FiltreBarre
        postes={postes}
        filtres={filtres}
        onFiltresChange={setFiltres}
        colonnes={colonnes}
        onColonnesChange={setColonnes}
      />

      {/* Tableau */}
      <div className="overflow-x-auto rounded-xl border border-amber-100 bg-white">
        <table className="border-collapse w-full min-w-[700px]">
          <thead>
            <tr>
              {/* Super-headers */}
              <th colSpan={3 + (colonnes.mesures_existantes ? 1 : 0)}
                className="py-2 px-3 bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-400 text-center uppercase tracking-wide border-r-2 border-blue-100">
                ← Depuis l&apos;APR (lecture seule)
              </th>
              <th colSpan={
                  1 + // description
                  (colonnes.type_prevention ? 1 : 0) +
                  (colonnes.facilite ? 1 : 0) +
                  (colonnes.responsable ? 1 : 0) +
                  (colonnes.echeance ? 1 : 0) +
                  1 + // statut
                  (colonnes.rappels ? 1 : 0)
                }
                className="py-2 px-3 bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-600 text-center uppercase tracking-wide">
                Action corrective ✏️
              </th>
              {colonnes.criticite_cible && (
                <th className="py-2 px-3 bg-green-50 border border-green-100 text-xs font-semibold text-green-600 text-center uppercase tracking-wide">
                  Résultat
                </th>
              )}
            </tr>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Poste · Opération</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Danger</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">C. résid.</th>
              {colonnes.mesures_existantes && <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-r-2 border-blue-100 whitespace-nowrap">Mesures exist.</th>}
              <th className="px-3 py-2 text-left text-xs font-semibold text-blue-500 bg-blue-50/30 min-w-[160px]">Description</th>
              {colonnes.type_prevention && <th className="px-3 py-2 text-center text-xs font-semibold text-blue-500 bg-blue-50/30 whitespace-nowrap">Type PGP</th>}
              {colonnes.facilite && <th className="px-3 py-2 text-center text-xs font-semibold text-blue-500 bg-blue-50/30">Facilité</th>}
              {colonnes.responsable && <th className="px-3 py-2 text-left text-xs font-semibold text-blue-500 bg-blue-50/30 min-w-[150px]">Responsable</th>}
              {colonnes.echeance && <th className="px-3 py-2 text-center text-xs font-semibold text-blue-500 bg-blue-50/30 whitespace-nowrap">Échéance</th>}
              <th className="px-3 py-2 text-center text-xs font-semibold text-blue-500 bg-blue-50/30">Statut</th>
              {colonnes.rappels && <th className="px-3 py-2 text-center text-xs font-semibold text-blue-500 bg-blue-50/30">🔔</th>}
              {colonnes.criticite_cible && <th className="px-3 py-2 text-center text-xs font-semibold text-green-600 bg-green-50/40 whitespace-nowrap">C. cible</th>}
            </tr>
          </thead>
          <tbody>
            {onglet === 'par_poste' && grouped
              ? Object.entries(grouped).map(([poste, rows]) => (
                  <>
                    <tr key={`group-${poste}`} className="bg-brand-navy/5">
                      <td colSpan={99} className="px-3 py-1.5 text-xs font-bold text-brand-navy uppercase tracking-wide">
                        🏭 {poste} — {rows.length} action{rows.length > 1 ? 's' : ''}
                      </td>
                    </tr>
                    {rows.map(renderRow)}
                  </>
                ))
              : filtered.length === 0
                ? (
                  <tr>
                    <td colSpan={99} className="px-6 py-12 text-center text-sm text-gray-400">
                      Aucune action à afficher. Décochez les filtres ou activez l&apos;affichage des risques verts.
                    </td>
                  </tr>
                )
                : filtered.map(renderRow)
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Étape 2 : Commit**

```bash
git add src/app/dashboard/plan-action/_components/tableau-plan-action.tsx
git commit -m "feat: composant TableauPlanAction avec édition inline + filtres + toggles"
```

---

## Task 9 — Page Plan d'action

**Files:**
- Create: `src/app/dashboard/plan-action/page.tsx`

- [ ] **Étape 1 : Créer la page**

```typescript
import { getEvaluationsAiguesAvecActions } from './_actions'
import { getContacts } from '../parametres/contacts/_actions'
import { TableauPlanAction } from './_components/tableau-plan-action'

export const metadata = { title: 'Plan d\'action — SafeAnalyse.' }

export default async function PlanActionPage({
  searchParams,
}: {
  searchParams: Promise<{ onglet?: string }>
}) {
  const { onglet: ongletParam } = await searchParams
  const onglet = ongletParam === 'par_poste' ? 'par_poste' : 'priorites'

  const [evaluations, contacts] = await Promise.all([
    getEvaluationsAiguesAvecActions(),
    getContacts(),
  ])

  return (
    <div className="space-y-6">
      {/* En-tête + onglets */}
      <div className="border-b border-amber-100 pb-0">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Plan d&apos;action</h1>
            <p className="text-sm text-amber-800 mt-1">Risques aigus — actions correctives à planifier et suivre</p>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-0">
          <a
            href="/dashboard/plan-action?onglet=priorites"
            className={`px-5 py-2 text-sm font-semibold border-b-2 transition-colors ${
              onglet === 'priorites'
                ? 'text-brand-navy border-brand-navy'
                : 'text-amber-700 border-transparent hover:text-brand-navy'
            }`}
          >
            🔴 Priorités
          </a>
          <a
            href="/dashboard/plan-action?onglet=par_poste"
            className={`px-5 py-2 text-sm font-semibold border-b-2 transition-colors ${
              onglet === 'par_poste'
                ? 'text-brand-navy border-brand-navy'
                : 'text-amber-700 border-transparent hover:text-brand-navy'
            }`}
          >
            🏭 Par poste
          </a>
        </div>
      </div>

      <TableauPlanAction
        evaluations={evaluations}
        contacts={contacts}
        onglet={onglet}
      />
    </div>
  )
}
```

- [ ] **Étape 2 : Tester manuellement**

```bash
npm run dev
# Ouvrir http://localhost:3000/dashboard/plan-action
# Vérifier : tableau s'affiche, filtres fonctionnent, toggle colonnes persiste au rechargement
```

- [ ] **Étape 3 : Commit**

```bash
git add src/app/dashboard/plan-action/page.tsx
git commit -m "feat: page /dashboard/plan-action avec onglets Priorités / Par poste"
```

---

## Task 10 — Sidebar + Navigation

**Files:**
- Modify: `src/components/dashboard/sidebar.tsx`

- [ ] **Étape 1 : Ajouter l'item "Plan d'action" dans le tableau `navigation`**

Dans `src/components/dashboard/sidebar.tsx`, dans le tableau `navigation`, **après** l'item `Module Bruit` et **avant** `Paramètres`, ajouter :

```typescript
  {
    label: 'Plan d\'action',
    href: '/dashboard/plan-action',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
```

- [ ] **Étape 2 : Vérifier l'affichage en mode collapsé et étendu**

```bash
npm run dev
# Vérifier sidebar en mode étendu (icône + label) et collapsé (icône seule + tooltip)
```

- [ ] **Étape 3 : Commit**

```bash
git add src/components/dashboard/sidebar.tsx
git commit -m "feat: ajouter Plan d'action dans la sidebar"
```

---

## Task 11 — Email Resend + template

**Files:**
- Create: `src/lib/email/reminders.ts`

- [ ] **Étape 1 : Installer Resend**

```bash
npm install resend
```

- [ ] **Étape 2 : Ajouter la variable d'environnement**

Dans `.env.local` (et dans Vercel Dashboard → Settings → Environment Variables) :

```
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXX
CRON_SECRET=un_secret_aleatoire_long
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

En production sur Vercel, `NEXT_PUBLIC_APP_URL` doit valoir `https://duerp-saas.vercel.app` (ou ton domaine custom).

Pour obtenir la clé Resend : https://resend.com → Dashboard → API Keys → Create API Key (scope : Sending access).

- [ ] **Étape 3 : Créer le module email**

Créer d'abord le dossier : `src/lib/email/`

```typescript
// src/lib/email/reminders.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export type TypeRappel = 'j_moins_7' | 'jour_j' | 'mensuel'

interface ParamsRappel {
  destinataire: { prenom: string; email: string }
  action: {
    description: string
    danger: string
    poste: string
    operation: string
    echeance: string
    criticite: number
  }
  type: TypeRappel
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function sujetEmail(type: TypeRappel, description: string): string {
  if (type === 'j_moins_7') return `SafeAnalyse. — Action dans 7 jours : ${description.slice(0, 50)}`
  if (type === 'jour_j') return `SafeAnalyse. — Échéance aujourd'hui : ${description.slice(0, 50)}`
  return `SafeAnalyse. — Rappel mensuel : ${description.slice(0, 50)}`
}

function corps(p: ParamsRappel): string {
  const { destinataire, action, type } = p
  const delaiMsg =
    type === 'j_moins_7' ? "dans <strong>7 jours</strong>" :
    type === 'jour_j' ? "<strong>aujourd'hui</strong>" :
    "dépassée — rappel mensuel"

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #374151;">
      <div style="background: #031948; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <div style="color: #f5eee1; font-size: 18px; font-weight: 700;">SafeAnalyse.</div>
      </div>
      <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="margin: 0 0 16px; font-size: 15px;">Bonjour <strong>${destinataire.prenom}</strong>,</p>
        <p style="margin: 0 0 16px; font-size: 14px; color: #374151;">
          L'action préventive ci-dessous arrive à échéance ${delaiMsg} :
        </p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
          <div style="font-weight: 600; color: #031948; margin-bottom: 8px; font-size: 14px;">"${action.description}"</div>
          <div style="font-size: 12px; color: #64748b; line-height: 1.8;">
            <div>📍 Poste : ${action.poste} — ${action.operation}</div>
            <div>⚠️ Danger : ${action.danger} — Criticité : ${action.criticite}</div>
            <div>📅 Échéance : ${formatDate(action.echeance)}</div>
          </div>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://duerp-saas.vercel.app'}/dashboard/plan-action"
           style="display: inline-block; background: #031948; color: #f5eee1; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">
          Voir le plan d'action →
        </a>
        <p style="margin: 20px 0 0; font-size: 11px; color: #94a3b8;">
          Vous recevez cet email car vous êtes responsable de cette action dans SafeAnalyse.
        </p>
      </div>
    </div>
  `
}

export async function envoyerRappel(params: ParamsRappel): Promise<void> {
  await resend.emails.send({
    from: 'SafeAnalyse. <rappels@safeanalyse.fr>',
    to: params.destinataire.email,
    subject: sujetEmail(params.type, params.action.description),
    html: corps(params),
  })
}
```

> **Note** : remplace `rappels@safeanalyse.fr` par un domaine que tu as vérifié dans Resend. En attendant le domaine custom, utilise `onboarding@resend.dev` pour les tests.

- [ ] **Étape 4 : Commit**

```bash
git add src/lib/email/reminders.ts package.json package-lock.json
git commit -m "feat: module email Resend pour rappels plan d'action"
```

---

## Task 12 — Route Cron `/api/cron/reminders`

**Files:**
- Create: `src/app/api/cron/reminders/route.ts`

- [ ] **Étape 1 : Créer la route**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { envoyerRappel, type TypeRappel } from '@/lib/email/reminders'

export async function GET(req: NextRequest) {
  // Sécurisation par header secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const j7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const todayDay = new Date().getDate()

  // Charger toutes les actions non terminées avec contact + évaluation + poste
  const { data: actions } = await supabase
    .from('actions_plan')
    .select(`
      id,
      description,
      echeance,
      statut,
      rappels_actifs,
      coefficient_pm_cible,
      evaluations!inner (
        danger,
        criticite_brute,
        operations!inner (
          nom,
          postes!inner (
            nom
          )
        )
      ),
      contacts_entreprise:contact_id (
        prenom,
        email,
        rappels_actifs
      )
    `)
    .neq('statut', 'termine')
    .not('contact_id', 'is', null)
    .not('echeance', 'is', null)

  if (!actions) return NextResponse.json({ sent: 0, skipped: 0 })

  let sent = 0
  let skipped = 0

  for (const action of actions as any[]) {
    const contact = action.contacts_entreprise
    if (!contact || !contact.email) { skipped++; continue }

    // Double vérification des toggles
    if (!action.rappels_actifs || !contact.rappels_actifs) { skipped++; continue }

    const echeance = action.echeance // YYYY-MM-DD
    const evaluation = action.evaluations
    const poste = evaluation?.operations?.postes?.nom ?? ''
    const operation = evaluation?.operations?.nom ?? ''

    let type: TypeRappel | null = null
    if (echeance === j7) type = 'j_moins_7'
    else if (echeance === today) type = 'jour_j'
    else if (echeance < today && todayDay === 1) type = 'mensuel'

    if (!type) { skipped++; continue }

    try {
      await envoyerRappel({
        destinataire: { prenom: contact.prenom, email: contact.email },
        action: {
          description: action.description ?? 'Action préventive',
          danger: evaluation?.danger ?? '',
          poste,
          operation,
          echeance,
          criticite: evaluation?.criticite_brute ?? 0,
        },
        type,
      })
      sent++
    } catch (err) {
      console.error(`Erreur envoi email pour action ${action.id}:`, err)
      skipped++
    }
  }

  return NextResponse.json({ sent, skipped, date: today })
}
```

- [ ] **Étape 2 : Commit**

```bash
git add src/app/api/cron/reminders/route.ts
git commit -m "feat: route cron /api/cron/reminders (Vercel Cron + Resend)"
```

---

## Task 13 — Configuration Vercel Cron

**Files:**
- Modify: `vercel.json`

- [ ] **Étape 1 : Ajouter le cron dans vercel.json**

Remplacer le contenu actuel de `vercel.json` par :

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

Le cron s'exécute tous les jours à 8h UTC (= 9h ou 10h heure française selon l'heure d'été).

> **Note** : Vercel ajoute automatiquement le header `Authorization: Bearer <CRON_SECRET>` si la variable `CRON_SECRET` est définie dans les env vars Vercel. Vérifier dans Dashboard Vercel → Settings → Environment Variables que `CRON_SECRET` est bien défini.

- [ ] **Étape 2 : Commit**

```bash
git add vercel.json
git commit -m "feat: configurer Vercel Cron pour rappels email quotidiens (8h UTC)"
```

---

## Task 14 — Build + CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Étape 1 : Lancer le build**

```bash
npm run build
```

Résultat attendu : `✓ Compiled successfully`. Si erreurs TypeScript, les corriger avant de continuer.

- [ ] **Étape 2 : Mettre à jour CLAUDE.md**

Dans la section "Phase 3 — Vitrine V3 + repositionnement", ajouter après `PHASE_MODULE_BRUIT` :

```markdown
- [x] PHASE_PLAN_ACTION : Plan d'action risques aigus — table actions_plan + contacts_entreprise + rappels email Resend + Vercel Cron
```

Dans la section "Phase 4 — Backlog post-lancement", ajouter :

```markdown
- [ ] Intégrer risques chroniques dans le Plan d'action
- [ ] Export PDF du Plan d'action
```

- [ ] **Étape 3 : Commit final + push**

```bash
git add CLAUDE.md
git commit -m "feat: PHASE_PLAN_ACTION complète — plan d'action + contacts + rappels email"
git push
```

---

## Résumé des tâches

| # | Tâche | Fichiers |
|---|---|---|
| 1 | Migration SQL 011 | `supabase/migrations/011_plan_action.sql` |
| 2 | Server Actions contacts | `parametres/contacts/_actions.ts` |
| 3 | Composant ListeContacts | `parametres/contacts/_components/liste-contacts.tsx` |
| 4 | Page Paramètres/Contacts | `parametres/contacts/page.tsx` + `parametres/page.tsx` |
| 5 | Server Actions plan-action | `plan-action/_actions.ts` |
| 6 | Composant DropdownResponsable | `plan-action/_components/dropdown-responsable.tsx` |
| 7 | Composant FiltreBarre + ColonnesVisibilite | `plan-action/_components/filtre-colonnes.tsx` |
| 8 | Composant TableauPlanAction | `plan-action/_components/tableau-plan-action.tsx` |
| 9 | Page Plan d'action | `plan-action/page.tsx` |
| 10 | Sidebar | `sidebar.tsx` |
| 11 | Email Resend | `src/lib/email/reminders.ts` |
| 12 | Route cron | `src/app/api/cron/reminders/route.ts` |
| 13 | vercel.json cron | `vercel.json` |
| 14 | Build + CLAUDE.md | `CLAUDE.md` |
