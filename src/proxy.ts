import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/session'

// Next.js 16+ : proxy.ts remplace middleware.ts
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const proxyConfig = {
  matcher: [
    /*
     * Appliqué sur toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation images)
     * - favicon.ico, robots.txt, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
