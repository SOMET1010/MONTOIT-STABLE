import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface HeroSpectacularProps {
  onSearch: (city: string, type: string, price: string) => void;
}

export default function HeroSpectacular({ onSearch }: HeroSpectacularProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchCity, setSearchCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [titleVisible, setTitleVisible] = useState(false);

  const heroImages = [
    '/images/hero/hero1.jpg',
    '/images/hero/hero2.jpg',
    '/images/hero/hero3.jpg',
    '/images/hero/hero4.jpg',
  ];

  const title = "Trouvez votre logement en toute confiance";
  const subtitle = "Identité certifiée • Paiement sécurisé • Pour tous les Ivoiriens";

  // Auto-rotation diaporama
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animation titre lettre par lettre
  useEffect(() => {
    setTimeout(() => setTitleVisible(true), 300);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchCity, propertyType, maxPrice);
  };

  // Générer particules
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 15}s`,
    duration: `${15 + Math.random() * 10}s`,
  }));

  return (
    <section className="relative h-[500px] sm:h-[600px] bg-gray-900 overflow-hidden">
      {/* Diaporama avec effet blur artistique */}
      {heroImages.map((image, index) => (
        <div
          key={image}
          className={`hero-slide-image absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${image})` }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
      ))}

      {/* Vignette cinématique */}
      <div className="hero-vignette"></div>

      {/* Particules flottantes */}
      <div className="hero-particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="hero-particle"
            style={{
              left: particle.left,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      {/* Waves animées */}
      <div className="hero-waves">
        <div className="hero-wave"></div>
        <div className="hero-wave"></div>
        <div className="hero-wave"></div>
      </div>

      {/* Contenu principal */}
      <div className="relative h-full flex items-center justify-center px-4 z-10">
        <div className="w-full max-w-4xl">
          {/* Titre avec effet spectaculaire */}
          <div className="text-center mb-6 sm:mb-8 px-4 hero-glow-orange">
            <h1 className="hero-title-spectacular text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
              {titleVisible && title.split('').map((char, index) => (
                <span
                  key={index}
                  className="hero-title-letter"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>
            <p className="hero-subtitle-spectacular text-base sm:text-lg md:text-2xl font-medium px-4">
              {subtitle}
            </p>
          </div>

          {/* Search Bar avec glassmorphism avancé */}
          <form
            onSubmit={handleSubmit}
            className="hero-search-spectacular rounded-2xl sm:rounded-full p-3 sm:p-2"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center divide-y sm:divide-y-0 sm:divide-x divide-white/20">
              {/* Où */}
              <div className="flex-1 px-4 sm:px-6 py-3">
                <label className="block text-xs font-semibold text-white/90 mb-1">
                  Où ?
                </label>
                <input
                  type="text"
                  placeholder="Abidjan, Cocody..."
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder-white/60 focus:outline-none"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />
              </div>

              {/* Type */}
              <div className="flex-1 px-4 sm:px-6 py-3">
                <label className="block text-xs font-semibold text-white/90 mb-1">
                  Type
                </label>
                <select
                  className="w-full bg-transparent text-sm sm:text-base text-white focus:outline-none cursor-pointer"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  <option value="" className="bg-gray-900">Tous</option>
                  <option value="appartement" className="bg-gray-900">Appartement</option>
                  <option value="villa" className="bg-gray-900">Villa</option>
                  <option value="studio" className="bg-gray-900">Studio</option>
                  <option value="maison" className="bg-gray-900">Maison</option>
                </select>
              </div>

              {/* Prix max */}
              <div className="flex-1 px-4 sm:px-6 py-3">
                <label className="block text-xs font-semibold text-white/90 mb-1">
                  Prix max
                </label>
                <input
                  type="text"
                  placeholder="500 000 FCFA"
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder-white/60 focus:outline-none"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              {/* Bouton Rechercher avec ripple */}
              <div className="px-2 py-2">
                <button
                  type="submit"
                  className="hero-button-ripple w-full sm:w-auto px-6 sm:px-8 py-3 gradient-orange hover:shadow-orange-hover text-white font-semibold rounded-xl sm:rounded-full transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Search className="h-5 w-5 hero-icon-animated" />
                  <span>Rechercher</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Indicateurs premium */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
            aria-label={`Aller à la diapositive ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
