import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import Button from '@/shared/ui/Button';
import { toast } from '@/shared/hooks/useToast';

interface VoiceSearchProps {
  onTranscript: (transcript: string) => void;
  onError?: (error: string) => void;
}

export default function VoiceSearch({ onTranscript, onError }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'fr-FR';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        onTranscript(text);
        toast.success('Recherche vocale réussie', {
          description: `"${text}"`,
        });
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        let errorMessage = 'Erreur lors de la reconnaissance vocale';

        switch (event.error) {
          case 'no-speech':
            errorMessage = 'Aucune parole détectée. Réessayez.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone non disponible';
            break;
          case 'not-allowed':
            errorMessage = 'Accès au microphone refusé';
            break;
          case 'network':
            errorMessage = 'Erreur réseau. Vérifiez votre connexion.';
            break;
        }

        toast.error(errorMessage);
        onError?.(errorMessage);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, onError]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        toast.info('Parlez maintenant...', {
          description: 'Dites par exemple "Appartement 2 chambres à Cocody"',
        });
      } catch (error) {
        toast.error('Impossible de démarrer la recherche vocale');
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={toggleListening}
        variant={isListening ? 'danger' : 'outline'}
        size="md"
        className={`relative ${isListening ? 'animate-pulse' : ''}`}
        aria-label="Recherche vocale"
      >
        {isListening ? (
          <>
            <MicOff className="h-5 w-5 mr-2" />
            <span>Arrêter</span>
          </>
        ) : (
          <>
            <Mic className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Recherche vocale</span>
          </>
        )}
      </Button>

      {/* Visual Indicator */}
      {isListening && (
        <div className="flex items-center space-x-1">
          <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1 h-6 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1 h-8 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          <div className="w-1 h-6 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '450ms' }}></div>
          <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && !isListening && (
        <div className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 max-w-xs truncate">
          "{transcript}"
        </div>
      )}
    </div>
  );
}

// Helper function to parse voice queries
export function parseVoiceQuery(transcript: string): {
  city?: string;
  propertyType?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
} {
  const result: any = {};
  const lowerTranscript = transcript.toLowerCase();

  // Parse city
  const ivoirianCities = [
    'abidjan', 'cocody', 'yopougon', 'abobo', 'plateau', 'marcory',
    'treichville', 'koumassi', 'adjamé', 'attécoubé', 'port-bouët',
    'yamoussoukro', 'bouaké', 'daloa', 'san-pédro', 'korhogo', 'man'
  ];

  for (const city of ivoirianCities) {
    if (lowerTranscript.includes(city)) {
      result.city = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  // Parse property type
  const propertyTypes = [
    { keywords: ['appartement', 'appart'], value: 'appartement' },
    { keywords: ['maison'], value: 'maison' },
    { keywords: ['villa'], value: 'villa' },
    { keywords: ['studio'], value: 'studio' },
    { keywords: ['duplex'], value: 'duplex' },
    { keywords: ['bureau'], value: 'bureau' },
    { keywords: ['commerce', 'commercial'], value: 'commerce' },
  ];

  for (const type of propertyTypes) {
    if (type.keywords.some(keyword => lowerTranscript.includes(keyword))) {
      result.propertyType = type.value;
      break;
    }
  }

  // Parse bedrooms
  const bedroomsMatch = lowerTranscript.match(/(\d+)\s*(chambre|pièce|piece)/);
  if (bedroomsMatch) {
    result.bedrooms = parseInt(bedroomsMatch[1]);
  }

  // Parse price range
  const priceMatch = lowerTranscript.match(/(\d+)\s*(mille|k|000)/);
  if (priceMatch) {
    const basePrice = parseInt(priceMatch[1]);
    const multiplier = priceMatch[2] === 'mille' || priceMatch[2] === 'k' ? 1000 : 1;
    result.maxPrice = basePrice * multiplier;
  }

  return result;
}
