import React, { ButtonHTMLAttributes, forwardRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface ButtonPremiumProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  withRipple?: boolean;
}

export const ButtonPremium = forwardRef<HTMLButtonElement, ButtonPremiumProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      withRipple = true,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (withRipple && !disabled && !isLoading) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples((prev) => [...prev, { x, y, id }]);

        // Remove ripple after animation
        setTimeout(() => {
          setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
        }, 600);
      }

      if (onClick && !disabled && !isLoading) {
        onClick(e);
      }
    };

    // Base styles
    const baseStyles = `
      relative inline-flex items-center justify-center
      font-medium rounded-lg
      transition-all duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      overflow-hidden
    `;

    // Variant styles
    const variantStyles = {
      primary: `
        bg-gradient-to-r from-primary-500 to-primary-600
        text-white
        hover:from-primary-600 hover:to-primary-700
        hover:shadow-glow-orange
        focus-visible:ring-primary-500
        active:scale-[0.98]
      `,
      secondary: `
        bg-transparent
        text-primary-600
        border-2 border-primary-500
        hover:bg-primary-500 hover:text-white
        hover:shadow-lg
        focus-visible:ring-primary-500
        active:scale-[0.98]
      `,
      ghost: `
        bg-transparent
        text-neutral-700
        hover:bg-neutral-100
        hover:text-primary-600
        focus-visible:ring-neutral-300
        active:scale-[0.98]
      `,
      danger: `
        bg-gradient-to-r from-error to-red-600
        text-white
        hover:from-red-600 hover:to-red-700
        hover:shadow-lg
        focus-visible:ring-error
        active:scale-[0.98]
      `,
      success: `
        bg-gradient-to-r from-success to-green-600
        text-white
        hover:from-green-600 hover:to-green-700
        hover:shadow-glow-green
        focus-visible:ring-success
        active:scale-[0.98]
      `,
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-4 py-2 text-base min-h-[44px]',
      lg: 'px-6 py-3 text-lg min-h-[48px]',
      xl: 'px-8 py-4 text-xl min-h-[56px]',
    };

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          widthStyles,
          className
        )}
        disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effect */}
        {withRipple && ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
            }}
          />
        ))}

        {/* Loading spinner */}
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}

        {/* Left icon */}
        {!isLoading && leftIcon && (
          <span className="mr-2 flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {/* Button text */}
        <span className="flex-1">{children}</span>

        {/* Right icon */}
        {rightIcon && (
          <span className="ml-2 flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

ButtonPremium.displayName = 'ButtonPremium';

// Ripple animation
const rippleStyles = `
@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 0.5;
  }
  100% {
    width: 500px;
    height: 500px;
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple 0.6s ease-out;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'button-premium-ripple-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = rippleStyles;
    document.head.appendChild(style);
  }
}
