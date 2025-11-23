import React from 'react';
import { Loader2 } from 'lucide-react';

interface AccessibleButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  onClick,
  type = 'button',
  className = ''
}) => {
  const baseClasses = `
    font-semibold rounded-lg transition-all duration-200 
    focus:outline-none focus:ring-4 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    inline-flex items-center justify-center
    relative overflow-hidden
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-terracotta-500 to-coral-500 
      text-white hover:from-terracotta-600 hover:to-coral-600 
      focus:ring-terracotta-300
      shadow-lg hover:shadow-xl
    `,
    secondary: `
      bg-white border-2 border-terracotta-500 
      text-terracotta-600 hover:bg-terracotta-50 
      focus:ring-terracotta-300
      shadow-md hover:shadow-lg
    `,
    outline: `
      bg-transparent border-2 border-terracotta-500 
      text-terracotta-600 hover:bg-terracotta-50 
      focus:ring-terracotta-300
    `
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[44px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]'
  };

  const combinedClasses = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${sizeClasses[size]} 
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={combinedClasses}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      onClick={onClick}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Chargement...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};