import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MessageCircle, Send, ArrowLeft, Home } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';
import Breadcrumb from '@/shared/components/navigation/Breadcrumb';

type Property = Database['public']['Tables']['properties']['Row'];

export default function NewMessagePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('property');

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (propertyId) {
      loadProperty(propertyId);
    } else {
      setLoading(false);
    }
  }, [propertyId]);

  const loadProperty = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (err) {
      console.error('Error loading property:', err);
      setError('Impossible de charger les informations de la propriété');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError('Veuillez saisir un message');
      return;
    }

    setSending(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/auth');
        return;
      }

      if (!property) {
        setError('Propriété non spécifiée');
        return;
      }

      const ownerId = property.owner_id;
      if (!ownerId) {
        setError('Propriétaire non trouvé');
        return;
      }

      let conversationId: string | null = null;

      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${ownerId}),and(participant_1.eq.${ownerId},participant_2.eq.${user.id})`)
        .eq('property_id', propertyId)
        .maybeSingle();

      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            participant_1: user.id,
            participant_2: ownerId,
            property_id: propertyId,
            last_message_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (convError) throw convError;
        conversationId = newConversation.id;
      }

      if (!conversationId) {
        throw new Error('Impossible de créer la conversation');
      }

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: ownerId,
          content: message,
          application_id: conversationId,
          is_read: false,
        });

      if (messageError) throw messageError;

      const { error: updateError } = await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (updateError) throw updateError;

      setSuccess(true);
      setMessage('');

      setTimeout(() => {
        navigate('/messages');
      }, 2000);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
          <Breadcrumb items={[
            { label: 'Accueil', href: '/' },
            { label: 'Messages', href: '/messages' },
            { label: 'Nouveau message' }
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
            <div className="flex items-center gap-3 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Nouveau message</h1>
                <p className="text-white/90 text-sm">Contactez le propriétaire</p>
              </div>
            </div>
          </div>

          {property && (
            <div className="px-8 py-6 bg-orange-50 border-b border-orange-100">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={property.images?.[0] || '/images/placeholder-property.jpg'}
                    alt={property.title || ''}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg truncate">
                    {property.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {property.city}, {property.neighborhood}
                  </p>
                  <p className="text-orange-600 font-bold text-lg mt-1">
                    {property.monthly_rent?.toLocaleString()} FCFA/mois
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-green-900 mb-1">Message envoyé !</h4>
                  <p className="text-green-700 text-sm">
                    Votre message a été envoyé avec succès. Vous allez être redirigé vers vos messages...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="message" className="block text-sm font-bold text-gray-900 mb-2">
                Votre message *
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none transition-colors resize-none"
                placeholder="Bonjour, je suis intéressé(e) par cette propriété..."
              />
              <p className="text-sm text-gray-500 mt-2">
                {message.length} / 1000 caractères
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-bold text-blue-900 mb-2">💡 Conseils</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Soyez poli et courtois dans votre message</li>
                <li>• Indiquez vos disponibilités pour une visite</li>
                <li>• Posez vos questions sur la propriété</li>
                <li>• Ne partagez pas d'informations personnelles sensibles</li>
              </ul>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={sending || success || !message.trim()}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Envoyer le message</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={sending}
                className="px-6 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>

        {!property && !loading && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
            <Home className="h-12 w-12 text-orange-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Aucune propriété sélectionnée</h3>
            <p className="text-gray-600 mb-4">
              Pour contacter un propriétaire, commencez par sélectionner une propriété.
            </p>
            <button
              onClick={() => navigate('/recherche')}
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
            >
              Rechercher des propriétés
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
