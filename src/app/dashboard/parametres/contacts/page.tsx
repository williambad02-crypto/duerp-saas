import { getContacts } from './_actions'
import { ListeContacts } from './_components/liste-contacts'

export const metadata = { title: 'Contacts — SafeAnalyse.' }

export default async function ContactsPage() {
  const contacts = await getContacts()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contacts de l&apos;entreprise</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gérez les personnes pouvant être assignées comme responsables d&apos;actions préventives.
        </p>
      </div>
      <ListeContacts contacts={contacts} />
    </div>
  )
}
