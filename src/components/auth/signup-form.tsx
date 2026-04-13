'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SignupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [succes, setSucces] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErreur(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const nomEntreprise = formData.get('nom_entreprise') as string

    if (password.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nom_entreprise: nomEntreprise },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setErreur(error.message)
      setLoading(false)
      return
    }

    // Vérifier si la confirmation email est requise
    setSucces(true)
    setLoading(false)

    // Si pas de confirmation email requise, rediriger directement
    setTimeout(() => router.push('/dashboard'), 1500)
    router.refresh()
  }

  if (succes) {
    return (
      <div className="text-center py-4">
        <div className="text-green-600 font-medium mb-2">Compte créé avec succès !</div>
        <p className="text-sm text-gray-500">
          Redirection vers votre tableau de bord...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nom_entreprise">Nom de l&apos;entreprise</Label>
        <Input
          id="nom_entreprrise"
          name="nom_entreprise"
          type="text"
          required
          placeholder="Mon Entreprise SARL"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email professionnel</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="vous@entreprise.fr"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="8 caractères minimum"
        />
      </div>

      {erreur && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {erreur}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Création du compte...' : 'Créer mon compte gratuitement'}
      </Button>

      <p className="text-xs text-center text-gray-400">
        En créant un compte, vous acceptez nos conditions d&apos;utilisation.
      </p>
    </form>
  )
}
