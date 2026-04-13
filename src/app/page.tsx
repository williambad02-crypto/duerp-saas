import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// La racine redirige vers /dashboard (si connecté) ou /auth/login
export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/auth/login')
  }
}
