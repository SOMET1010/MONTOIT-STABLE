import { ReactNode } from 'react';
import Breadcrumb from '../Breadcrumb';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageTemplateProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

export default function PageTemplate({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
  maxWidth = 'xl',
  className = '',
}: PageTemplateProps) {
  const maxWidthClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-[1400px]',
    full: 'max-w-full',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-terracotta-50 to-coral-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8`}>
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="mb-4">
              <Breadcrumb items={breadcrumbs} />
            </div>
          )}

          {/* Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-gradient animate-fade-in">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-400 animate-fade-in">
                  {subtitle}
                </p>
              )}
            </div>

            {actions && (
              <div className="flex-shrink-0 flex items-center gap-3 animate-fade-in">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${className}`}>
        {children}
      </div>
    </div>
  );
}
