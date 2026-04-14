"use client"

import { useActionState } from "react"
import { envoyerContact, EtatContact } from "./actions"

const etatInitial: EtatContact = { statut: "idle" }

export function ContactForm() {
  const [etat, action, pending] = useActionState(envoyerContact, etatInitial)

  if (etat.statut === "succes") {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-green-900 mb-2">Message envoyé !</h2>
        <p className="text-sm text-green-700">
          Merci de nous avoir contactés. Nous vous répondrons dans les meilleurs délais.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      {etat.statut === "erreur" && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {etat.message}
        </div>
      )}

      <div>
        <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1.5">
          Nom complet <span className="text-red-500">*</span>
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          required
          autoComplete="name"
          className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm transition"
          placeholder="Jean Dupont"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
          Adresse email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm transition"
          placeholder="jean.dupont@entreprise.fr"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm transition resize-none"
          placeholder="Décrivez votre demande..."
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 text-sm transition flex items-center justify-center gap-2"
      >
        {pending ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Envoi en cours…
          </>
        ) : (
          "Envoyer le message"
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Vos données sont traitées conformément à notre{" "}
        <a href="/confidentialite" className="underline hover:text-gray-600">
          politique de confidentialité
        </a>
        .
      </p>
    </form>
  )
}
