import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import HelmetHead from '../HelmetHead';

describe('HelmetHead', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <HelmetProvider>
        {component}
      </HelmetProvider>
    );
  };

  it('devrait rendre le titre par défaut', () => {
    renderWithProvider(<HelmetHead />);
    expect(document.title).toBe('MON TOIT - Plateforme de Location Immobilière en Côte d\'Ivoire');
  });

  it('devrait utiliser un titre personnalisé', () => {
    renderWithProvider(<HelmetHead title="Test Title" />);
    expect(document.title).toBe('Test Title | MON TOIT');
  });

  it('devrait inclure le titre qui contient déjà MON TOIT', () => {
    renderWithProvider(<HelmetHead title="Test | MON TOIT" />);
    expect(document.title).toBe('Test | MON TOIT');
  });

  it('devrait ajouter les métadonnées de description', () => {
    renderWithProvider(<HelmetHead description="Test description" />);
    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription).toHaveAttribute('content', 'Test description');
  });

  it('devrait ajouter les métadonnées Open Graph', () => {
    renderWithProvider(
      <HelmetHead
        title="Test Property"
        description="Test description"
        image="test-image.jpg"
      />
    );

    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Test Property | MON TOIT'
    );
    expect(document.querySelector('meta[property="og:description"]')).toHaveAttribute(
      'content',
      'Test description'
    );
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'test-image.jpg'
    );
  });

  it('devrait ajouter les métadonnées Twitter Card', () => {
    renderWithProvider(
      <HelmetHead
        title="Test Property"
        description="Test description"
        image="test-image.jpg"
      />
    );

    expect(document.querySelector('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image'
    );
    expect(document.querySelector('meta[name="twitter:title"]')).toHaveAttribute(
      'content',
      'Test Property | MON TOIT'
    );
  });

  it('devrait ajouter le tag noindex quand demandé', () => {
    renderWithProvider(<HelmetHead noIndex />);
    const metaRobots = document.querySelector('meta[name="robots"]');
    expect(metaRobots).toHaveAttribute('content', 'noindex, nofollow');
  });

  it('devrait ajouter les métadonnées JSON-LD', () => {
    const jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Test Site',
    };

    renderWithProvider(<HelmetHead jsonLd={[jsonLdData]} />);

    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(jsonLdScripts).toHaveLength(1);
    expect(JSON.parse(jsonLdScripts[0].textContent || '')).toEqual(jsonLdData);
  });
});