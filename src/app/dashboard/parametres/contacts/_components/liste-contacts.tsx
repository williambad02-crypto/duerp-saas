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
