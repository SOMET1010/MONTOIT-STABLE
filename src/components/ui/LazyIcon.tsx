import React, { Suspense, forwardRef } from 'react';
import { useLucideIcon } from '@/hooks/useLazyImport';

interface LazyIconProps {
  name: string;
  size?: number | string;
  className?: string;
  color?: string;
}

/**
 * Composant pour charger les icônes Lucide de manière optimisée
 */
const LazyIconComponent = forwardRef<any, LazyIconProps>(
  ({ name, size = 24, className, color, ...props }, ref) => {
    const { data: Icon, loading, error } = useLucideIcon(name);

    if (loading) {
      // Skeleton pendant le chargement
      return (
        <div
          className={className}
          style={{
            width: size,
            height: size,
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
          }}
        />
      );
    }

    if (error || !Icon) {
      // Icône de fallback
      return (
        <svg
          ref={ref}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={className}
          {...props}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    }

    return (
      <Icon
        ref={ref}
        size={size}
        className={className}
        color={color}
        {...props}
      />
    );
  }
);

LazyIconComponent.displayName = 'LazyIconComponent';

/**
 * Wrapper avec Suspense pour une meilleure gestion du chargement
 */
export const LazyIcon = ({ name, ...props }: LazyIconProps) => (
  <Suspense
    fallback={
      <div
        style={{
          width: props.size || 24,
          height: props.size || 24,
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
        }}
        className={props.className}
      />
    }
  >
    <LazyIconComponent name={name} {...props} />
  </Suspense>
);