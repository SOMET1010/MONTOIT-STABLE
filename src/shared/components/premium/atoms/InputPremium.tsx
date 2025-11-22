import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface InputPremiumProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showCharCount?: boolean;
  maxLength?: number;
  variant?: 'default' | 'glass';
}

export const InputPremium = forwardRef<HTMLInputElement, InputPremiumProps>(
  (
    {
      className,
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      showCharCount = false,
      maxLength,
      type = 'text',
      variant = 'default',
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    const hasError = !!error;
    const hasSuccess = !!success;
    const charCount = typeof value === 'string' ? value.length : 0;

    // Base container styles
    const containerStyles = 'relative w-full';

    // Base input styles
    const baseInputStyles = `
      w-full px-4 py-3 rounded-lg
      font-sans text-base
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-1
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    // Variant styles
    const variantInputStyles = {
      default: `
        bg-white
        border-2 border-neutral-300
        text-neutral-900
        placeholder:text-neutral-400
        hover:border-neutral-400
        focus:border-primary-500 focus:ring-primary-500/20
      `,
      glass: `
        bg-white/60
        backdrop-blur-md
        border border-white/30
        text-neutral-900
        placeholder:text-neutral-500
        hover:bg-white/70
        focus:bg-white/80 focus:border-primary-500 focus:ring-primary-500/20
        shadow-lg
      `,
    };

    // State styles
    const stateStyles = hasError
      ? 'border-error focus:border-error focus:ring-error/20'
      : hasSuccess
      ? 'border-success focus:border-success focus:ring-success/20'
      : '';

    // Icon padding
    const iconPadding = leftIcon ? 'pl-11' : rightIcon || isPassword ? 'pr-11' : '';

    // Label styles
    const labelStyles = `
      block mb-2 text-sm font-medium
      ${hasError ? 'text-error' : hasSuccess ? 'text-success' : 'text-neutral-700'}
      ${isFocused ? 'text-primary-600' : ''}
    `;

    return (
      <div className={containerStyles}>
        {/* Label */}
        {label && (
          <label className={labelStyles}>
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              baseInputStyles,
              variantInputStyles[variant],
              stateStyles,
              iconPadding,
              className
            )}
            disabled={disabled}
            maxLength={maxLength}
            value={value}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {/* Right icon or password toggle */}
          {(rightIcon || isPassword || hasError || hasSuccess) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {/* Validation icons */}
              {hasError && (
                <AlertCircle className="h-5 w-5 text-error" aria-hidden="true" />
              )}
              {hasSuccess && (
                <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
              )}

              {/* Custom right icon */}
              {rightIcon && !hasError && !hasSuccess && (
                <span className="text-neutral-400">{rightIcon}</span>
              )}

              {/* Password toggle */}
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Helper text / Error / Success / Character count */}
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="flex-1">
            {error && (
              <p className="text-sm text-error flex items-center gap-1">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </p>
            )}
            {!error && success && (
              <p className="text-sm text-success flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                {success}
              </p>
            )}
            {!error && !success && helperText && (
              <p className="text-sm text-neutral-500">{helperText}</p>
            )}
          </div>

          {/* Character count */}
          {showCharCount && maxLength && (
            <p
              className={cn(
                'text-sm flex-shrink-0',
                charCount > maxLength * 0.9 ? 'text-warning' : 'text-neutral-400'
              )}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

InputPremium.displayName = 'InputPremium';
