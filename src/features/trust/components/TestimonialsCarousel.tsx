import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { Card } from '@/shared/ui/Card';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  comment: string;
  city: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Kouadio Jean',
    role: 'Locataire',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    comment: "J'ai trouvé mon appartement en moins d'une semaine grâce à Mon Toit. La vérification ANSUT m'a rassuré et tout s'est passé très rapidement. Je recommande vivement !",
    city: 'Cocody, Abidjan',
  },
  {
    id: 2,
    name: 'Aya Aminata',
    role: 'Propriétaire',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    comment: "En tant que propriétaire, j'apprécie la sécurité de la plateforme. Les locataires sont vérifiés et les paiements sont sécurisés. Plus de mauvaises surprises !",
    city: 'Plateau, Abidjan',
  },
  {
    id: 3,
    name: 'Yao François',
    role: 'Locataire',
    avatar: 'https://i.pravatar.cc/150?img=33',
    rating: 5,
    comment: "Le chatbot SUTA m'a aidé à éviter une arnaque. Il a détecté des incohérences dans une annonce et m'a alerté. Merci Mon Toit pour cette protection !",
    city: 'Yopougon, Abidjan',
  },
  {
    id: 4,
    name: 'Bamba Marie',
    role: 'Agence Immobilière',
    avatar: 'https://i.pravatar.cc/150?img=9',
    rating: 5,
    comment: "Excellent outil pour notre agence. La gestion des propriétés est simplifiée et nous avons triplé notre nombre de clients en 6 mois. Interface intuitive et efficace.",
    city: 'Marcory, Abidjan',
  },
  {
    id: 5,
    name: 'Koné Ibrahim',
    role: 'Locataire',
    avatar: 'https://i.pravatar.cc/150?img=68',
    rating: 4,
    comment: "Très bon service. J'ai visité 3 appartements en une journée grâce au système de visite. Le propriétaire était vérifié et professionnel. Juste parfait !",
    city: 'Adjamé, Abidjan',
  },
  {
    id: 6,
    name: 'Diabaté Fatou',
    role: 'Propriétaire',
    avatar: 'https://i.pravatar.cc/150?img=20',
    rating: 5,
    comment: "Mon bien s'est loué en 3 jours ! La plateforme est vraiment efficace. Les contrats électroniques facilitent tout et je peux gérer mes locations depuis mon téléphone.",
    city: 'Bouaké',
  },
];

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les témoignages de propriétaires et locataires satisfaits
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <Card className="bg-white shadow-2xl overflow-hidden">
            <div className="p-8 md:p-12">
              {/* Quote Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Quote className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex justify-center mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < currentTestimonial.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Comment */}
              <blockquote className="text-center mb-8">
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed italic">
                  "{currentTestimonial.comment}"
                </p>
              </blockquote>

              {/* Author */}
              <div className="flex flex-col items-center">
                <img
                  src={currentTestimonial.avatar}
                  alt={currentTestimonial.name}
                  className="w-16 h-16 rounded-full mb-4 border-4 border-blue-100"
                />
                <div className="text-center">
                  <p className="font-bold text-lg text-gray-900">{currentTestimonial.name}</p>
                  <p className="text-blue-600 font-medium">{currentTestimonial.role}</p>
                  <p className="text-sm text-gray-500">{currentTestimonial.city}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 p-3 bg-white rounded-full shadow-xl hover:bg-blue-50 transition-all duration-200 transform hover:scale-110 z-10"
            aria-label="Témoignage précédent"
          >
            <ChevronLeft className="h-6 w-6 text-blue-600" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 p-3 bg-white rounded-full shadow-xl hover:bg-blue-50 transition-all duration-200 transform hover:scale-110 z-10"
            aria-label="Témoignage suivant"
          >
            <ChevronRight className="h-6 w-6 text-blue-600" />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-blue-600'
                  : 'w-3 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Aller au témoignage ${index + 1}`}
            />
          ))}
        </div>

        {/* Mini Stats */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">4.9/5</div>
            <div className="text-sm text-gray-600">Note moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">1,200+</div>
            <div className="text-sm text-gray-600">Avis vérifiés</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">98%</div>
            <div className="text-sm text-gray-600">Recommandent</div>
          </div>
        </div>
      </div>
    </section>
  );
}
