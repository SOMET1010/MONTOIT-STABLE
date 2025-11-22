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
      className="relative min-h-[600px] sm:min-h-[700px] lg:min-h-[750px] bg-gray-900 overflow-hidden"
      aria-label="Recherche de propriétés"
    >
      {/* Image de fond avec effet parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero-residence-moderne.jpg')",
          transform: 'scale(1.1)',
        }}
      >
        {/* Overlay dégradé subtil terracotta */}
        <div className="absolute inset-0 bg-gradient-to-br from-terracotta-900/95 via-terracotta-800/90 to-coral-700/85"></div>

        {/* Overlay pattern subtil */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Contenu - Espace pour le header transparent */}
      <div className="relative h-full">
        {/* Espacement pour le header (70px) */}
        <div className="h-[70px] sm:h-[80px]"></div>

        {/* Contenu Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Titre et sous-titre */}
          <div className="text-center mb-10 sm:mb-14 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl">
              Trouvez votre logement
              <br />
              <span className="text-amber-300">en toute confiance</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/95 font-medium flex flex-wrap items-center justify-center gap-3 sm:gap-6 drop-shadow-lg">
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <svg className="w-5 h-5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Identité certifiée
              </span>
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <svg className="w-5 h-5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Paiement sécurisé
              </span>
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <svg className="w-5 h-5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Pour tous les Ivoiriens
              </span>
            </p>
          </div>

          {/* Barre de recherche avec glassmorphism */}
          <form
            onSubmit={handleSubmit}
            className="max-w-5xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6 border border-white/20 animate-slide-up"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 outline-none transition-all bg-white"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 outline-none transition-all bg-white"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              {/* Bouton */}
              <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-terracotta-500 to-coral-500 text-white font-bold rounded-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Rechercher</span>
                </button>
              </div>
            </div>
          </form>

          {/* Stats rapides avec glassmorphism */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto animate-fade-in-delayed">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1 drop-shadow-lg">1000+</div>
              <div className="text-sm sm:text-base text-white/90 font-medium">Propriétés</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1 drop-shadow-lg">5000+</div>
              <div className="text-sm sm:text-base text-white/90 font-medium">Locataires</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1 drop-shadow-lg">2500+</div>
              <div className="text-sm sm:text-base text-white/90 font-medium">Transactions</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1 drop-shadow-lg">15+</div>
              <div className="text-sm sm:text-base text-white/90 font-medium">Villes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave separator élégant */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-12 sm:h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-white"
          ></path>
        </svg>
      </div>

      {/* Animations CSS */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delayed {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 1s ease-out 0.3s both;
        }
        .animate-fade-in-delayed {
          animation: fade-in-delayed 1s ease-out 0.6s both;
        }
      `}</style>
    </section>
  );
}
