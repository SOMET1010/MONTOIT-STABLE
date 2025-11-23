import { useState, useEffect } from 'react';
import { Home as HomeIcon, Search, TrendingUp, Sparkles, Shield, Clock } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';
import PropertyCard from '@/shared/components/PropertyCard';
import HeroSpectacular from '../components/HeroSpectacular';
import { TrustSection } from '@/shared/components/premium';

type Property = Database['public']['Tables']['properties']['Row'];

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'disponible')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (city: string, type: string, price: string) => {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (type) params.append('type', type);
    if (price) params.append('maxPrice', price);

    window.location.href = `/recherche${params.toString() ? '?' + params.toString() : ''}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSpectacular onSearch={handleSearch} />

      {/* Valeurs/Avantages Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi choisir <span className="bg-gradient-to-r from-terracotta-500 to-coral-500 bg-clip-text text-transparent">Mon Toit</span> ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              La première plateforme ivoirienne avec vérification d'identité ANSUT et paiement mobile
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Avantage 1 */}
            <div className="group relative bg-gradient-to-br from-white to-terracotta-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-terracotta-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-terracotta-500/10 to-coral-500/10 rounded-bl-full"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-terracotta-500 to-coral-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  100% Sécurisé
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Vérification d'identité ANSUT, paiements sécurisés Mobile Money et signature électronique certifiée.
                </p>
              </div>
            </div>

            {/* Avantage 2 */}
            <div className="group relative bg-gradient-to-br from-white to-coral-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-coral-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-coral-500/10 to-amber-500/10 rounded-bl-full"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-coral-500 to-amber-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Rapide et Simple
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Trouvez votre logement en quelques clics, postulez en ligne et signez depuis votre téléphone.
                </p>
              </div>
            </div>

            {/* Avantage 3 */}
            <div className="group relative bg-gradient-to-br from-white to-amber-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-amber-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-terracotta-500/10 rounded-bl-full"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-terracotta-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Pour tous
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Locataires, propriétaires, agents immobiliers... tous les acteurs de l'immobilier réunis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Propriétés Récentes */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Dernières propriétés
              </h2>
              <p className="text-lg text-gray-600">
                Découvrez les logements récemment ajoutés
              </p>
            </div>
            <a
              href="/recherche"
              className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-terracotta-500 to-coral-500 text-white font-semibold rounded-lg hover:shadow-xl transition-all"
            >
              <Search className="w-5 h-5" />
              <span>Voir tout</span>
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <HomeIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune propriété pour le moment
              </h3>
              <p className="text-gray-600 mb-6">
                Les propriétés seront bientôt disponibles
              </p>
              <a
                href="/ajouter-propriete"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-terracotta-500 to-coral-500 text-white font-semibold rounded-lg hover:shadow-xl transition-all"
              >
                Publier une propriété
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Voir tout - Mobile */}
              <div className="mt-8 sm:hidden text-center">
                <a
                  href="/recherche"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-terracotta-500 to-coral-500 text-white font-semibold rounded-lg hover:shadow-xl transition-all"
                >
                  <Search className="w-5 h-5" />
                  <span>Voir toutes les propriétés</span>
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <TrustSection showBadges={true} showTestimonials={true} variant="full" />

      {/* CTA Final */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-terracotta-900 via-terracotta-800 to-coral-700 relative overflow-hidden">
        {/* Pattern background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à trouver votre <span className="text-amber-300">logement idéal</span> ?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Rejoignez des milliers d'Ivoiriens qui ont déjà trouvé leur Mon Toit
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/recherche"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-terracotta-600 font-bold rounded-xl hover:scale-105 hover:shadow-2xl transition-all"
            >
              <Search className="w-5 h-5" />
              <span>Chercher un logement</span>
            </a>
            <a
              href="/ajouter-propriete"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-bold rounded-xl hover:bg-white/20 hover:scale-105 transition-all"
            >
              <TrendingUp className="w-5 h-5" />
              <span>Publier une propriété</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
