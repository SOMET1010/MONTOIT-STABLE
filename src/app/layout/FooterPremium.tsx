import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

export default function FooterPremium() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter l'inscription newsletter
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  // Générer 15 particules aléatoires
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 20}s`,
    duration: `${20 + Math.random() * 10}s`,
  }));

  // Générer 5 particules pour le copyright
  const copyrightParticles = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    left: `${20 + i * 15}%`,
    delay: `${i * 0.8}s`,
  }));

  return (
    <footer className="footer-premium">
      {/* Wave animée en haut */}
      <div className="footer-wave" />

      {/* Particules flottantes */}
      <div className="footer-particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="footer-particle"
            style={{
              left: particle.left,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* À propos */}
          <div>
            <div className="flex items-center space-x-3 mb-6 group">
              <img
                src="/logo-montoit.png"
                alt="Mon Toit Logo"
                className="h-12 w-12 object-contain group-hover:scale-110 transition-all duration-300"
              />
              <span className="text-2xl font-bold text-white">MON TOIT</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Plateforme immobilière certifiée pour un accès universel au logement en Côte d'Ivoire.
            </p>
            
            {/* Social Icons Premium */}
            <div className="flex items-center space-x-3">
              <a href="#" className="footer-social-icon" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="footer-social-icon" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="footer-social-icon" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="footer-social-icon" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="footer-section-title">Liens rapides</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/" className="footer-link">
                  Accueil
                </a>
              </li>
              <li>
                <a href="/recherche" className="footer-link">
                  Rechercher
                </a>
              </li>
              <li>
                <a href="/a-propos" className="footer-link">
                  À propos
                </a>
              </li>
              <li>
                <a href="/comment-ca-marche" className="footer-link">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="/contact" className="footer-link">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="footer-section-title">Légal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/conditions-utilisation" className="footer-link">
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="/politique-confidentialite" className="footer-link">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="/mentions-legales" className="footer-link">
                  Mentions légales
                </a>
              </li>
              <li>
                <a href="/cgv" className="footer-link">
                  CGV
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="footer-section-title">Newsletter</h3>
            <p className="text-sm text-gray-400 mb-4">
              Recevez nos dernières offres et actualités
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="footer-newsletter-input w-full"
              />
              <button
                type="submit"
                className={`footer-newsletter-btn w-full flex items-center justify-center space-x-2 ${
                  subscribed ? 'footer-newsletter-success' : ''
                }`}
              >
                <Send className="h-4 w-4" />
                <span>{subscribed ? 'Inscrit !' : "S'inscrire"}</span>
              </button>
            </form>

            {/* Contact Info */}
            <div className="mt-6 space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-orange-400" />
                <span>+225 XX XX XX XX XX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-orange-400" />
                <span>contact@montoit.ci</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-orange-400" />
                <span>Abidjan, Côte d'Ivoire</span>
              </div>
            </div>
          </div>
        </div>

        {/* Séparateur animé */}
        <div className="footer-separator mb-8" />

        {/* Copyright avec Style */}
        <div className="footer-copyright">
          {/* Particules qui montent */}
          <div className="footer-copyright-particles">
            {copyrightParticles.map((particle) => (
              <div
                key={particle.id}
                className="footer-copyright-particle"
                style={{
                  left: particle.left,
                  animationDelay: particle.delay,
                }}
              />
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 relative z-10">
            <p className="footer-copyright-text text-sm">
              © {new Date().getFullYear()} Mon Toit. Tous droits réservés.
            </p>
            
            <div className="flex items-center space-x-6 text-sm">
              <a href="/aide" className="footer-link">
                Aide
              </a>
              <a href="/faq" className="footer-link">
                FAQ
              </a>
              <a href="/blog" className="footer-link">
                Blog
              </a>
            </div>
          </div>

          {/* Badge ANSUT */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">Certifié ANSUT</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
