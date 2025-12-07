import { Helmet } from 'react-helmet-async';

interface HelmetHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, any>[];
}

export const HelmetHead: React.FC<HelmetHeadProps> = ({
  title = 'MON TOIT - Plateforme de Location Immobilière en Côte d\'Ivoire',
  description = 'MON TOIT - Plateforme de location immobilière certifiée ANSUT en Côte d\'Ivoire. Trouvez votre logement idéal en toute sécurité.',
  keywords = 'location, immobilier, Côte d\'Ivoire, ANSUT, logement, appartement, maison',
  image = '/logo-montoit.png',
  url = 'https://montoit.ci',
  type = 'website',
  noIndex = false,
  jsonLd = []
}) => {
  const siteName = 'MON TOIT';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="fr_CI" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="author" content="ANSUT - Agence Nationale du Service Universel des Télécommunications" />
      <meta name="language" content="fr" />
      <meta name="geo.region" content="CI" />
      <meta name="geo.placename" content="Côte d'Ivoire" />

      {/* JSON-LD Structured Data */}
      {jsonLd.map((json, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(json)}
        </script>
      ))}
    </Helmet>
  );
};

