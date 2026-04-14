export const metadata = {
  title: "Mentions légales — SafeAnalyse.",
}

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentions légales</h1>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Éditeur du site</h2>
          <p>
            Le site <strong>duerp-app.vercel.app</strong> est édité par :<br />
            <strong>[Nom / Raison sociale — À COMPLÉTER]</strong><br />
            Forme juridique : [À COMPLÉTER]<br />
            Siège social : [Adresse — À COMPLÉTER]<br />
            SIRET : [À COMPLÉTER]<br />
            Contact : <a href="mailto:[email — À COMPLÉTER]" className="text-blue-600 hover:underline">[email — À COMPLÉTER]</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Responsable de la publication</h2>
          <p>
            <strong>William Maréchal</strong><br />
            Contact : <a href="mailto:[email — À COMPLÉTER]" className="text-blue-600 hover:underline">[email — À COMPLÉTER]</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Hébergement</h2>
          <p>
            Ce site est hébergé par :<br />
            <strong>Vercel Inc.</strong><br />
            340 S Lemon Ave #4133, Walnut, CA 91789, USA<br />
            <a href="https://vercel.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">vercel.com</a>
          </p>
          <p className="mt-2">
            Les données sont stockées dans des bases de données gérées par :<br />
            <strong>Supabase Inc.</strong><br />
            970 Toa Payoh North #07-04, Singapore 318992<br />
            <a href="https://supabase.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">supabase.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble du contenu de ce site (textes, graphismes, logiciels, code source)
            est protégé par le droit d&apos;auteur. Toute reproduction ou représentation,
            totale ou partielle, sans autorisation expresse est interdite.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Données personnelles</h2>
          <p>
            Pour toute information relative au traitement de vos données personnelles,
            veuillez consulter notre{' '}
            <a href="/confidentialite" className="text-blue-600 hover:underline">Politique de confidentialité</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies</h2>
          <p>
            Ce site utilise uniquement des cookies techniques nécessaires au fonctionnement
            du service (maintien de la session utilisateur). Aucun cookie publicitaire ou
            de traçage tiers n&apos;est utilisé. Pour plus d&apos;informations, consultez notre{' '}
            <a href="/confidentialite" className="text-blue-600 hover:underline">Politique de confidentialité</a>.
          </p>
        </section>

        <p className="text-sm text-gray-400 pt-4 border-t border-gray-100">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  )
}
