import React, { HTMLAttributes, forwardRef } from 'react';
import { Shield, Sparkles, Star, AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface BadgePremiumProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'ansut' | 'new' | 'featured' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  withIcon?: boolean;
  withPulse?: boolean;
  withGlow?: boolean;
}

export const BadgePremium = forwardRef<HTMLSpanElement, BadgePremiumProps>(
  (
    {
      children,
      className,
      variant = 'neutral',
      size = 'md',
      withIcon = true,
      withPulse = false,
      withGlow = false,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = `
      inline-flex items-center gap-1.5
      font-medium rounded-full
      transition-all duration-200
      whitespace-nowrap
    `;

    // Variant styles
    const variantStyles = {
      ansut: `
        bg-gradient-to-r from-primary-500 to-primary-600
        text-white
        shadow-md
      `,
      new: `
        bg-gradient-to-r from-blue-500 to-blue-600
        text-white
        shadow-md
      `,
      featured: `
        bg-gradient-to-r from-amber-400 to-amber-500
        text-amber-900
        shadow-md
      `,
      success: `
        bg-success-light
        text-green-800
        border border-green-300
      `,
      warning: `
        bg-warning-light
        text-amber-800
        border border-amber-300
      `,
      error: `
        bg-error-light
        text-red-800
        border border-red-300
      `,
      info: `
        bg-info-light
        text-blue-800
        border border-blue-300
      `,
      neutral: `
        bg-neutral-100
        text-neutral-700
        border border-neutral-300
      `,
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    // Icon size
    const iconSizeMap = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    // Get icon based on variant
    const getIcon = () => {
      if (!withIcon) return null;

      const iconClass = iconSizeMap[size];

      switch (variant) {
        case 'ansut':
          return <Shield className={iconClass} />;
        case 'new':
          return <Sparkles className={iconClass} />;
        case 'featured':
          return <Star className={iconClass} />;
        case 'success':
          return <CheckCircle2 className={iconClass} />;
        case 'warning':
          return <AlertCircle className={iconClass} />;
        case 'error':
          return <XCircle className={iconClass} />;
        case 'info':
          return <Info className={iconClass} />;
        default:
          return null;
      }
    };

    // Pulse animation
    const pulseStyles = withPulse ? 'animate-pulse' : '';

    // Glow effect
    const glowStyles = withGlow
      ? variant === 'ansut'
        ? 'shadow-glow-orange'
        : variant === 'new' || variant === 'info'
        ? 'shadow-glow-blue'
        : variant === 'success'
        ? 'shadow-glow-green'
        : ''
      : '';

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          pulseStyles,
          glowStyles,
          className
        )}
        {...props}
      >
        {getIcon()}
        {children}
      </span>
    );
  }
);

BadgePremium.displayName = 'BadgePremium';

// Specialized badge variants for common use cases
export const ANSUTBadge = forwardRef<HTMLSpanElement, Omit<BadgePremiumProps, 'variant'>>(
  (props, ref) => (
    <BadgePremium ref={ref} variant="ansut" withGlow {...props}>
      Vérifié ANSUT
    </BadgePremium>
  )
);
ANSUTBadge.displayName = 'ANSUTBadge';

export const NewBadge = forwardRef<HTMLSpanElement, Omit<BadgePremiumProps, 'variant'>>(
  (props, ref) => (
    <BadgePremium ref={ref} variant="new" withPulse {...props}>
      Nouveau
    </BadgePremium>
  )
);
NewBadge.displayName = 'NewBadge';

export const FeaturedBadge = forwardRef<HTMLSpanElement, Omit<BadgePremiumProps, 'variant'>>(
  (props, ref) => (
    <BadgePremium ref={ref} variant="featured" withGlow {...props}>
      En vedette
    </BadgePremium>
  )
);
FeaturedBadge.displayName = 'FeaturedBadge';
