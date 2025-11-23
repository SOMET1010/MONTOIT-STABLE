import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, Heart, Share2, Calendar, MessageCircle, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';
import Breadcrumb from '@/shared/components/navigation/Breadcrumb';

type Property = Database['public']['Tables']['properties']['Row'];

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      loadProperty(id);
    }
  }, [id]);

  const loadProperty = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title || 'Propriété sur Mon Toit',
          text: `Découvrez cette propriété : ${property?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier !');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Propriété introuvable</h2>
          <p className="text-gray-600 mb-6">Cette propriété n'existe pas ou a été supprimée</p>
          <button
            onClick={() => navigate('/recherche')}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  const images = property.images || ['/images/placeholder-property.jpg'];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb & Back */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
          <Breadcrumb items={[
            { label: 'Recherche', href: '/recherche' },
            { label: property.title || 'Propriété' }
          ]} />
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative h-[400px] md:h-[600px] bg-gray-900">
        <img
          src={images[currentImageIndex]}
          alt={property.title || ''}
          className="w-full h-full object-cover"
        />

        {/* Gallery Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
            >
              <ChevronLeft className="h-6 w-6 text-gray-900" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
            >
              <ChevronRight className="h-6 w-6 text-gray-900" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white rounded-full text-sm font-medium">
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-900 hover:bg-white'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
          >
            <Share2 className="h-5 w-5 text-gray-900" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Price */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-5 w-5" />
                    <span>{property.city}, {property.neighborhood}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-orange-500">
                  {property.monthly_rent?.toLocaleString()}
                </span>
                <span className="text-xl text-gray-600">FCFA / mois</span>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.bedrooms && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Bed className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                  <div className="text-sm text-gray-600">Chambres</div>
                </div>
              )}
              {property.bathrooms && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Bath className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                  <div className="text-sm text-gray-600">Salles de bain</div>
                </div>
              )}
              {property.surface_area && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Maximize className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{property.surface_area}</div>
                  <div className="text-sm text-gray-600">m²</div>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">🏠</div>
                <div className="text-lg font-bold text-gray-900 capitalize">{property.property_type}</div>
                <div className="text-sm text-gray-600">Type</div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description || 'Aucune description disponible.'}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Équipements</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Contact */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Contact Card */}
              <div className="bg-white border-2 border-orange-500 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Intéressé par ce bien ?</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/postuler/${property.id}`)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    Postuler maintenant
                  </button>

                  <button
                    onClick={() => navigate(`/visites/planifier/${property.id}`)}
                    className="w-full px-6 py-4 bg-white border-2 border-orange-500 text-orange-500 font-bold rounded-xl hover:bg-orange-50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Planifier une visite</span>
                  </button>

                  <button
                    onClick={() => navigate(`/messages/nouveau?property=${property.id}`)}
                    className="w-full px-6 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Contacter</span>
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                  <p>Réponse généralement sous 24h</p>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                <h4 className="font-bold text-gray-900 mb-3">💡 Conseils de sécurité</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Visitez toujours le bien avant de payer</li>
                  <li>• Vérifiez l'identité du propriétaire</li>
                  <li>• Ne payez jamais en espèces</li>
                  <li>• Utilisez Mon Toit pour tous les paiements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
