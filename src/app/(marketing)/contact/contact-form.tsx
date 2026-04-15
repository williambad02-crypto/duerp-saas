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
        <p className="text-sm text-green-700 leading-relaxed">
          Merci pour votre message. Je vous répondrai personnellement sous 24 heures ouvrées.
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

      {/* Nom + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <label htmlFor="telephone" className={labelClass}>
            Téléphone
          </label>
          <input
            id="telephone"
            name="telephone"
            type="tel"
            autoComplete="tel"
            className={inputClass}
            placeholder="06 XX XX XX XX"
          />
        </div>
      </div>

      {/* Email */}
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

      {/* Entreprise + Taille */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="entreprise" className={labelClass}>
            Entreprise
          </label>
          <input
            id="entreprise"
            name="entreprise"
            type="text"
            autoComplete="organization"
            className={inputClass}
            placeholder="Nom de votre société"
          />
        </div>
        <div>
          <label htmlFor="taille" className={labelClass}>
            Taille de l&apos;entreprise
          </label>
          <select id="taille" name="taille" className={inputClass} defaultValue="">
            <option value="" disabled>Effectif…</option>
            <option value="1-10">1 à 10 salariés</option>
            <option value="11-50">11 à 50 salariés</option>
            <option value="51-250">51 à 250 salariés</option>
            <option value="250+">Plus de 250 salariés</option>
          </select>
        </div>
      </div>

      {/* Secteur */}
      <div>
        <label htmlFor="secteur" className={labelClass}>
          Secteur d&apos;activité
        </label>
        <select id="secteur" name="secteur" className={inputClass} defaultValue="">
          <option value="" disabled>Secteur…</option>
          <option value="agroalimentaire">Agroalimentaire</option>
          <option value="industrie">Industrie / Mécanique</option>
          <option value="btp">BTP / Construction</option>
          <option value="restauration">Restauration / CHR</option>
          <option value="logistique">Logistique / Transport</option>
          <option value="artisanat">Artisanat</option>
          <option value="tertiaire">Tertiaire / Bureau</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      {/* Sujet */}
      <div>
        <label htmlFor="sujet" className={labelClass}>
          Objet de votre demande
        </label>
        <select id="sujet" name="sujet" className={inputClass} defaultValue="">
          <option value="" disabled>Choisir…</option>
          <option value="question">Question sur l&apos;outil</option>
          <option value="devis-consulting">Demande de devis consulting sur site</option>
          <option value="abonnement">Question sur les abonnements</option>
          <option value="technique">Problème technique</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      {/* Message */}
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
          placeholder="Décrivez votre situation, vos questions, ou vos besoins…"
        />
      </div>

      {/* RGPD */}
      <div className="flex items-start gap-3">
        <input
          id="rgpd"
          name="rgpd"
          type="checkbox"
          value="oui"
          required
          className="mt-0.5 w-4 h-4 rounded border-brand-sand accent-brand-navy shrink-0"
        />
        <label htmlFor="rgpd" className="text-xs text-brand-bronze leading-relaxed cursor-pointer">
          J&apos;accepte que mes données soient traitées par SafeAnalyse. pour répondre à ma
          demande, conformément à la{" "}
          <a href="/confidentialite" className="underline hover:text-brand-navy transition-colors">
            politique de confidentialité
          </a>
          . <span className="text-red-400">*</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand-gold hover:bg-brand-gold-light disabled:opacity-60 disabled:cursor-not-allowed text-brand-navy-deep font-semibold px-5 py-3 text-sm transition flex items-center justify-center gap-2"
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
    </form>
  )
}
