import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { usePageMetadata, createPropertyMetadata, createSearchMetadata } from '../usePageMetadata';

describe('usePageMetadata', () => {
  it('devrait retourner les métadonnées par défaut', () => {
    const { result } = renderHook(() => usePageMetadata(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
      ),
    });

    expect(result.current.metadata).toEqual({
      title: undefined,
      description: undefined,
      keywords: undefined,
      image: '/logo-montoit.png',
      url: 'https://montoit.ci/',
      noIndex: false,
      jsonLd: [],
    });
  });

  it('devrait utiliser les métadonnées personnalisées', () => {
    const customMetadata = {
      title: 'Test Title',
      description: 'Test description',
      keywords: 'test, keywords',
      noIndex: true,
    };

    const { result } = renderHook(() => usePageMetadata(customMetadata), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
      ),
    });

    expect(result.current.metadata).toEqual({
      ...customMetadata,
      image: '/logo-montoit.png',
      url: 'https://montoit.ci/',
      jsonLd: [],
    });
  });

  it('devrait inclure l URL actuelle', () => {
    const { result } = renderHook(
      () => usePageMetadata(),
      {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={['/test/path']}>{children}</MemoryRouter>
        )
      }
    );

    expect(result.current.metadata.url).toBe('https://montoit.ci/test/path');
  });
});

describe('createPropertyMetadata', () => {
  it('devrait créer des métadonnées pour une propriété', () => {
    const metadata = createPropertyMetadata(
      'Villa de luxe',
      'Villa',
      500000,
      'Abidjan',
      'Belle villa avec piscine',
      'villa-image.jpg'
    );

    expect(metadata.title).toBe('Villa de luxe - Villa à Abidjan');
    expect(metadata.description).toBe('Belle villa avec piscin...');
    expect(metadata.keywords).toBe('Villa, location, Abidjan, immobilier, Côte d\'Ivoire');
    expect(metadata.image).toBe('villa-image.jpg');
    expect(metadata.jsonLd).toHaveLength(1);

    const jsonLd = metadata.jsonLd![0];
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('RealEstateListing');
    expect(jsonLd.name).toBe('Villa de luxe');
    expect(jsonLd.address.addressLocality).toBe('Abidjan');
    expect(jsonLd.offers.price).toBe(500000);
    expect(jsonLd.offers.priceCurrency).toBe('XOF');
  });

  it('devrait utiliser l image par défaut si non fournie', () => {
    const metadata = createPropertyMetadata(
      'Appartement T3',
      'Appartement',
      200000,
      'Abidjan',
      'Bel appartement en centre-ville'
    );

    expect(metadata.image).toBe('/logo-montoit.png');
  });
});

describe('createSearchMetadata', () => {
  it('devrait créer des métadonnées pour la recherche de base', () => {
    const metadata = createSearchMetadata();

    expect(metadata.title).toBe('Recherche de biens immobiliers');
    expect(metadata.description).toBe(
      'Trouvez votre logement idéal. Location immobilière certifiée ANSUT en Côte d\'Ivoire.'
    );
    expect(metadata.keywords).toBe('recherche, immobilier, location, Côte d\'Ivoire');
  });

  it('devrait inclure la ville dans les métadonnées', () => {
    const metadata = createSearchMetadata('Abidjan');

    expect(metadata.title).toBe('Recherche de biens immobiliers à Abidjan');
    expect(metadata.description).toBe(
      'Trouvez votre logement idéal à Abidjan. Location immobilière certifiée ANSUT en Côte d\'Ivoire.'
    );
    expect(metadata.keywords).toBe('recherche à Abidjan, immobilier, location, Abidjan');
  });

  it('devrait inclure le type de propriété', () => {
    const metadata = createSearchMetadata(undefined, 'Appartement');

    expect(metadata.title).toBe('Recherche de biens immobiliers - Appartement');
    expect(metadata.description).toBe(
      'Trouvez votre logement idéal - appartement. Location immobilière certifiée ANSUT en Côte d\'Ivoire.'
    );
    expect(metadata.keywords).toBe('recherche, appartement, location, Côte d\'Ivoire');
  });

  it('devrait inclure la ville et le type de propriété', () => {
    const metadata = createSearchMetadata('Cocody', 'Villa');

    expect(metadata.title).toBe('Recherche de biens immobiliers à Cocody - Villa');
    expect(metadata.description).toBe(
      'Trouvez votre logement idéal à Cocody - villa. Location immobilière certifiée ANSUT en Côte d\'Ivoire.'
    );
    expect(metadata.keywords).toBe('recherche à Cocody, villa, location, Cocody');
  });
});