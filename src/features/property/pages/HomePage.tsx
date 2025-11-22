import { useState, useEffect } from 'react';
import { Search, MapPin, Shield, FileSignature, Smartphone, TrendingUp, Building2, Sparkles, Home as HomeIcon, Users, Map } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';
import QuickSearch from '@/features/property/components/QuickSearch';
import { FormatService } from '@/services/format/formatService';
import MapWrapper from '@/shared/ui/MapWrapper';
import { TrustSection, TestimonialsCarousel } from '@/features/trust';

type Property = Database['public']['Tables']['properties']['Row'];

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'disponible')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setProperties(data || []);

      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'disponible');

      setTotalProperties(count || 0);
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity) {
      window.location.href = `/recherche?city=${encodeURIComponent(searchCity)}`;
    } else {
      window.location.href = '/recherche';
    }
  };

  return (
    <div className="min-h-screen custom-cursor">
      <section
        className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-white py-20 md:py-32"
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight px-4 text-gray-900">
              Trouvez votre logement idéal en Côte d'Ivoire
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto px-4 leading-relaxed">
              Vérification ANSUT • Paiement sécurisé • Signature électronique
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-2 bg-white rounded-2xl shadow-lg p-2">
              <div className="flex-1 w-full flex items-center px-4 py-3">
                <MapPin className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Abidjan, Cocody, Plateau..."
                  className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-base"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <Search className="h-5 w-5" />
                <span>Rechercher</span>
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <button onClick={() => {setSearchCity('Abidjan'); handleSearch({preventDefault: () => {}});}} className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm">
              Abidjan
            </button>
            <button onClick={() => {setSearchCity('Cocody'); handleSearch({preventDefault: () => {}});}} className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm">
              Cocody
            </button>
            <button onClick={() => {setSearchCity('Plateau'); handleSearch({preventDefault: () => {}});}} className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm">
              Plateau
            </button>
          </div>
        </div>


      </section>

      <section className="py-12 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <QuickSearch />
        </div>
      </section>

      <TrustSection />

      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-orange-100 rounded-full">
              <span className="text-orange-700 font-bold text-sm">L'IMMOBILIER RÉINVENTÉ</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Une plateforme complète pour tous vos besoins
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              De la recherche au paiement, en passant par la signature électronique, tout est pensé pour simplifier votre parcours immobilier
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Signature électronique sécurisée</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Sécurité et protection des données assurées. Tous les contrats sont signés électroniquement via CryptoNeo et marqués d'un cachet électronique visible garantissant leur authenticité.
                    </p>
                    <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-orange-50 rounded-full">
                      <Shield className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-semibold text-orange-700">Contrats certifiés</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center">
                    <FileSignature className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Signature électronique légale</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Contrats 100% digitaux avec CryptoNeo, conformes à la réglementation ivoirienne. Plus besoin de déplacement, signez depuis chez vous.
                    </p>
                    <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-orange-50 rounded-full">
                      <Sparkles className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-semibold text-orange-700">Valeur juridique garantie</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Smartphone className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Paiement Mobile Money</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Orange Money, MTN Money, Moov Money et Carte bancaire. Paiements instantanés et sécurisés avec notifications en temps réel.
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="px-3 py-2 bg-orange-50 rounded-lg text-center">
                        <span className="text-xs font-bold text-orange-700">Orange</span>
                      </div>
                      <div className="px-3 py-2 bg-yellow-50 rounded-lg text-center">
                        <span className="text-xs font-bold text-yellow-700">MTN</span>
                      </div>
                      <div className="px-3 py-2 bg-blue-50 rounded-lg text-center">
                        <span className="text-xs font-bold text-blue-700">Moov</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="sticky top-24">
                <div className="relative">
                  <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                    <div className="mb-6">
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">L'innovation au service de l'immobilier</h3>
                      <p className="text-gray-600">Technologie ivoirienne, pour les Ivoiriens</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-olive-50 to-green-50 rounded-xl border-2 border-olive-200">
                        <div className="flex-shrink-0 w-12 h-12 bg-olive-500 rounded-full flex items-center justify-center">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-2xl font-bold text-gray-900">100%</div>
                          <div className="text-sm text-gray-600">Utilisateurs vérifiés</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
                        <div className="flex-shrink-0 w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
                          <FileSignature className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-2xl font-bold text-gray-900">100%</div>
                          <div className="text-sm text-gray-600">Digital & Sans papier</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                        <div className="flex-shrink-0 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-2xl font-bold text-gray-900">{totalProperties}+</div>
                          <div className="text-sm text-gray-600">Propriétés disponibles</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-coral-50 to-pink-50 rounded-xl border-2 border-coral-200">
                        <div className="flex-shrink-0 w-12 h-12 bg-coral-500 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-2xl font-bold text-gray-900">24/7</div>
                          <div className="text-sm text-gray-600">Support disponible</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-6 bg-orange-500 rounded-2xl text-white">
                      <div className="flex items-center space-x-3 mb-3">
                        <Sparkles className="h-6 w-6" />
                        <span className="font-bold text-lg">Prêt à commencer ?</span>
                      </div>
                      <p className="text-white/90 mb-4">Rejoignez des milliers d'utilisateurs qui ont trouvé leur logement idéal</p>
                      <a href="/recherche" className="block w-full text-center bg-white text-orange-600 font-bold py-3 px-6 rounded-xl hover:bg-orange-50 transition-colors">
                        Découvrir les logements
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 relative overflow-hidden">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                Propriétés récentes
              </h2>
              <p className="text-gray-600 text-lg">Découvrez les dernières offres disponibles</p>
            </div>
            <a
              href="/recherche"
              className="mt-4 md:mt-0 btn-secondary flex items-center space-x-2"
            >
              <span>Voir les {totalProperties} propriétés</span>
              <TrendingUp className="h-5 w-5" />
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {properties.map((property, index) => (
                <a
                  key={property.id}
                  href={`/propriete/${property.id}`}
                  className="card-scrapbook overflow-hidden group"
                  style={{
                    transform: `rotate(${index % 2 === 0 ? '-1deg' : '1deg'})`,
                  }}
                >
                  <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {property.main_image ? (
                      <img
                        src={property.main_image}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Building2 className="h-20 w-20" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-terracotta-500 to-coral-500 text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-glow transform -rotate-3 group-hover:rotate-0 transition-transform">
                      {FormatService.formatCurrency(property.monthly_rent)}/mois
                    </div>
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-xl text-xs font-bold text-gray-800 capitalize shadow-lg">
                      {property.property_type}
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-white to-amber-50/30">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-terracotta-600 transition-colors line-clamp-2">
                      {property.title}
                    </h3>

                    <p className="text-gray-600 flex items-center space-x-2 text-sm mb-4">
                      <MapPin className="h-4 w-4 text-terracotta-500 flex-shrink-0" />
                      <span className="line-clamp-1">{property.city}, {property.neighborhood || 'Côte d\'Ivoire'}</span>
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-600 border-t border-gray-200 pt-4">
                      <div className="flex items-center space-x-1">
                        <HomeIcon className="h-4 w-4 text-olive-600" />
                        <span className="font-semibold">{property.bedrooms || 1} ch.</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-cyan-600" />
                        <span className="font-semibold">{property.bathrooms || 1} SDB</span>
                      </div>
                      {property.surface_area && (
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold text-coral-600">{property.surface_area}m²</span>
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-amber-50 to-coral-50 rounded-3xl">
              <Building2 className="h-20 w-20 text-terracotta-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600">Aucune propriété disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      <TestimonialsCarousel />

      <section className="py-20 bg-gradient-to-br from-amber-50 to-coral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="text-gradient">Explorez</span> par Quartier
            </h2>
            <p className="text-gray-600 text-lg">
              Découvrez la localisation des propriétés disponibles à Abidjan
            </p>
          </div>

          <div className="card-scrapbook overflow-hidden">
              <MapWrapper
                properties={(properties || [])
                  .filter(p => p.longitude && p.latitude)
                  .map(p => ({
                    id: p.id,
                    title: p.title,
                    monthly_rent: p.monthly_rent,
                    longitude: p.longitude!,
                    latitude: p.latitude!,
                  status: p.status,
                  images: p.images as string[],
                  city: p.city,
                  neighborhood: p.neighborhood,
                }))}
                zoom={12}
                height="500px"
                fitBounds={properties.length > 0}
                onMarkerClick={(property) => {
                  window.location.href = `/propriete/${property.id}`;
                }}
              />
          </div>

          <div className="mt-8 text-center">
            <a
              href="/recherche"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Map className="h-5 w-5" />
              <span>Explorer toutes les propriétés</span>
            </a>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-terracotta-500 via-coral-500 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <span className="text-white font-bold text-sm">SIMPLE ET RAPIDE</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              En 4 étapes simples, trouvez votre logement et signez votre contrat
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group relative">
              <div className="absolute -inset-1 bg-white/30 rounded-3xl blur"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-terracotta-400 to-coral-400 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl transform rotate-12 group-hover:rotate-0 transition-transform">
                  1
                </div>
                <div className="mt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-olive-100 to-olive-200 rounded-2xl flex items-center justify-center mb-6">
                    <Search className="h-8 w-8 text-olive-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Recherchez</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Parcourez nos milliers d'annonces vérifiées et trouvez le logement qui vous correspond
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 bg-white/30 rounded-3xl blur"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl transform rotate-12 group-hover:rotate-0 transition-transform">
                  2
                </div>
                <div className="mt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-2xl flex items-center justify-center mb-6">
                    <Shield className="h-8 w-8 text-cyan-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Vérifiez votre identité</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Vérification d'identité officielle via ONECI + biométrie pour établir la confiance
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 bg-white/30 rounded-3xl blur"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl transform rotate-12 group-hover:rotate-0 transition-transform">
                  3
                </div>
                <div className="mt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mb-6">
                    <FileSignature className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Signez</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Signature électronique légale avec CryptoNeo. Tout se fait en ligne, sans déplacement
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 bg-white/30 rounded-3xl blur"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl transform rotate-12 group-hover:rotate-0 transition-transform">
                  4
                </div>
                <div className="mt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6">
                    <HomeIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Emménagez</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Payez via Mobile Money et emménagez dans votre nouveau logement en toute sérénité
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="inline-block bg-white rounded-3xl p-10 shadow-2xl max-w-2xl">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Prêt à trouver votre logement idéal ?
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Rejoignez des milliers d'Ivoiriens qui ont déjà trouvé leur bonheur
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/inscription" className="btn-primary px-8 py-4 text-lg">
                  Créer mon compte gratuitement
                </a>
                <a href="/recherche" className="bg-white border-3 border-terracotta-500 text-terracotta-600 font-bold px-8 py-4 rounded-2xl hover:bg-terracotta-50 transition-all text-lg">
                  Parcourir les annonces
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-terracotta-400">{totalProperties}+</div>
              <div className="text-gray-400">Propriétés</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-cyan-400">100%</div>
              <div className="text-gray-400">Vérifiés</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-amber-400">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-400">100%</div>
              <div className="text-gray-400">Digital</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
