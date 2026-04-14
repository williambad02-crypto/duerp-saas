// Ce fichier ne doit pas exister — la landing est dans src/app/page.tsx
// Redirection de sécurité si jamais accédé directement
import { redirect } from 'next/navigation'
export default function MarketingPage() { redirect('/') }
