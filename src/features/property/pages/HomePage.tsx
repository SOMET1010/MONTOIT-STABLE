import { useState, useEffect } from 'react';
import '../styles/homepage-modern.css';
import { Search, MapPin, Star, Shield, TrendingUp, Users, CheckCircle, ArrowRight, Sparkles, Home as HomeIcon } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';
import HeroSlideshow from '../components/HeroSlideshow';

type Property = Database['public']['Tables']['properties']['Row'];

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [statsAnimated, setStatsAnimated] = useState(false);

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
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.append('city', searchCity);
    if (propertyType) params.append('type', propertyType);
    if (maxPrice) params.append('maxPrice', maxPrice);
    
    window.location.href = `/recherche${params.toString() ? '?' + params.toString() : ''}`;
  };

  // Animated counter for stats
  const AnimatedStat = ({ value, label }: { value: number; label: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!statsAnimated) return;
      
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [statsAnimated, value]);

    return (
      <div className="text-center">
        <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
          {count.toLocaleString()}+
        </div>
        <div className="text-gray-600 font-medium">{label}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - 2 Colonnes avec Carrousel */}
      <section className="relative min-h-[600px] md:h-[700px] bg-gradient-to-br from-orange-50 via-white to-red-50 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF6B35' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v6h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Content - 2 Colonnes */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center py-12">
            
            {/* Colonne Gauche - Contenu */}
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg mb-6 animate-fade-in">
                <Shield className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-semibold text-gray-900">Plateforme certifiée ANSUT</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-slide-up">
                Trouvez votre{' '}
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  logement idéal
                </span>
                {' '}en Côte d'Ivoire
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 animate-slide-up stagger-1">
                Location sécurisée • Identité vérifiée • Paiement mobile
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2 animate-slide-up stagger-2">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Où cherchez-vous ?"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="flex-1 outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div className="hidden md:block w-px bg-gray-200"></div>

                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <HomeIcon className="h-5 w-5 text-gray-400" />
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="flex-1 outline-none text-gray-900 bg-transparent cursor-pointer"
                  >
                    <option value="">Type de bien</option>
                    <option value="appartement">Appartement</option>
                    <option value="maison">Maison</option>
                    <option value="villa">Villa</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  <span>Rechercher</span>
                </button>
              </form>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-6 mt-8 animate-fade-in stagger-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">1000+ propriétés</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">5000+ locataires</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">15+ villes</span>
                </div>
              </div>
            </div>

            {/* Colonne Droite - Diaporama Lifestyle */}
            <div className="hidden lg:block relative h-[600px]">
              <HeroSlideshow />
            </div>

          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </section>

      {/* Trust Section - Badges & Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-white border border-orange-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Identité Vérifiée ANSUT</h3>
              <p className="text-gray-600">Tous les utilisateurs sont vérifiés par l'Agence Nationale de Soutien aux Travailleurs</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-white border border-green-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Paiement Sécurisé</h3>
              <p className="text-gray-600">Payez en Mobile Money avec Orange Money, MTN Money ou Moov Money</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Support 24/7</h3>
              <p className="text-gray-600">Notre équipe est disponible pour vous accompagner à chaque étape</p>
            </div>
          </div>

          {/* Testimonials */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ils ont trouvé leur logement avec Mon Toit
            </h2>
            <p className="text-xl text-gray-600">Plus de 5000 locataires satisfaits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Aminata Koné",
                role: "Étudiante à Cocody",
                text: "J'ai trouvé mon studio en 2 jours ! La vérification ANSUT m'a rassurée et le paiement mobile est super pratique.",
                rating: 5,
              },
              {
                name: "Jean-Marc Kouassi",
                role: "Ingénieur au Plateau",
                text: "Excellent service ! J'ai pu visiter 3 appartements le même jour et signer le bail électroniquement. Très moderne !",
                rating: 5,
              },
              {
                name: "Fatou Traoré",
                role: "Commerçante à Yopougon",
                text: "Mon Toit m'a évité les arnaques. Tous les propriétaires sont vérifiés et les annonces sont réelles. Je recommande !",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Animation */}
      <section 
        className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white"
        onMouseEnter={() => setStatsAnimated(true)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Mon Toit en chiffres
            </h2>
            <p className="text-xl text-gray-300">La plateforme immobilière de référence en Côte d'Ivoire</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedStat value={1000} label="Propriétés" />
            <AnimatedStat value={5000} label="Locataires" />
            <AnimatedStat value={2500} label="Transactions" />
            <AnimatedStat value={15} label="Villes" />
          </div>
        </div>
      </section>

      {/* Properties Grid - Premium Style */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Propriétés récentes
              </h2>
              <p className="text-xl text-gray-600">Découvrez les dernières annonces vérifiées</p>
            </div>
            <a 
              href="/recherche"
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border-2 border-orange-500 text-orange-500 font-semibold rounded-xl hover:bg-orange-500 hover:text-white transition-all duration-300"
            >
              <span>Voir tout</span>
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <HomeIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">Aucune propriété disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <a
                  key={property.id}
                  href={`/proprietes/${property.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={property.images?.[0] || '/images/placeholder-property.jpg'}
                      alt={property.title || ''}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Badge Nouveau */}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                      NOUVEAU
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-bold text-gray-900">
                        {property.monthly_rent?.toLocaleString() || 'N/A'}
                      </span>
                      <span className="text-gray-500">FCFA/mois</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">
                      {property.title || 'Sans titre'}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{property.city || 'Non spécifié'}, {property.neighborhood || ''}</span>
                    </div>

                    {/* Features */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
                      {property.bedrooms && (
                        <span className="flex items-center gap-1">
                          🛏️ {property.bedrooms} ch
                        </span>
                      )}
                      {property.bathrooms && (
                        <span className="flex items-center gap-1">
                          🚿 {property.bathrooms} sdb
                        </span>
                      )}
                      {property.surface_area && (
                        <span className="flex items-center gap-1">
                          📐 {property.surface_area}m²
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Mobile CTA */}
          <div className="mt-12 text-center md:hidden">
            <a 
              href="/recherche"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300"
            >
              <span>Voir toutes les propriétés</span>
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-red-500 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à trouver votre logement idéal ?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Rejoignez des milliers d'Ivoiriens qui ont déjà trouvé leur chez-soi avec Mon Toit
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/recherche"
              className="px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Search className="h-5 w-5" />
              <span>Je cherche un logement</span>
            </a>
            <a
              href="/ajouter-propriete"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-orange-600 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <HomeIcon className="h-5 w-5" />
              <span>Je loue mon bien</span>
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>100% Sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />

            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Support 24/7</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
