import React from 'react';
import { TrustBadges } from './TrustBadges';
import { TestimonialsCarousel, type Testimonial } from './TestimonialsCarousel';
import { cn } from '@/shared/utils/cn';

export interface TrustSectionProps {
  showBadges?: boolean;
  showTestimonials?: boolean;
  customTestimonials?: Testimonial[];
  variant?: 'full' | 'compact';
  className?: string;
}

export const TrustSection: React.FC<TrustSectionProps> = ({
  showBadges = true,
  showTestimonials = true,
  customTestimonials,
  variant = 'full',
  className,
}) => {
  return (
    <section
      className={cn(
        'py-16 bg-gradient-to-br from-neutral-50 via-white to-primary-50/20',
        variant === 'compact' && 'py-12',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges */}
        {showBadges && (
          <div className={showTestimonials ? 'mb-16' : ''}>
            <TrustBadges variant="horizontal" showTitle={true} />
          </div>
        )}

        {/* Testimonials */}
        {showTestimonials && (
          <div>
            <TestimonialsCarousel
              testimonials={customTestimonials}
              autoPlay={true}
              autoPlayInterval={5000}
              showTitle={true}
            />
          </div>
        )}
      </div>
    </section>
  );
};

TrustSection.displayName = 'TrustSection';
