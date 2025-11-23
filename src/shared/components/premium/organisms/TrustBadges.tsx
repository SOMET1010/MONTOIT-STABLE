import React from 'react';
import { Shield, CreditCard, Headphones, CheckCircle } from 'lucide-react';
import { CardPremium } from '../atoms/CardPremium';
import { cn } from '@/shared/utils/cn';

export interface TrustBadgesProps {
  variant?: 'horizontal' | 'vertical';
  showTitle?: boolean;
  className?: string;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({
  variant = 'horizontal',
  showTitle = true,
  className,
}) => {
  const badges = [
    {
      icon: Shield,
      title: 'Vérifié ANSUT',
      description: 'Propriétés certifiées par l\'Agence Nationale de Soutien à l\'Habitat',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      icon: CreditCard,
      title: 'Paiement sécurisé',
      description: 'Transactions protégées et conformes aux normes bancaires',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: Headphones,
      title: 'Support 24/7',
      description: 'Équipe disponible pour vous accompagner à tout moment',
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
  ];

  return (
    <div className={className}>
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Pourquoi choisir Mon Toit ?
          </h2>
          <p className="text-lg text-neutral-600">
            Une plateforme de confiance pour votre recherche de logement
          </p>
        </div>
      )}

      <div
        className={cn(
          'grid gap-6',
          variant === 'horizontal' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'
        )}
      >
        {badges.map((badge, index) => (
          <CardPremium
            key={index}
            variant="glass"
            hoverEffect="lift"
            padding="lg"
            className="group"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110',
                  badge.bgColor
                )}
              >
                <badge.icon className={cn('h-8 w-8', badge.color)} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                {badge.title}
              </h3>

              {/* Description */}
              <p className="text-neutral-600 text-sm leading-relaxed">
                {badge.description}
              </p>

              {/* Check mark */}
              <CheckCircle className="h-5 w-5 text-success mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardPremium>
        ))}
      </div>
    </div>
  );
};

TrustBadges.displayName = 'TrustBadges';
