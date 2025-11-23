import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { CardPremium } from '../atoms/CardPremium';
import { ButtonPremium } from '../atoms/ButtonPremium';
import { cn } from '@/shared/utils/cn';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  comment: string;
  avatar?: string;
  date?: string;
}

export interface TestimonialsCarouselProps {
  testimonials?: Testimonial[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showTitle?: boolean;
  className?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Kouassi Ama',
    role: 'Locataire',
    location: 'Cocody, Abidjan',
    rating: 5,
    comment:
      'Grâce à Mon Toit, j\'ai trouvé mon appartement idéal en moins d\'une semaine ! La vérification ANSUT m\'a donné une totale confiance. Le processus était simple et transparent.',
    date: 'Il y a 2 semaines',
  },
  {
    id: '2',
    name: 'Diabaté Moussa',
    role: 'Propriétaire',
    location: 'Plateau, Abidjan',
    rating: 5,
    comment:
      'En tant que propriétaire, Mon Toit m\'a permis de trouver des locataires sérieux rapidement. La certification ANSUT rassure les deux parties. Je recommande vivement !',
    date: 'Il y a 1 mois',
  },
  {
    id: '3',
    name: 'Touré Fatou',
    role: 'Locataire',
    location: 'Marcory, Abidjan',
    rating: 5,
    comment:
      'Interface moderne et facile à utiliser. J\'ai pu visiter plusieurs propriétés et postuler en ligne. Le support client est très réactif. Une vraie révolution pour la location en Côte d\'Ivoire !',
    date: 'Il y a 3 semaines',
  },
  {
    id: '4',
    name: 'Koné Ibrahim',
    role: 'Propriétaire',
    location: 'Yopougon, Abidjan',
    rating: 5,
    comment:
      'Excellent service ! La plateforme m\'a aidé à gérer mes 3 propriétés efficacement. Les paiements sont sécurisés et le suivi des candidatures est très pratique.',
    date: 'Il y a 1 semaine',
  },
  {
    id: '5',
    name: 'Bamba Aïcha',
    role: 'Locataire',
    location: 'Adjamé, Abidjan',
    rating: 5,
    comment:
      'Je cherchais un studio meublé et j\'ai trouvé exactement ce qu\'il me fallait. Les photos étaient conformes à la réalité et le propriétaire était très professionnel. Merci Mon Toit !',
    date: 'Il y a 5 jours',
  },
];

export const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  testimonials = defaultTestimonials,
  autoPlay = true,
  autoPlayInterval = 5000,
  showTitle = true,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, testimonials.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  if (testimonials.length === 0) return null;

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className={cn('relative', className)}>
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-lg text-neutral-600">
            Des milliers de personnes nous font confiance
          </p>
        </div>
      )}

      {/* Main Testimonial Card */}
      <div className="relative max-w-4xl mx-auto">
        <CardPremium variant="elevated" padding="xl" className="relative overflow-hidden">
          {/* Quote icon */}
          <Quote className="absolute top-4 right-4 h-16 w-16 text-primary-100 opacity-50" />

          {/* Content */}
          <div className="relative z-10">
            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-5 w-5',
                    i < currentTestimonial.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-neutral-300'
                  )}
                />
              ))}
            </div>

            {/* Comment */}
            <p className="text-lg text-neutral-700 leading-relaxed mb-6 italic">
              "{currentTestimonial.comment}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {currentTestimonial.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="font-semibold text-neutral-900 text-lg">
                  {currentTestimonial.name}
                </p>
                <p className="text-sm text-neutral-600">
                  {currentTestimonial.role} • {currentTestimonial.location}
                </p>
                {currentTestimonial.date && (
                  <p className="text-xs text-neutral-500 mt-1">{currentTestimonial.date}</p>
                )}
              </div>
            </div>
          </div>
        </CardPremium>

        {/* Navigation Buttons */}
        {testimonials.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-neutral-50 transition-colors z-20"
              aria-label="Témoignage précédent"
            >
              <ChevronLeft className="h-6 w-6 text-neutral-600" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-neutral-50 transition-colors z-20"
              aria-label="Témoignage suivant"
            >
              <ChevronRight className="h-6 w-6 text-neutral-600" />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {testimonials.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={cn(
                'h-2 rounded-full transition-all',
                index === currentIndex ? 'w-8 bg-primary-600' : 'w-2 bg-neutral-300 hover:bg-neutral-400'
              )}
              aria-label={`Aller au témoignage ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

TestimonialsCarousel.displayName = 'TestimonialsCarousel';
