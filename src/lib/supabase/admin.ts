import { createClient } from '@supabase/supabase-js'

// Client Supabase avec service_role — bypass RLS complet
// Usage EXCLUSIF : webhooks serveur (Stripe), scripts admin
// NE JAMAIS exposer côté client
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY manquant')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
