import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardData {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'terracotta' | 'coral' | 'amber' | 'green' | 'blue' | 'red';
}

export interface DashboardTemplateProps {
  title: string;
  subtitle?: string;
  stats?: StatCardData[];
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

function StatCard({ data }: { data: StatCardData }) {
  const Icon = data.icon;

  const colorClasses = {
    terracotta: 'from-terracotta-500 to-coral-500',
    coral: 'from-coral-500 to-coral-600',
    amber: 'from-amber-500 to-amber-600',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
  };

  const color = data.color || 'terracotta';

  return (
    <div className="card-premium p-6 hover-lift">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {data.label}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {data.value}
          </p>
          {data.trend && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`text-sm font-semibold ${data.trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {data.trend.isPositive ? '+' : ''}{data.trend.value}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardTemplate({
  title,
  subtitle,
  stats,
  children,
  actions,
  className = '',
}: DashboardTemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-terracotta-50 to-coral-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gradient">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Grid */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 animate-slide-up">
            {stats.map((stat, index) => (
              <StatCard key={index} data={stat} />
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className={className}>
          {children}
        </div>
      </div>
    </div>
  );
}
