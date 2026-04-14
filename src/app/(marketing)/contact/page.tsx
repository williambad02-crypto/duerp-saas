import { ContactForm } from "./contact-form"

export const metadata = {
  title: "Contact — SafeAnalyse.",
}

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Nous contacter</h1>
        <p className="text-gray-500 leading-relaxed">
          Une question, un problème technique, ou une demande d&apos;information ?
          Remplissez le formulaire ci-dessous — nous vous répondrons dans les meilleurs délais.
        </p>
      </div>

      <ContactForm />
    </div>
  )
}
