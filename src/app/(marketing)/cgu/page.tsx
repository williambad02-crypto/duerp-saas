export const metadata = {
  title: "Conditions Générales d'Utilisation — SafeAnalyse.",
}

export default function CGUPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Conditions Générales d&apos;Utilisation
      </h1>
      <p className="text-sm text-gray-400 mb-10">
        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      <div className="space-y-8 text-gray-700">

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Objet</h2>
          <p className="leading-relaxed">
            Les présentes Conditions Générales d&apos;Utilisation (ci-après &laquo; CGU &raquo;) régissent
            l&apos;accès et l&apos;utilisation de la plateforme <strong>SafeAnalyse.</strong> (ci-après
            &laquo; le Service &raquo;), un outil en ligne permettant aux employeurs de réaliser
            leur Document Unique d&apos;Évaluation des Risques Professionnels (DUERP) conformément
            à l&apos;article L4121-1 du Code du travail français.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Conditions d&apos;accès</h2>
          <p className="leading-relaxed mb-2">
            L&apos;accès au Service est réservé aux personnes physiques majeures agissant
            en qualité d&apos;employeur ou de responsable désigné au sein d&apos;une entreprise.
          </p>
          <p className="leading-relaxed">
            La création d&apos;un compte nécessite de fournir une adresse email valide et un
            mot de passe. L&apos;utilisateur est responsable de la confidentialité de ses
            identifiants de connexion. Un essai gratuit de 14 jours est proposé sans
            obligation d&apos;achat ni communication de coordonnées bancaires.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Obligations de l&apos;utilisateur</h2>
          <p className="leading-relaxed mb-2">L&apos;utilisateur s&apos;engage à :</p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed">
            <li>Fournir des informations exactes et à jour lors de la création de son compte et de son DUERP</li>
            <li>Ne pas utiliser le Service à des fins illicites ou contraires aux présentes CGU</li>
            <li>Ne pas tenter de contourner les mécanismes de sécurité du Service</li>
            <li>Ne pas partager ses identifiants avec des tiers non autorisés</li>
            <li>Vérifier la conformité de son DUERP avec la réglementation applicable à son activité</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Propriété intellectuelle</h2>
          <p className="leading-relaxed">
            Le Service, son code source, son interface et ses contenus sont protégés
            par le droit d&apos;auteur et appartiennent à l&apos;éditeur. L&apos;utilisateur conserve
            l&apos;entière propriété des données qu&apos;il saisit dans le Service (informations
            de son entreprise, résultats d&apos;évaluation, plans de maîtrise).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Limitation de responsabilité</h2>
          <p className="leading-relaxed mb-2">
            Le Service est un outil d&apos;aide à la rédaction du DUERP. Il ne constitue
            pas un conseil juridique ou HSE professionnel et ne remplace pas l&apos;intervention
            d&apos;un expert en prévention des risques.
          </p>
          <p className="leading-relaxed">
            L&apos;éditeur décline toute responsabilité quant à l&apos;exactitude et à l&apos;exhaustivité
            des évaluations réalisées via le Service. L&apos;employeur reste seul responsable
            de son Document Unique et de la mise en place effective des mesures de prévention.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Abonnement et tarification</h2>
          <p className="leading-relaxed">
            Après la période d&apos;essai gratuit de 14 jours, l&apos;accès au Service est soumis
            à un abonnement payant (39€/mois ou 390€/an). Le paiement est sécurisé par
            la plateforme Stripe. L&apos;abonnement mensuel est sans engagement et peut être
            résilié à tout moment depuis l&apos;espace client.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Résiliation</h2>
          <p className="leading-relaxed">
            L&apos;utilisateur peut supprimer son compte à tout moment depuis les paramètres
            de son espace client. Conformément à la loi du 2 août 2021, les données du
            DUERP sont conservées 40 ans à compter de leur création, même après résiliation,
            puis supprimées définitivement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Modifications des CGU</h2>
          <p className="leading-relaxed">
            L&apos;éditeur se réserve le droit de modifier les présentes CGU à tout moment.
            Les utilisateurs seront informés par email de toute modification substantielle.
            La poursuite de l&apos;utilisation du Service après modification vaut acceptation
            des nouvelles conditions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Droit applicable et juridiction</h2>
          <p className="leading-relaxed">
            Les présentes CGU sont soumises au droit français. En cas de litige,
            les parties s&apos;efforceront de trouver une solution amiable. À défaut,
            le litige sera soumis à la compétence exclusive des tribunaux de
            [ville — À COMPLÉTER].
          </p>
        </section>

      </div>
    </div>
  )
}
