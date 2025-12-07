import { useState, useEffect } from 'react';
import { MapPin, Bed, Bath, Home, ParkingCircle, Wind, Sofa, Calendar, Eye, ArrowLeft, Send, Heart, X, ChevronLeft, ChevronRight, Maximize2, Shield, CheckCircle, MessageCircle, Clock, Coins, AlertTriangle, Info } from 'lucide-react';
import { supabasePublic, supabase } from '@/services/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import type { Database } from '@/shared/lib/database.types';
import { usePageMetadata } from '@/hooks/usePageMetadata';
import { createPropertyMetadata } from '@/hooks/usePageMetadata';

type Property = Database['public']['Tables']['properties']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export default function PropertyDetail() {
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalAction, setLoginModalAction] = useState<'apply' | 'visit' | ''>('');

  useEffect(() => {
    const propertyId = window.location.pathname.split('/').pop();
    if (propertyId) {
      loadProperty(propertyId);
      incrementViewCount(propertyId);
      if (user) {
        checkFavoriteStatus(propertyId);
      }
    }
  }, [user]);

  const loadProperty = async (id: string) => {
    try {
      const { data, error } = await supabasePublic
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        window.location.href = '/recherche';
        return;
      }

      setProperty(data);
      loadOwner(data.owner_id);
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOwner = async (ownerId: string) => {
    try {
      const { data, error } = await supabasePublic
        .from('profiles')
        .select('*')
        .eq('id', ownerId)
        .maybeSingle();

      if (error) throw error;
      setOwner(data);
    } catch (error) {
      console.error('Error loading owner:', error);
    }
  };

  const incrementViewCount = async (id: string) => {
    try {
      // Use a simple POST request directly to the RPC endpoint
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/increment_view_count`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          // No Authorization header for public access
        },
        body: JSON.stringify({
          property_id_to_update: id
        })
      });

      if (!response.ok) {
        console.warn('View count increment failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const checkFavoriteStatus = async (propertyId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('property_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsFavorite(true);
        setFavoriteId(data.id);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !property) {
      alert('Veuillez vous connecter pour ajouter des favoris');
      return;
    }

    try {
      if (isFavorite && favoriteId) {
        const { error } = await supabase
          .from('property_favorites')
          .delete()
          .eq('id', favoriteId);

        if (error) throw error;

        setIsFavorite(false);
        setFavoriteId(null);
      } else {
        const { data, error } = await supabase
          .from('property_favorites')
          .insert({
            user_id: user.id,
            property_id: property.id
          })
          .select()
          .single();

        if (error) throw error;

        setIsFavorite(true);
        setFavoriteId(data.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Erreur lors de la modification des favoris');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !property) return;

    setSending(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: property.owner_id,
          content: message,
        });

      if (error) throw error;

      setSuccess('Message envoyé avec succès');
      setMessage('');
      setTimeout(() => {
        setShowContactForm(false);
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleApply = () => {
    if (!user) {
      if (property?.id) {
        sessionStorage.setItem('pendingAction', JSON.stringify({
          action: 'apply',
          propertyId: property.id,
          propertyTitle: property.title,
          propertyPrice: property.monthly_rent
        }));
      }
      setLoginModalAction('apply');
      setShowLoginModal(true);
      return;
    }
    window.location.href = `/candidature/${property?.id}`;
  };

  const handleScheduleVisit = () => {
    if (!user) {
      if (property?.id) {
        sessionStorage.setItem('pendingAction', JSON.stringify({
          action: 'visit',
          propertyId: property.id,
          propertyTitle: property.title,
          propertyPrice: property.monthly_rent
        }));
      }
      setLoginModalAction('visit');
      setShowLoginModal(true);
      return;
    }
    window.location.href = `/visiter/${property?.id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-coral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-terracotta-500"></div>
      </div>
    );
  }

  if (!property) return null;

  const images = property.main_image
    ? [property.main_image, ...(property.images || []).filter(img => img !== property.main_image)]
    : (property.images || []).length > 0
    ? property.images
    : [];

  // Métadonnées pour le SEO et Schema.org
  const propertyType = property.property_type === 'apartment' ? 'Appartement' :
                     property.property_type === 'house' ? 'Maison' :
                     property.property_type === 'villa' ? 'Villa' : 'Studio';

  const { HelmetHead } = usePageMetadata(createPropertyMetadata(
    property.title,
    propertyType,
    property.monthly_rent,
    property.city,
    property.description || '',
    images[0]
  ));

  return (
    <>
      <HelmetHead />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-coral-50 custom-cursor">
      <div className="glass-card border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-terracotta-600 hover:text-terracotta-700 transition-all duration-300 transform hover:scale-105 font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card-scrapbook overflow-hidden mb-6 animate-slide-down">
              {images.length > 0 ? (
                <>
                  <div className="relative h-96 bg-gray-200 group cursor-pointer" onClick={() => { setShowFullscreenGallery(true); setFullscreenImageIndex(selectedImage); }}>
                    <img
                      src={images[selectedImage]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-terracotta-500 to-coral-500 text-white px-6 py-3 rounded-2xl text-lg font-bold shadow-glow-lg animate-glow">
                      {property.monthly_rent.toLocaleString()} FCFA/mois
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Voir en plein écran</span>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium">
                      {selectedImage + 1} / {images.length}
                    </div>
                  </div>
                  {images.length > 1 && (
                    <div className="grid grid-cols-5 gap-2 p-4">
                      {images.slice(0, 10).map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`relative h-20 rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                            selectedImage === index ? 'ring-4 ring-terracotta-500 shadow-glow' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      {images.length > 10 && (
                        <button
                          onClick={() => { setShowFullscreenGallery(true); setFullscreenImageIndex(0); }}
                          className="relative h-20 rounded-lg overflow-hidden bg-gradient-to-br from-terracotta-500 to-coral-500 flex items-center justify-center text-white font-bold hover:scale-105 transition-transform"
                        >
                          +{images.length - 10}
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-96 bg-gray-200 flex items-center justify-center">
                  <Home className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>

            <div className="card-scrapbook p-8 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gradient mb-3">{property.title}</h1>
                  <p className="text-gray-700 flex items-center space-x-2 text-lg">
                    <MapPin className="h-6 w-6 text-terracotta-500" />
                    <span>{property.address}, {property.city}{property.neighborhood ? `, ${property.neighborhood}` : ''}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={toggleFavorite}
                    className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                      isFavorite
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-white text-gray-400 hover:text-red-500 border-2 border-gray-200'
                    }`}
                    title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <div className="flex items-center space-x-2 bg-amber-100 px-4 py-2 rounded-full text-amber-800 font-medium">
                    <Eye className="h-5 w-5" />
                    <span>{property.view_count} vues</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center space-x-3 bg-gradient-to-br from-terracotta-50 to-coral-50 px-5 py-3 rounded-2xl border border-terracotta-200 transform hover:scale-105 transition-all duration-300">
                  <Bed className="h-6 w-6 text-terracotta-600" />
                  <span className="text-gray-900 font-semibold">{property.bedrooms} chambres</span>
                </div>
                <div className="flex items-center space-x-3 bg-gradient-to-br from-cyan-50 to-blue-50 px-5 py-3 rounded-2xl border border-cyan-200 transform hover:scale-105 transition-all duration-300">
                  <Bath className="h-6 w-6 text-cyan-600" />
                  <span className="text-gray-900 font-semibold">{property.bathrooms} salles de bain</span>
                </div>
                {property.surface_area && (
                  <div className="flex items-center space-x-3 bg-gradient-to-br from-olive-50 to-green-50 px-5 py-3 rounded-2xl border border-olive-200 transform hover:scale-105 transition-all duration-300">
                    <Home className="h-6 w-6 text-olive-600" />
                    <span className="text-gray-900 font-semibold">{property.surface_area}m²</span>
                  </div>
                )}
                <div className="bg-gradient-to-r from-terracotta-500 to-coral-500 px-5 py-3 rounded-2xl shadow-glow transform hover:scale-105 transition-all duration-300">
                  <span className="text-white font-semibold capitalize">{property.property_type}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-bold text-gradient mb-4 flex items-center space-x-2">
                  <Home className="h-6 w-6 text-terracotta-500" />
                  <span>Description</span>
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                  {property.description || 'Aucune description disponible.'}
                </p>
              </div>

              <div className="border-t pt-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Équipements</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.is_furnished && (
                    <div className="flex items-center space-x-2">
                      <Sofa className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">Meublé</span>
                    </div>
                  )}
                  {property.has_parking && (
                    <div className="flex items-center space-x-2">
                      <ParkingCircle className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">Parking</span>
                    </div>
                  )}
                  {property.has_ac && (
                    <div className="flex items-center space-x-2">
                      <Wind className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">Climatisation</span>
                    </div>
                  )}
                  {property.has_garden && (
                    <div className="flex items-center space-x-2">
                      <Home className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">Jardin</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Coins className="h-6 w-6 text-terracotta-600 mr-2" />
                  Informations financières complètes
                </h2>
                <div className="space-y-3">
                  <div className="bg-terracotta-50 p-4 rounded-xl border-2 border-terracotta-200 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-bold">Loyer mensuel</span>
                      <span className="font-bold text-2xl text-terracotta-600">{property.monthly_rent.toLocaleString()} FCFA</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">À payer chaque mois</p>
                  </div>

                  {property.deposit_amount && (
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <div className="flex-1">
                        <span className="text-gray-700 font-medium">Dépôt de garantie</span>
                        <p className="text-xs text-gray-500">Paiement unique (restituable à la fin du bail)</p>
                      </div>
                      <span className="font-semibold text-gray-900">{property.deposit_amount.toLocaleString()} FCFA</span>
                    </div>
                  )}

                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <div className="flex-1">
                      <span className="text-gray-700 font-medium">Frais d'agence</span>
                      <p className="text-xs text-gray-500">Généralement 1 mois de loyer (non restituable)</p>
                    </div>
                    <span className="font-semibold text-gray-900">{property.monthly_rent.toLocaleString()} FCFA</span>
                  </div>

                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <div className="flex-1">
                      <span className="text-gray-700 font-medium">Frais de dossier</span>
                      <p className="text-xs text-gray-500">État des lieux, vérifications, formalités</p>
                    </div>
                    <span className="font-semibold text-gray-900">50 000 FCFA</span>
                  </div>

                  {property.charges_amount > 0 ? (
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <div className="flex-1">
                        <span className="text-gray-700 font-medium">Charges mensuelles</span>
                        <p className="text-xs text-gray-500">Eau, électricité, ordures, entretien inclus</p>
                      </div>
                      <span className="font-semibold text-gray-900">{property.charges_amount.toLocaleString()} FCFA</span>
                    </div>
                  ) : (
                    <div className="py-3 border-b border-gray-200">
                      <div className="flex items-center text-amber-600">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Charges non incluses</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Eau, électricité et ordures à la charge du locataire</p>
                    </div>
                  )}

                  <div className="pt-3">
                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <p className="text-sm text-blue-900 font-medium flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        Modalités de paiement
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Paiement mensuel par Mobile Money (Orange, MTN, Moov) ou virement bancaire
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t-2 border-gray-200">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-300">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-900 font-bold text-lg">Total à la signature</span>
                        <span className="text-2xl font-bold text-amber-700">
                          {(property.monthly_rent * 2 + (property.deposit_amount || 0) + 50000).toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p>• Premier loyer: {property.monthly_rent.toLocaleString()} FCFA</p>
                        <p>• Dépôt de garantie: {(property.deposit_amount || 0).toLocaleString()} FCFA</p>
                        <p>• Frais d'agence: {property.monthly_rent.toLocaleString()} FCFA</p>
                        <p>• Frais de dossier: 50 000 FCFA</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 p-4 rounded-xl">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-red-900">Sécurité ANSUT</p>
                        <p className="text-xs text-red-700 mt-1">
                          Ne versez aucun acompte sans avoir reçu la validation du tiers de confiance ANSUT.
                          Tout paiement doit être effectué via la plateforme sécurisée Mon Toit.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Garanties et Sécurité</h2>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 rounded-lg border-2 border-blue-200">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Vérification d'identité ONECI</p>
                      <p className="text-xs text-gray-600">Les propriétaires et locataires vérifient leur identité via l'Office National d'Identification (ONECI) - Document CNI authentifié</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 bg-gradient-to-r from-olive-50 to-green-50 px-4 py-3 rounded-lg border-2 border-olive-200">
                    <Shield className="h-5 w-5 text-olive-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Plateforme certifiée ANSUT</p>
                      <p className="text-xs text-gray-600">Mon Toit est une plateforme officielle soutenue par l'Agence Nationale du Service Universel des Télécommunications de Côte d'Ivoire</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 bg-cyan-50 px-4 py-3 rounded-lg border-2 border-cyan-200">
                    <CheckCircle className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Signature électronique légale</p>
                      <p className="text-xs text-gray-600">Contrat sécurisé via CryptoNeo, conforme à la réglementation ivoirienne</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 bg-coral-50 px-4 py-3 rounded-lg border-2 border-coral-200">
                    <MessageCircle className="h-5 w-5 text-coral-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Paiement Mobile Money sécurisé</p>
                      <p className="text-xs text-gray-600">Orange Money, MTN Money, Moov Money acceptés</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 bg-amber-50 px-4 py-3 rounded-lg border-2 border-amber-200">
                    <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Publié le</p>
                      <p className="text-xs text-gray-600">{new Date(property.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              {owner && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Propriétaire</h3>
                  <div className="flex items-center space-x-3 mb-4">
                    {owner.avatar_url ? (
                      <img src={owner.avatar_url} alt={owner.full_name || 'Propriétaire'} className="h-12 w-12 rounded-full" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                        {owner.full_name?.[0] || 'P'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{owner.full_name || 'Propriétaire'}</p>
                      <p className="text-sm text-gray-600 capitalize">{owner.user_type}</p>
                    </div>
                  </div>
                  {owner.is_verified && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 px-4 py-3 rounded-xl mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        <span className="font-bold text-blue-900">Identité vérifiée ONECI</span>
                      </div>
                      <p className="text-xs text-gray-600 ml-7">Document CNI authentifié par l'Office National d'Identification (ONECI)</p>
                    </div>
                  )}
                </div>
              )}

              {user?.id !== property.owner_id ? (
                <div className="space-y-3">
                  <button
                    onClick={handleApply}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Postuler maintenant</span>
                  </button>
                  <button
                    onClick={handleScheduleVisit}
                    className="w-full bg-gradient-to-r from-orange-500 to-coral-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-coral-600 transition-all font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Planifier une visite</span>
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Bonjour, je suis intéressé par la propriété: ${property.title} - ${property.monthly_rent.toLocaleString()} FCFA/mois. Lien: ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>WhatsApp</span>
                  </a>
                  <button
                    onClick={() => setShowContactForm(!showContactForm)}
                    className="w-full bg-white border-2 border-terracotta-500 text-terracotta-600 py-3 rounded-xl hover:bg-terracotta-50 transition-all font-bold flex items-center justify-center space-x-2 transform hover:scale-105"
                  >
                    <Send className="h-5 w-5" />
                    <span>Envoyer un message</span>
                  </button>

                  {showContactForm && (
                    <form onSubmit={handleSendMessage} className="mt-4 p-4 bg-gray-50 rounded-lg">
                      {error && (
                        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                          {error}
                        </div>
                      )}
                      {success && (
                        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                          {success}
                        </div>
                      )}
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Votre message..."
                        rows={4}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                      />
                      <button
                        type="submit"
                        disabled={sending || !user}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400"
                      >
                        {sending ? 'Envoi...' : 'Envoyer'}
                      </button>
                      {!user && (
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Connectez-vous pour envoyer un message
                        </p>
                      )}
                    </form>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl border border-amber-300">
                  <p className="text-gray-700 font-medium mb-3">🏠 Ceci est votre propriété</p>
                  <a href="/dashboard/proprietaire" className="inline-block btn-primary">
                    Gérer mes propriétés
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {user?.id !== property.owner_id && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 z-40 shadow-2xl">
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg"
            >
              <Calendar className="h-5 w-5" />
              <span>Postuler</span>
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Bonjour, je suis intéressé par la propriété: ${property.title} - ${property.monthly_rent.toLocaleString()} FCFA/mois. Lien: ${window.location.href}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg"
            >
              <MessageCircle className="h-5 w-5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {showFullscreenGallery && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in">
          <button
            onClick={() => setShowFullscreenGallery(false)}
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all z-50"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={() => setFullscreenImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
            className="absolute left-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all z-50"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <button
            onClick={() => setFullscreenImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
            className="absolute right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all z-50"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-lg">
            {fullscreenImageIndex + 1} / {images.length}
          </div>

          <img
            src={images[fullscreenImageIndex]}
            alt={`${property.title} - Image ${fullscreenImageIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />

          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-4">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setFullscreenImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                  fullscreenImageIndex === index ? 'ring-4 ring-terracotta-500' : 'opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-terracotta-100 to-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {loginModalAction === 'apply' ? (
                  <Calendar className="h-8 w-8 text-terracotta-600" />
                ) : (
                  <Calendar className="h-8 w-8 text-orange-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {loginModalAction === 'apply' ? 'Postuler pour ce logement' : 'Planifier une visite'}
              </h2>
              <p className="text-gray-600">
                Veuillez créer un compte ou vous connecter pour continuer
              </p>
            </div>

            {property && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 mb-6">
                <p className="font-bold text-gray-900 text-sm mb-1">{property.title}</p>
                <p className="text-xs text-gray-600 flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{property.city}</span>
                </p>
                <p className="text-terracotta-600 font-bold mt-2">
                  {property.monthly_rent.toLocaleString()} FCFA/mois
                </p>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <a
                href="/inscription"
                className="w-full bg-gradient-to-r from-terracotta-500 to-coral-500 text-white py-3 rounded-xl hover:from-terracotta-600 hover:to-coral-600 transition-all font-bold text-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Créer un compte
              </a>
              <a
                href="/connexion"
                className="w-full bg-white border-2 border-terracotta-500 text-terracotta-600 py-3 rounded-xl hover:bg-terracotta-50 transition-all font-bold text-center transform hover:scale-105"
              >
                Se connecter
              </a>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-start space-x-2 text-xs text-gray-600">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>
                  Après votre inscription ou connexion, vous serez automatiquement redirigé vers {loginModalAction === 'apply' ? 'le formulaire de candidature' : 'la page de planification de visite'} pour ce logement.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
