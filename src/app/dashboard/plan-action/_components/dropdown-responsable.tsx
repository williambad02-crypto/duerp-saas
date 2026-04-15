'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { createContact, type Contact } from '../../parametres/contacts/_actions'

interface Props {
  contacts: Contact[]
  selectedId: string | null
  onChange: (contactId: string | null, newContact?: Contact) => void
}

export function DropdownResponsable({ contacts, selectedId, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const selected = contacts.find(c => c.id === selectedId)

  function openDropdown() {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    setDropdownPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 200),
    })
    setOpen(true)
  }

  function handleSelect(id: string | null) {
    onChange(id ?? null)
    setOpen(false)
    setShowNew(false)
  }

  async function handleCreateContact() {
    if (!prenom.trim() || !nom.trim() || !email.trim()) return
    startTransition(async () => {
      const newContact = await createContact({
        prenom: prenom.trim(),
        nom: nom.trim(),
        email: email.trim(),
        role: 'autre',
      })
      onChange(newContact.id, newContact)
      setOpen(false)
      setShowNew(false)
      setPrenom(''); setNom(''); setEmail('')
    })
  }

  // Fermer en cliquant hors du dropdown
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      const target = e.target as Node
      if (!triggerRef.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const dropdown = open ? (
    <div
      style={{
        position: 'absolute',
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        zIndex: 9999,
      }}
      className="bg-white border border-gray-200 rounded-lg shadow-xl"
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Option "Aucun" */}
      <button
        onClick={() => handleSelect(null)}
        className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 border-b border-gray-100"
      >
        — Aucun responsable
      </button>

      {/* Liste des contacts */}
      <div className="max-h-48 overflow-y-auto">
        {contacts.map(c => (
          <button
            key={c.id}
            onClick={() => handleSelect(c.id)}
            className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors ${
              c.id === selectedId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
            }`}
          >
            <span className="font-medium">{c.prenom} {c.nom}</span>
            <span className="text-gray-400 ml-1">· {c.email}</span>
          </button>
        ))}
      </div>

      {/* Ajouter un contact */}
      {!showNew ? (
        <button
          onClick={() => setShowNew(true)}
          className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 border-t border-gray-100 font-medium"
        >
          + Nouveau contact
        </button>
      ) : (
        <div className="p-2 border-t border-gray-100 space-y-1">
          <input
            autoFocus
            value={prenom}
            onChange={e => setPrenom(e.target.value)}
            placeholder="Prénom"
            className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
          <input
            value={nom}
            onChange={e => setNom(e.target.value)}
            placeholder="Nom"
            className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
          <div className="flex gap-1 pt-0.5">
            <button
              onClick={handleCreateContact}
              disabled={isPending || !prenom.trim() || !nom.trim() || !email.trim()}
              className="flex-1 text-xs bg-blue-600 text-white rounded px-2 py-1 hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Création...' : 'Créer'}
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="text-xs text-gray-500 px-2 py-1 hover:text-gray-700"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  ) : null

  return (
    <>
      <button
        ref={triggerRef}
        onClick={openDropdown}
        className="w-full text-left text-xs text-gray-700 hover:bg-blue-50 rounded px-1 py-0.5 transition-colors truncate"
      >
        {selected ? `${selected.prenom} ${selected.nom}` : <span className="text-gray-300 italic">— Assigner</span>}
      </button>
      {mounted && dropdown && createPortal(dropdown, document.body)}
    </>
  )
}
