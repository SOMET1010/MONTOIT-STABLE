import { useState } from 'react';
import { Search, MapPin, Home } from 'lucide-react';

interface HeroSpectacularProps {
  onSearch: (city: string, type: string, price: string) => void;
}

export default function HeroSpectacular({ onSearch }: HeroSpectacularProps) {
  const [searchCity, setSearchCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchCity, propertyType, maxPrice);
  };

  return (
    <section
      className="relative bg-gradient-to-br from-terracotta-500 via-coral-500 to-amber-500 overflow-hidden"
      aria-label="Recherche de propriétés"
    >
      {/* Pattern overlay subtil */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Contenu */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        {/* Titre et sous-titre */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Trouvez votre logement en toute confiance
          </h1>
          <p className="text-lg sm:text-xl text-white/90 font-medium flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Identité certifiée
            </span>
            <span className="hidden sm:inline text-white/60">•</span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Paiement sécurisé
            </span>
            <span className="hidden sm:inline text-white/60">•</span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Pour tous les Ivoiriens
            </span>
          </p>
        </div>

        {/* Barre de recherche */}
        <form
          onSubmit={handleSubmit}
          className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Où */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-terracotta-500" />
                Où ?
              </label>
              <input
                type="text"
                placeholder="Abidjan, Cocody..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 outline-none transition-all"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Home className="w-4 h-4 text-terracotta-500" />
                Type
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 outline-none transition-all cursor-pointer bg-white"
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

            {/* Prix max */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prix max
              </label>
              <input
                type="text"
                placeholder="500 000 FCFA"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 outline-none transition-all"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            {/* Bouton */}
            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-terracotta-500 to-coral-500 text-white font-bold rounded-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span>Rechercher</span>
              </button>
            </div>
          </div>
        </form>

        {/* Stats rapides */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto">
          <div className="text-center text-white">
            <div className="text-3xl sm:text-4xl font-bold mb-1">1000+</div>
            <div className="text-sm sm:text-base text-white/90">Propriétés</div>
          </div>
          <div className="text-center text-white">
            <div className="text-3xl sm:text-4xl font-bold mb-1">5000+</div>
            <div className="text-sm sm:text-base text-white/90">Locataires</div>
          </div>
          <div className="text-center text-white">
            <div className="text-3xl sm:text-4xl font-bold mb-1">2500+</div>
            <div className="text-sm sm:text-base text-white/90">Transactions</div>
          </div>
          <div className="text-center text-white">
            <div className="text-3xl sm:text-4xl font-bold mb-1">15+</div>
            <div className="text-sm sm:text-base text-white/90">Villes</div>
          </div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-12 sm:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
        </svg>
      </div>
    </section>
  );
}
