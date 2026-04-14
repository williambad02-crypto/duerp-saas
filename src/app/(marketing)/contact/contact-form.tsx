"use client"

import { useActionState } from "react"
import { envoyerContact, EtatContact } from "./actions"

const etatInitial: EtatContact = { statut: "idle" }

const inputClass = "block w-full rounded-lg border border-brand-sand bg-brand-cream px-3.5 py-2.5 text-brand-navy placeholder-brand-bronze/40 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 text-sm transition outline-none"
const labelClass = "block text-sm font-medium text-brand-navy mb-1.5"

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
        <label htmlFor="nom" className={labelClass}>
          Nom complet <span className="text-red-400">*</span>
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          required
          autoComplete="name"
          className={inputClass}
          placeholder="Jean Dupont"
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Adresse email <span className="text-red-400">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
          placeholder="jean.dupont@entreprise.fr"
        />
      </div>

      <div>
        <label htmlFor="sujet" className={labelClass}>
          Sujet
        </label>
        <select
          id="sujet"
          name="sujet"
          className={inputClass}
          defaultValue=""
        >
          <option value="" disabled>Choisir un sujet…</option>
          <option value="question">Question sur l&apos;outil</option>
          <option value="devis">Demande de devis consulting</option>
          <option value="technique">Problème technique</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={`${inputClass} resize-none`}
          placeholder="Décrivez votre demande…"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-gold hover:bg-brand-gold-light disabled:opacity-60 disabled:cursor-not-allowed text-brand-off font-semibold px-5 py-2.5 text-sm transition flex items-center justify-center gap-2"
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
          "Envoyer le message →"
        )}
      </button>

      <p className="text-xs text-brand-bronze/50 text-center">
        Données traitées conformément à notre{" "}
        <a href="/confidentialite" className="underline hover:text-brand-navy transition-colors">
          politique de confidentialité
        </a>
        .
      </p>
    </form>
  )
}
