import { HelmetHead } from '@/shared/ui/HelmetHead';
import { useLocation } from 'react-router-dom';

interface PageMetadataOptions {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, any>[];
}

export const usePageMetadata = (options: PageMetadataOptions = {}) => {
  const location = useLocation();
  const baseUrl = 'https://montoit.ci';
  const currentUrl = `${baseUrl}${location.pathname}${location.search}${location.hash}`;

  const metadata = {
    title: options.title,
    description: options.description,
    keywords: options.keywords,
    image: options.image || '/logo-montoit.png',
    url: currentUrl,
    noIndex: options.noIndex,
    jsonLd: options.jsonLd,
  };

  return { HelmetHead, metadata };
};

// Fonction utilitaire pour créer des métadonnées pour les pages de propriétés
export const createPropertyMetadata = (
  propertyName: string,
  propertyType: string,
  price: number,
  city: string,
  description: string,
  imageUrl?: string
) => ({
  title: `${propertyName} - ${propertyType} à ${city}`,
  description: `${description.slice(0, 160)}...`,
  keywords: `${propertyType}, location, ${city}, immobilier, Côte d'Ivoire`,
  image: imageUrl,
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: propertyName,
      description,
      address: {
        '@type': 'PostalAddress',
        addressLocality: city,
        addressCountry: 'CI',
      },
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: 'XOF',
      },
    },
  ],
});

// Fonction utilitaire pour les métadonnées des pages de recherche
export const createSearchMetadata = (city?: string, propertyType?: string) => {
  const baseTitle = 'Recherche de biens immobiliers';
  const location = city ? ` à ${city}` : '';
  const type = propertyType ? ` - ${propertyType}` : '';

  return {
    title: `${baseTitle}${location}${type}`,
    description: `Trouvez votre logement idéal${location}${type.toLowerCase()}. Location immobilière certifiée ANSUT en Côte d'Ivoire.`,
    keywords: `recherche${location}, ${propertyType || 'immobilier'}, location, ${city || 'Côte d\'Ivoire'}`,
  };
};