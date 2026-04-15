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
