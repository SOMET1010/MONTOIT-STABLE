import { ArrowLeft, Shield, Users, Target, Award } from 'lucide-react';

export default function AboutPage() {
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

        <div className="card-scrapbook p-8 mb-8 animate-slide-down">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src="/logo-montoit.png"
              alt="Mon Toit Logo"
              className="h-16 w-16 object-contain"
            />
            <div>
              <h1 className="text-4xl font-bold text-gradient">À propos de Mon Toit</h1>
              <p className="text-lg text-gray-600">Plateforme immobilière avec signature électronique sécurisée</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              Mon Toit est une plateforme immobilière innovante qui vise à faciliter l'accès au logement en Côte d'Ivoire grâce à la signature électronique sécurisée et la vérification d'identité officielle.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
              <Target className="h-6 w-6 text-terracotta-600 mr-3" />
              Notre Mission
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Rendre l'accès au logement plus simple, transparent et sécurisé pour tous les Ivoiriens. Nous connectons propriétaires et locataires à travers une plateforme digitale moderne qui garantit confiance et sécurité dans toutes les transactions.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
              <Shield className="h-6 w-6 text-olive-600 mr-3" />
              Nos Garanties
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-terracotta-500 rounded-full mt-2 mr-3"></span>
                <span><strong>Vérification d'identité officielle :</strong> Tous les utilisateurs sont vérifiés via l'ONECI pour garantir l'authenticité des profils</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-terracotta-500 rounded-full mt-2 mr-3"></span>
                <span><strong>Signature électronique légale :</strong> Contrats sécurisés conformes à la réglementation ivoirienne</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-terracotta-500 rounded-full mt-2 mr-3"></span>
                <span><strong>Paiement sécurisé :</strong> Transactions protégées via Mobile Money (Orange, MTN, Moov)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-terracotta-500 rounded-full mt-2 mr-3"></span>
                <span><strong>Cachet électronique visible :</strong> Tous les contrats sont marqués d'un cachet électronique garantissant leur authenticité</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
              <Users className="h-6 w-6 text-cyan-600 mr-3" />
              Nos Valeurs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-terracotta-50 to-coral-50 p-4 rounded-xl border-2 border-terracotta-200">
                <h3 className="font-bold text-gray-900 mb-2">Transparence</h3>
                <p className="text-sm text-gray-700">Toutes les informations sont claires et vérifiables</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl border-2 border-cyan-200">
                <h3 className="font-bold text-gray-900 mb-2">Sécurité</h3>
                <p className="text-sm text-gray-700">Protection maximale de vos données et transactions</p>
              </div>
              <div className="bg-gradient-to-br from-olive-50 to-green-50 p-4 rounded-xl border-2 border-olive-200">
                <h3 className="font-bold text-gray-900 mb-2">Accessibilité</h3>
                <p className="text-sm text-gray-700">Un logement pour tous, sans discrimination</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200">
                <h3 className="font-bold text-gray-900 mb-2">Innovation</h3>
                <p className="text-sm text-gray-700">Technologie au service de l'immobilier</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
              <Award className="h-6 w-6 text-amber-600 mr-3" />
              Sécurité et Conformité
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Mon Toit respecte les normes nationales en matière de services numériques et de protection des utilisateurs. Nous utilisons la signature électronique via CryptoNeo et appliquons un cachet électronique visible sur tous les contrats. Les utilisateurs peuvent optionnellement demander un Certificat Électronique de Vérification (CEV) auprès de l'ONECI pour renforcer la validité légale de leur contrat.
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 p-6 rounded-xl mt-8">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Nous Contacter</h3>
              <p className="text-gray-700 mb-2">
                <strong>Email :</strong> <a href="mailto:contact@mon-toit.ci" className="text-blue-600 hover:underline">contact@mon-toit.ci</a>
              </p>
              <p className="text-gray-700">
                <strong>Adresse :</strong> Abidjan, Côte d'Ivoire
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
