import { useState, useEffect } from 'react';
import { Search, MapPin, Home as HomeIcon } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';
import PropertyCard from '@/shared/components/PropertyCard';
import ProfileCard from '@/shared/components/ProfileCard';
import FeatureCard from '@/shared/components/FeatureCard';
import Carousel from '@/shared/components/Carousel';
import CityCard from '@/shared/components/CityCard';

type Property = Database['public']['Tables']['properties']['Row'];

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [newProperties, setNewProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    '/images/hero-residence-securisee.jpg',
    '/images/hero-logements-sociaux.jpg',
    '/images/hero-residence-moderne.jpg',
    '/images/hero-immeubles-parking.jpg',
  ];

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadProperties = async () => {
    try {
      // Popular properties (by views)
      const { data: popularData, error: popularError } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'disponible')
        .order('views', { ascending: false })
        .limit(8);

      if (popularError) throw popularError;
      setProperties(popularData || []);

      // New properties (by created_at)
      const { data: newData, error: newError } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'disponible')
        .order('created_at', { ascending: false })
        .limit(8);

      if (newError) throw newError;
      setNewProperties(newData || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
      setNewProperties([]);
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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[500px] sm:h-[600px] bg-gray-900 overflow-hidden">
        {/* Diaporama */}
        {heroImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${image})` }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ))}

        {/* Indicateurs */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Aller à la diapositive ${index + 1}`}
            />
          ))}
        </div>
        
        <div className="relative h-full flex items-center justify-center px-4">
          <div className="w-full max-w-4xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-6 sm:mb-8 px-4 animate-fade-in">
              Trouvez votre logement en Côte d'Ivoire
            </h1>
            
            {/* Search Bar - Mobile First */}
            <form onSubmit={handleSearch} className="glass rounded-2xl sm:rounded-full shadow-premium p-3 sm:p-2 animate-slide-up">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                {/* Where */}
                <div className="flex-1 px-4 sm:px-6 py-3">
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Où ?</label>
                  <input
                    type="text"
                    placeholder="Abidjan, Cocody..."
                    className="w-full bg-transparent text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                  />
                </div>

                {/* Type */}
                <div className="flex-1 px-4 sm:px-6 py-3">
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Type</label>
                  <select
                    className="w-full bg-transparent text-sm sm:text-base text-gray-900 focus:outline-none"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    <option value="">Tous</option>
                    <option value="appartement">Appartement</option>
                    <option value="villa">Villa</option>
                    <option value="studio">Studio</option>
                    <option value="maison">Maison</option>
                  </select>
                </div>

                {/* Price */}
                <div className="flex-1 px-4 sm:px-6 py-3">
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Prix max</label>
                  <input
                    type="text"
                    placeholder="500 000 FCFA"
                    className="w-full bg-transparent text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>

                {/* Search Button */}
                <div className="px-2 py-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 gradient-orange hover:shadow-orange-hover text-white font-semibold rounded-xl sm:rounded-full transition-all duration-300 flex items-center justify-center gap-2 btn-premium"
                  >
                    <Search className="h-5 w-5" />
                    <span>Rechercher</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Profils Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Qui êtes-vous ?
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Mon Toit accompagne chaque acteur de la location
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <ProfileCard
              icon="👤"
              title="LOCATAIRE"
              features={[
                "Cherchez votre logement",
                "Postulez avec ANSUT",
                "Payez en Mobile Money",
                "Signez électroniquement"
              ]}
              ctaText="Commencer"
              ctaLink="/recherche"
            />
            <ProfileCard
              icon="🏠"
              title="PROPRIÉTAIRE"
              features={[
                "Publiez gratuitement",
                "Sélectionnez vos locataires",
                "Encaissez en ligne",
                "Gérez vos baux"
              ]}
              ctaText="Commencer"
              ctaLink="/ajouter-propriete"
            />
            <ProfileCard
              icon="🤝"
              title="AGENT IMMOBILIER"
              features={[
                "Gérez vos mandats",
                "Accompagnez vos clients",
                "Facturez vos commissions",
                "Suivez vos transactions"
              ]}
              ctaText="Commencer"
              ctaLink="/agence/tableau-de-bord"
            />
            <ProfileCard
              icon="✓"
              title="GARANT"
              features={[
                "Validez les dossiers",
                "Certifiez les documents",
                "Garantissez les locataires",
                "Sécurisez les transactions"
              ]}
              ctaText="Commencer"
              ctaLink="/agent-confiance/tableau-de-bord"
            />
          </div>
        </div>
      </section>

      {/* Popular Properties */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
          <Carousel
            title="Propriétés populaires à Abidjan"
            viewAllLink="/recherche"
            viewAllText="Voir tout"
          >
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="w-full sm:w-80 flex-shrink-0">
                  <div className="h-64 sm:h-72 bg-gray-200 rounded-xl animate-pulse mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              ))
            ) : properties.length === 0 ? (
              <div className="w-full text-center py-16">
                <HomeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune propriété disponible</p>
              </div>
            ) : (
              properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </Carousel>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center animate-fade-in">
              <div className="text-4xl sm:text-5xl font-bold gradient-text-orange mb-2">
                {properties.length > 0 ? `${properties.length * 125}+` : '1000+'}
              </div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">
                Propriétés
              </div>
            </div>
            <div className="text-center animate-fade-in stagger-1">
              <div className="text-4xl sm:text-5xl font-bold gradient-text-orange mb-2">
                5000+
              </div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">
                Locataires
              </div>
            </div>
            <div className="text-center animate-fade-in stagger-2">
              <div className="text-4xl sm:text-5xl font-bold gradient-text-orange mb-2">
                2500+
              </div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">
                Transactions
              </div>
            </div>
            <div className="text-center animate-fade-in stagger-3">
              <div className="text-4xl sm:text-5xl font-bold gradient-text-orange mb-2">
                15+
              </div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">
                Villes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Properties */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
          <Carousel
            title="Nouveautés"
            subtitle="Découvrez les dernières propriétés ajoutées"
            viewAllLink="/recherche?sort=newest"
            viewAllText="Voir tout"
          >
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="w-full sm:w-80 flex-shrink-0">
                  <div className="h-64 sm:h-72 bg-gray-200 rounded-xl animate-pulse mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              ))
            ) : newProperties.length === 0 ? (
              <div className="w-full text-center py-16">
                <HomeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune propriété disponible</p>
              </div>
            ) : (
              newProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  showBadge={true}
                  badgeText="NOUVEAU"
                />
              ))
            )}
          </Carousel>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Villes populaires
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Découvrez les logements dans les principales villes de Côte d'Ivoire
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <CityCard name="Abidjan" propertyCount={850} />
            <CityCard name="Yamoussoukro" propertyCount={120} />
            <CityCard name="Bouaké" propertyCount={95} />
            <CityCard name="San-Pédro" propertyCount={75} />
            <CityCard name="Korhogo" propertyCount={60} />
            <CityCard name="Daloa" propertyCount={55} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Comment ça marche
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              3 étapes pour trouver votre logement
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-500 text-white rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold mx-auto mb-4 sm:mb-6">
                1
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                🔍 Cherchez
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Trouvez le logement idéal parmi nos milliers d'annonces vérifiées ANSUT.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-500 text-white rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold mx-auto mb-4 sm:mb-6">
                2
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                📄 Postulez
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Créez votre dossier locataire avec vérification ANSUT et documents certifiés.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-500 text-white rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold mx-auto mb-4 sm:mb-6">
                3
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                🏡 Emménagez
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Signez électroniquement et payez en Mobile Money. C'est tout !
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 gradient-orange shadow-orange">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8">
            Rejoignez des milliers d'utilisateurs qui ont trouvé leur logement idéal
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a
              href="/recherche"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-orange-600 font-bold rounded-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-premium text-base sm:text-lg btn-premium"
            >
              Je suis locataire
            </a>
            <a
              href="/ajouter-propriete"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-orange-600 font-bold rounded-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-premium text-base sm:text-lg btn-premium"
            >
              Je suis propriétaire
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
