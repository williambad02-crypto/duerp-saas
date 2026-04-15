import { redirect } from 'next/navigation'

// /pricing est déprécié — la page de tarifs officielle est /tarifs.
// Redirect permanent pour conserver les backlinks.
export default function PricingPage() {
  redirect('/tarifs')
}
