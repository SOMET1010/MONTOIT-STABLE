import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-coral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-terracotta-600 hover:text-terracotta-700 transition-all duration-300 font-medium mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour</span>
        </button>

        <div className="card-scrapbook p-8 animate-slide-down">
          <h1 className="text-4xl font-bold text-gradient mb-6">Conditions Générales d'Utilisation</h1>
          <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : Novembre 2025</p>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Objet</h2>
              <p className="text-gray-700 leading-relaxed">
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme Mon Toit,
                service en ligne de mise en relation entre propriétaires et locataires de biens immobiliers en Côte d'Ivoire.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Acceptation des Conditions</h2>
              <p className="text-gray-700 leading-relaxed">
                L'utilisation de la plateforme Mon Toit implique l'acceptation pleine et entière des présentes CGU.
                Tout utilisateur qui ne souhaite pas être lié par ces conditions doit s'abstenir d'utiliser les services proposés.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Inscription et Compte Utilisateur</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>L'inscription est gratuite et réservée aux personnes majeures</li>
                <li>Les informations fournies doivent être exactes et à jour</li>
                <li>Chaque utilisateur est responsable de la confidentialité de son mot de passe</li>
                <li>La vérification d'identité via ONECI est obligatoire pour certaines transactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Services Proposés</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Mon Toit propose les services suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Publication et consultation d'annonces immobilières</li>
                <li>Mise en relation entre propriétaires et locataires</li>
                <li>Signature électronique de contrats de bail</li>
                <li>Gestion des paiements via Mobile Money</li>
                <li>Vérification d'identité et certification</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Obligations des Utilisateurs</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Fournir des informations véridiques et complètes</li>
                <li>Ne publier que des annonces authentiques</li>
                <li>Respecter les droits de propriété intellectuelle</li>
                <li>Ne pas tenter de contourner les systèmes de sécurité</li>
                <li>Utiliser la plateforme de manière loyale et conforme à la loi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propriété Intellectuelle</h2>
              <p className="text-gray-700 leading-relaxed">
                Tous les éléments de la plateforme Mon Toit (logos, textes, graphiques, logiciels) sont protégés par le droit
                de la propriété intellectuelle. Toute reproduction non autorisée est strictement interdite.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Responsabilité</h2>
              <p className="text-gray-700 leading-relaxed">
                Mon Toit agit en qualité d'intermédiaire et ne peut être tenu responsable :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                <li>De l'exactitude des annonces publiées par les utilisateurs</li>
                <li>Des litiges entre utilisateurs</li>
                <li>Des interruptions temporaires de service</li>
                <li>Des actes frauduleux commis par des tiers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Protection des Données</h2>
              <p className="text-gray-700 leading-relaxed">
                Les données personnelles collectées sont traitées conformément à notre Politique de Confidentialité
                et aux dispositions de la loi ivoirienne sur la protection des données personnelles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modification des CGU</h2>
              <p className="text-gray-700 leading-relaxed">
                Mon Toit se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés
                de toute modification substantielle par email ou notification sur la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Droit Applicable</h2>
              <p className="text-gray-700 leading-relaxed">
                Les présentes CGU sont régies par le droit ivoirien. Tout litige sera soumis aux tribunaux compétents de Côte d'Ivoire.
              </p>
            </section>

            <div className="bg-gradient-to-r from-olive-50 to-green-50 border-2 border-olive-200 p-6 rounded-xl mt-8">
              <p className="text-sm text-gray-700">
                Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter à :
                <a href="mailto:contact@mon-toit.ci" className="text-olive-600 hover:underline ml-1 font-medium">contact@mon-toit.ci</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
