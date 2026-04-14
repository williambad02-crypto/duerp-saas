export const metadata = {
  title: "Politique de confidentialité — DUERP SaaS",
}

export default function ConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Politique de confidentialité
      </h1>
      <p className="text-sm text-gray-400 mb-10">
        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      <div className="space-y-8 text-gray-700">

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Responsable du traitement</h2>
          <p className="leading-relaxed">
            Le responsable du traitement des données personnelles collectées via le Service
            DUERP SaaS est :<br />
            <strong>William Maréchal</strong> — [Raison sociale — À COMPLÉTER]<br />
            Contact DPO : <a href="mailto:[email — À COMPLÉTER]" className="text-blue-600 hover:underline">[email — À COMPLÉTER]</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Données collectées</h2>
          <p className="leading-relaxed mb-3">Nous collectons les données suivantes :</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Catégorie</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Données</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Finalité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Compte utilisateur", "Adresse email, mot de passe (hashé)", "Authentification et accès au Service"],
                  ["Entreprise", "Nom, SIRET, effectif, secteur, adresse", "Génération du DUERP"],
                  ["Évaluations", "Postes, opérations, cotations de risques, plans de maîtrise", "Fonctionnement du DUERP"],
                  ["Paiement", "Géré exclusivement par Stripe — nous n'avons pas accès aux coordonnées bancaires", "Abonnement"],
                  ["Technique", "Logs d'accès, adresse IP", "Sécurité et débogage"],
                ].map(([cat, data, fin]) => (
                  <tr key={cat}>
                    <td className="px-4 py-3 font-medium text-gray-900">{cat}</td>
                    <td className="px-4 py-3 text-gray-600">{data}</td>
                    <td className="px-4 py-3 text-gray-600">{fin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Base légale</h2>
          <p className="leading-relaxed">
            Le traitement de vos données repose sur :<br />
            — <strong>L&apos;exécution du contrat</strong> : pour vous fournir le Service (compte, DUERP, PDF)<br />
            — <strong>L&apos;obligation légale</strong> : conservation du DUERP pendant 40 ans (loi du 2 août 2021, art. L4121-3-1 du Code du travail)<br />
            — <strong>L&apos;intérêt légitime</strong> : amélioration du Service, sécurité
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Durée de conservation</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed">
            <li><strong>Données de compte</strong> : jusqu&apos;à suppression du compte + 3 ans pour les obligations comptables</li>
            <li><strong>Données du DUERP</strong> : 40 ans à compter de leur création (obligation légale)</li>
            <li><strong>Logs techniques</strong> : 12 mois glissants</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Sous-traitants</h2>
          <p className="leading-relaxed mb-3">
            Nous faisons appel aux sous-traitants suivants, liés par des engagements de confidentialité :
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed">
            <li>
              <strong>Supabase Inc.</strong> (hébergement base de données) —
              Données stockées dans des data centers conformes RGPD.{' '}
              <a href="https://supabase.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Politique de confidentialité Supabase</a>
            </li>
            <li>
              <strong>Vercel Inc.</strong> (hébergement de l&apos;application) —
              Conformité RGPD. Données des requêtes transitant par des CDN mondiaux.{' '}
              <a href="https://vercel.com/legal/privacy-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Politique Vercel</a>
            </li>
            <li>
              <strong>Stripe Inc.</strong> (traitement des paiements) —
              Nous ne stockons aucune donnée bancaire. Stripe est certifié PCI-DSS niveau 1.{' '}
              <a href="https://stripe.com/fr/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Politique Stripe</a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Vos droits (RGPD)</h2>
          <p className="leading-relaxed mb-2">
            Conformément au Règlement Général sur la Protection des Données (RGPD),
            vous disposez des droits suivants :
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed">
            <li><strong>Droit d&apos;accès</strong> : obtenir une copie de vos données</li>
            <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
            <li><strong>Droit à l&apos;effacement</strong> : supprimer vos données (sous réserve des obligations légales de conservation)</li>
            <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
            <li><strong>Droit d&apos;opposition</strong> : vous opposer à certains traitements</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed">
            Pour exercer ces droits, contactez-nous à{' '}
            <a href="mailto:[email — À COMPLÉTER]" className="text-blue-600 hover:underline">[email — À COMPLÉTER]</a>.
            Vous disposez également du droit d&apos;introduire une réclamation auprès de la{' '}
            <a href="https://www.cnil.fr" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">CNIL</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Cookies</h2>
          <p className="leading-relaxed">
            Ce site utilise uniquement des cookies techniques strictement nécessaires au
            fonctionnement du Service, notamment pour maintenir votre session utilisateur
            (cookie de session Supabase). Ces cookies ne nécessitent pas votre consentement
            au sens de l&apos;article 82 de la loi Informatique et Libertés.
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            <strong>Aucun cookie publicitaire, aucun cookie de tracking tiers n&apos;est déposé.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Sécurité</h2>
          <p className="leading-relaxed">
            Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour
            protéger vos données : chiffrement des données en transit (HTTPS/TLS), isolation
            des données par utilisateur (Row Level Security Supabase), hachage des mots de passe.
          </p>
        </section>

      </div>
    </div>
  )
}
