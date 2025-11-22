interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  badge: string;
}

export default function FeatureCard({ icon, title, description, badge }: FeatureCardProps) {
  return (
    <div className="bg-gradient-to-br from-white to-terracotta-50 dark:from-gray-800 dark:to-terracotta-900/20 border border-terracotta-200 dark:border-terracotta-800 rounded-2xl p-6 sm:p-10 text-center shadow-premium hover-lift animate-scale-in">
      {/* Icon */}
      <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4 sm:mb-6">
        {description}
      </p>

      {/* Badge */}
      <span className="inline-block px-4 py-2 bg-gradient-to-r from-terracotta-500 to-coral-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg">
        {badge}
      </span>
    </div>
  );
}
