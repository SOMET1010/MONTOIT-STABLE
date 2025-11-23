import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Bed, Bath, Maximize2, Calendar, Shield, MessageCircle, Eye, Heart, Share2 } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import type { Database } from '@/shared/lib/database.types';
import {
  ImageGalleryPremium,
  ButtonPremium,
  CardPremium,
  BadgePremium,
  ANSUTBadge,
  toast,
} from '@/shared/components/premium';

type Property = Database['public']['Tables']['properties']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export default function PropertyDetailPagePremium() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) {
      loadProperty(id);
      incrementViewCount(id);
      if (user) {
        checkFavoriteStatus(id);
      }
    }
  }, [id, user]);

  const loadProperty = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error('Propriété introuvable', 'Cette propriété n\'existe pas');
        navigate('/recherche');
        return;
      }

      setProperty(data);
      loadOwner(data.owner_id);
    } catch (error) {
      console.error('Error loading property:', error);
      toast.error('Erreur', 'Impossible de charger la propriété');
    } finally {
      setLoading(false);
    }
  };

  const loadOwner = async (ownerId: string) => {
    try {
      const { data, error } = await supabase
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

  const incrementViewCount = async (propertyId: string) => {
    try {
      await supabase.rpc('increment_view_count', {
        property_id: propertyId,
      });
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
      toast.warning('Connexion requise', 'Connectez-vous pour ajouter des favoris');
      return;
    }

    try {
      if (isFavorite && favoriteId) {
        await supabase
          .from('property_favorites')
          .delete()
          .eq('id', favoriteId);

        setIsFavorite(false);
        setFavoriteId(null);
        toast.success('Retiré des favoris', 'Propriété retirée de vos favoris');
      } else {
        const { data, error } = await supabase
          .from('property_favorites')
          .insert({
            user_id: user.id,
            property_id: property.id,
          })
          .select()
          .single();

        if (error) throw error;

        setIsFavorite(true);
        setFavoriteId(data.id);
        toast.success('Ajouté aux favoris', 'Propriété ajoutée à vos favoris');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erreur', 'Impossible de modifier les favoris');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title || 'Propriété Mon Toit',
          url,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Lien copié', 'Le lien a été copié dans le presse-papiers');
      } catch (error) {
        toast.error('Erreur', 'Impossible de copier le lien');
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !property) {
      toast.warning('Connexion requise', 'Connectez-vous pour contacter le propriétaire');
      return;
    }

    if (!message.trim()) {
      toast.warning('Message vide', 'Veuillez saisir un message');
      return;
    }

    setSending(true);

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: property.owner_id,
        content: message,
      });

      if (error) throw error;

      toast.success('Message envoyé', 'Votre message a été envoyé au propriétaire');
      setMessage('');
      setShowContactForm(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur', 'Impossible d\'envoyer le message');
    } finally {
      setSending(false);
    }
  };

  const handleApply = () => {
    if (!user) {
      toast.warning('Connexion requise', 'Connectez-vous pour postuler');
      navigate('/connexion');
      return;
    }
    navigate(`/candidature/${property?.id}`);
  };

  const handleScheduleVisit = () => {
    if (!user) {
      toast.warning('Connexion requise', 'Connectez-vous pour planifier une visite');
      navigate('/connexion');
      return;
    }
    navigate(`/visiter/${property?.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Chargement de la propriété...</p>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const images = property.main_image
    ? [property.main_image, ...(property.images || []).filter((img) => img !== property.main_image)]
    : property.images || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Retour</span>
            </button>

            {/* Price & CTA */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm text-neutral-600">Prix mensuel</p>
                <p className="text-2xl font-bold text-primary-600">
                  {property.monthly_rent.toLocaleString()} FCFA
                </p>
              </div>
              <ButtonPremium variant="primary" size="lg" onClick={handleApply}>
                Postuler maintenant
              </ButtonPremium>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <ImageGalleryPremium images={images} alt={property.title} />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Badges */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">{property.title}</h1>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <MapPin className="h-5 w-5" />
                    <span>
                      {property.city}
                      {property.neighborhood && `, ${property.neighborhood}`}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleFavorite}
                    className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
                    aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Heart className={`h-6 w-6 ${isFavorite ? 'fill-primary-500 text-primary-500' : 'text-neutral-400'}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
                    aria-label="Partager"
                  >
                    <Share2 className="h-6 w-6 text-neutral-400" />
                  </button>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {property.is_verified && <ANSUTBadge />}
                <BadgePremium variant="neutral">{property.property_type}</BadgePremium>
                <BadgePremium variant="success">Disponible</BadgePremium>
              </div>
            </div>

            {/* Features */}
            <CardPremium variant="glass" padding="lg">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Caractéristiques</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <Bed className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-neutral-600">Chambres</p>
                    <p className="font-semibold text-neutral-900">{property.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Bath className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-neutral-600">Salles de bain</p>
                    <p className="font-semibold text-neutral-900">{property.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Maximize2 className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-neutral-600">Surface</p>
                    <p className="font-semibold text-neutral-900">{property.area} m²</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-neutral-600">Vues</p>
                    <p className="font-semibold text-neutral-900">{property.view_count || 0}</p>
                  </div>
                </div>
              </div>
            </CardPremium>

            {/* Description */}
            <CardPremium variant="default" padding="lg">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Description</h2>
              <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                {property.description || 'Aucune description disponible.'}
              </p>
            </CardPremium>

            {/* Amenities */}
            {(property.is_furnished || property.has_parking || property.has_ac) && (
              <CardPremium variant="default" padding="lg">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Équipements</h2>
                <div className="flex flex-wrap gap-2">
                  {property.is_furnished && <BadgePremium variant="info">Meublé</BadgePremium>}
                  {property.has_parking && <BadgePremium variant="info">Parking</BadgePremium>}
                  {property.has_ac && <BadgePremium variant="info">Climatisation</BadgePremium>}
                </div>
              </CardPremium>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <CardPremium variant="elevated" padding="lg">
              <div className="text-center mb-6">
                <p className="text-sm text-neutral-600 mb-1">Prix mensuel</p>
                <p className="text-4xl font-bold text-primary-600">
                  {property.monthly_rent.toLocaleString()}
                  <span className="text-lg text-neutral-600"> FCFA</span>
                </p>
              </div>

              <div className="space-y-3">
                <ButtonPremium variant="primary" size="lg" fullWidth onClick={handleApply}>
                  Postuler
                </ButtonPremium>
                <ButtonPremium variant="secondary" size="lg" fullWidth onClick={handleScheduleVisit} leftIcon={<Calendar className="h-5 w-5" />}>
                  Planifier une visite
                </ButtonPremium>
                <ButtonPremium
                  variant="ghost"
                  size="lg"
                  fullWidth
                  onClick={() => setShowContactForm(!showContactForm)}
                  leftIcon={<MessageCircle className="h-5 w-5" />}
                >
                  Contacter le propriétaire
                </ButtonPremium>
              </div>
            </CardPremium>

            {/* Contact Form */}
            {showContactForm && (
              <CardPremium variant="glass" padding="lg">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Envoyer un message</h3>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Votre message..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border-2 border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                  />
                  <ButtonPremium variant="primary" size="md" fullWidth type="submit" isLoading={sending}>
                    Envoyer
                  </ButtonPremium>
                </form>
              </CardPremium>
            )}

            {/* Owner Info */}
            {owner && (
              <CardPremium variant="default" padding="lg">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Propriétaire</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-lg">
                      {owner.full_name?.charAt(0) || 'P'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{owner.full_name || 'Propriétaire'}</p>
                    <p className="text-sm text-neutral-600">Membre depuis {new Date(owner.created_at).getFullYear()}</p>
                  </div>
                </div>
              </CardPremium>
            )}

            {/* Trust Badge */}
            {property.is_verified && (
              <CardPremium variant="glass" padding="lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Propriété vérifiée ANSUT</h3>
                    <p className="text-sm text-neutral-600">
                      Cette propriété a été vérifiée par l'ANSUT et le propriétaire a été authentifié via ONECI.
                    </p>
                  </div>
                </div>
              </CardPremium>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
