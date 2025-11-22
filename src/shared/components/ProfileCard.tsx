interface ProfileCardProps {
  icon: string;
  title: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
}

export default function ProfileCard({ icon, title, features, ctaText, ctaLink }: ProfileCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 text-center hover:border-terracotta-500 dark:hover:border-terracotta-400 shadow-premium hover:shadow-premium-hover transition-all duration-300 card-premium animate-slide-up">
      {/* Icon */}
      <div className="text-4xl sm:text-5xl mb-4">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>

      {/* Features List */}
      <ul className="text-left mb-6 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="text-sm sm:text-base text-gray-600 dark:text-gray-400 flex items-start">
            <span className="text-terracotta-500 dark:text-terracotta-400 font-bold mr-2 flex-shrink-0">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <a
        href={ctaLink}
        className="block w-full px-6 py-3 bg-gradient-to-r from-terracotta-500 to-coral-500 hover:from-terracotta-600 hover:to-coral-600 text-white font-semibold rounded-xl transition-all duration-200 text-sm sm:text-base shadow-md hover:shadow-lg transform hover:scale-105"
      >
        {ctaText}
      </a>
    </div>
  );
}
