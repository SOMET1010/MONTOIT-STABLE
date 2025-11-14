import { ArrowLeft, Shield, Eye, Lock, UserCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold text-gradient mb-6 flex items-center">
            <Shield className="h-10 w-10 text-olive-600 mr-4" />
            Politique de Confidentialité
          </h1>
          <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : Novembre 2025</p>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Eye className="h-6 w-6 text-cyan-600 mr-3" />
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Mon Toit, plateforme immobilière certifiée ANSUT, s'engage à protéger la vie privée de ses utilisateurs.
                Cette politique de confidentialité explique comment nous collectons, utilisons, conservons et protégeons
                vos données personnelles conformément à la réglementation ivoirienne en vigueur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Données Collectées</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Nous collectons les types de données suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Données d'identification :</strong> nom, prénom, date de naissance, numéro de CNI</li>
                <li><strong>Données de contact :</strong> adresse email, numéro de téléphone, adresse postale</li>
                <li><strong>Données de compte :</strong> identifiant, mot de passe crypté, préférences</li>
                <li><strong>Données de transaction :</strong> historique de recherches, candidatures, paiements</li>
                <li><strong>Données techniques :</strong> adresse IP, type de navigateur, données de connexion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Finalités du Traitement</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Vos données personnelles sont utilisées pour :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Créer et gérer votre compte utilisateur</li>
                <li>Faciliter la mise en relation entre propriétaires et locataires</li>
                <li>Vérifier votre identité via l'ONECI</li>
                <li>Traiter vos paiements de manière sécurisée</li>
                <li>Vous envoyer des notifications importantes</li>
                <li>Améliorer nos services et votre expérience utilisateur</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Lock className="h-6 w-6 text-terracotta-600 mr-3" />
                4. Sécurité des Données
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Cryptage des données sensibles (SSL/TLS)</li>
                <li>Authentification sécurisée avec double facteur</li>
                <li>Contrôle d'accès strict aux données</li>
                <li>Sauvegardes régulières et sécurisées</li>
                <li>Surveillance continue des systèmes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Partage des Données</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Vos données personnelles peuvent être partagées avec :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>ONECI :</strong> pour la vérification d'identité</li>
                <li><strong>Prestataires de paiement :</strong> Orange Money, MTN Money, Moov Money</li>
                <li><strong>ANSUT :</strong> dans le cadre de la certification de la plateforme</li>
                <li><strong>Autorités légales :</strong> sur réquisition judiciaire</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                Nous ne vendons jamais vos données personnelles à des tiers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <UserCheck className="h-6 w-6 text-olive-600 mr-3" />
                6. Vos Droits
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Conformément à la loi ivoirienne, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Droit d'accès :</strong> consulter vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                <li><strong>Droit d'opposition :</strong> refuser certains traitements</li>
                <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
                <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                Pour exercer ces droits, contactez-nous à : <a href="mailto:privacy@mon-toit.ci" className="text-olive-600 hover:underline font-medium">privacy@mon-toit.ci</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Conservation des Données</h2>
              <p className="text-gray-700 leading-relaxed">
                Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités pour lesquelles
                elles ont été collectées, ou selon les exigences légales en vigueur. Les données liées aux contrats de bail
                sont conservées pendant 5 ans après la fin du contrat.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Notre site utilise des cookies pour améliorer votre expérience de navigation. Vous pouvez configurer votre
                navigateur pour refuser les cookies, mais cela pourrait affecter certaines fonctionnalités de la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modifications</h2>
              <p className="text-gray-700 leading-relaxed">
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications
                importantes vous seront notifiées par email ou via une notification sur la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                Pour toute question concernant le traitement de vos données personnelles, vous pouvez nous contacter :
              </p>
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 p-6 rounded-xl mt-4">
                <p className="text-gray-700 mb-2">
                  <strong>Email :</strong> <a href="mailto:privacy@mon-toit.ci" className="text-cyan-600 hover:underline">privacy@mon-toit.ci</a>
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Responsable de la protection des données :</strong> DPO Mon Toit
                </p>
                <p className="text-gray-700">
                  <strong>Adresse :</strong> Abidjan, Côte d'Ivoire
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
