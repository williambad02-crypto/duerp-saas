'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email ou mot de passe incorrect.' }
  }

  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nomEntreprise = formData.get('nom_entreprise') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nom_entreprise: nomEntreprise },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Création de l'entreprise après inscription
  if (data.user) {
    const { error: entrepriseError } = await supabase
      .from('entreprises')
      .insert({
        user_id: data.user.id,
        nom: nomEntreprise,
      })

    if (entrepriseError) {
      console.error('Erreur création entreprise :', entrepriseError)
    }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
