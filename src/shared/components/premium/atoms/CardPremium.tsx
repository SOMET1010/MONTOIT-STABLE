import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

export interface CardPremiumProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'bordered';
  hover?: 'lift' | 'glow' | 'scale' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

export const CardPremium = forwardRef<HTMLDivElement, CardPremiumProps>(
  (
    {
      children,
      className,
      variant = 'default',
      hover = 'lift',
      padding = 'md',
      isLoading = false,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = `
      rounded-lg
      transition-all duration-200
      relative overflow-hidden
    `;

    // Variant styles
    const variantStyles = {
      default: `
        bg-white
        border border-neutral-200
        shadow-sm
      `,
      glass: `
        bg-white/60
        backdrop-blur-md
        border border-white/30
        shadow-lg
      `,
      elevated: `
        bg-white
        shadow-xl
        border-none
      `,
      bordered: `
        bg-white
        border-2 border-primary-200
        shadow-none
      `,
    };

    // Hover styles
    const hoverStyles = {
      lift: 'hover:shadow-2xl hover:-translate-y-1',
      glow: 'hover:shadow-glow-orange',
      scale: 'hover:scale-[1.02]',
      none: '',
    };

    // Padding styles
    const paddingStyles = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          hoverStyles[hover],
          paddingStyles[padding],
          isLoading && 'pointer-events-none',
          className
        )}
        {...props}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-sm text-neutral-600">Chargement...</p>
            </div>
          </div>
        )}

        {children}
      </div>
    );
  }
);

CardPremium.displayName = 'CardPremium';

// Card sub-components for better composition
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ children, className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold leading-none tracking-tight text-neutral-900', className)}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ children, className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-neutral-500', className)}
      {...props}
    >
      {children}
    </p>
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-0', className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4 border-t border-neutral-200', className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';
