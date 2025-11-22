import { Shield, Lock, Headphones, CheckCircle, Users, Home, Star } from 'lucide-react';
import { Card } from '@/shared/ui/Card';

interface TrustCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  bgColor?: string;
}

function TrustCard({ icon, title, description, badge, bgColor = 'bg-blue-50' }: TrustCardProps) {
  return (
    <Card className={`${bgColor} border-2 border-transparent hover:border-blue-200 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1`}>
      <div className="text-center p-6 space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-2xl shadow-md">
            {icon}
          </div>
        </div>
        {badge && (
          <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
            {badge}
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </Card>
  );
}

interface StatProps {
  number: string;
  label: string;
  icon?: React.ReactNode;
}

function Stat({ number, label, icon }: StatProps) {
  return (
    <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
      {icon && <div className="flex justify-center mb-3">{icon}</div>}
      <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{number}</div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
}

export default function TrustSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Pourquoi choisir <span className="text-blue-600">Mon Toit</span> ?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            La première plateforme immobilière 100% sécurisée et vérifiée en Côte d'Ivoire
          </p>
        </div>

        {/* Trust Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
          <TrustCard
            icon={<Shield className="h-12 w-12 text-blue-600" />}
            title="Vérification ANSUT"
            description="Tous les propriétaires sont vérifiés par l'ANSUT avec ONECI. Protection garantie contre les arnaques."
            badge="100% vérifié"
            bgColor="bg-blue-50"
          />

          <TrustCard
            icon={<Lock className="h-12 w-12 text-green-600" />}
            title="Paiement Sécurisé"
            description="Paiements via Mobile Money (Orange, MTN, Wave, Moov) avec garantie de remboursement en cas de problème."
            badge="Sécurisé"
            bgColor="bg-green-50"
          />

          <TrustCard
            icon={<Headphones className="h-12 w-12 text-purple-600" />}
            title="Support SUTA 24/7"
            description="Notre chatbot intelligent SUTA vous protège des arnaques en temps réel et répond à vos questions 24h/24."
            badge="Disponible 24/7"
            bgColor="bg-purple-50"
          />
        </div>

        {/* Additional Trust Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <Card className="bg-white border-2 border-gray-100 hover:border-blue-200 transition-all">
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Protection Juridique</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Contrats conformes à la loi ivoirienne</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Signature électronique certifiée CryptoNeo</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Validation par des agents de confiance</span>
                </li>
              </ul>
            </div>
          </Card>

          <Card className="bg-white border-2 border-gray-100 hover:border-blue-200 transition-all">
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Transparence Totale</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Prix affichés sans frais cachés</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Avis et notations des propriétaires</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Historique complet des propriétés</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Statistics */}
        <div className="mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
            Ils nous font confiance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Stat
              number="10,000+"
              label="Utilisateurs actifs"
              icon={<Users className="h-8 w-8 text-blue-600" />}
            />
            <Stat
              number="2,500+"
              label="Logements vérifiés"
              icon={<Home className="h-8 w-8 text-green-600" />}
            />
            <Stat
              number="98%"
              label="Taux de satisfaction"
              icon={<Star className="h-8 w-8 text-yellow-500" />}
            />
            <Stat
              number="5,000+"
              label="Contrats signés"
              icon={<CheckCircle className="h-8 w-8 text-purple-600" />}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 shadow-xl">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Prêt à trouver votre logement idéal ?
          </h3>
          <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
            Rejoignez des milliers d'Ivoiriens qui ont trouvé leur toit en toute sécurité
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/recherche"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Commencer ma recherche
            </a>
            <a
              href="/inscription"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Créer mon compte gratuit
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
