-- Additional properties to add to the existing database

-- Insert additional sample properties
INSERT INTO properties (
  id,
  owner_id,
  title,
  description,
  property_type,
  price,
  surface_area,
  bedrooms,
  bathrooms,
  furnished,
  city,
  address,
  latitude,
  longitude,
  available_from,
  status,
  images,
  features,
  created_at,
  updated_at
) VALUES
-- Additional properties
(21, '11111111-1111-1111-1111-111111111111', 'Villa de luxe à Cocody',
'Villa moderne avec piscine et jardin dans un quartier résidentiel très prisé de Cocody.',
'villa', 500000, 300, 6, 4, true, 'Abidjan',
'Boulevard de la République, Cocody', 5.367890, -3.998765,
'2025-02-01', 'available',
'["https://images.unsplash.com/photo-1580587748325-fdb4982816db"]',
'["piscine", "jardin", "garage", "sécurité", "cuisine équipée"]',
NOW(), NOW()),

(22, '11111111-1111-1111-1111-111111111111', 'Appartement de standing',
'Bel appartement T4 en plein centre-ville avec vue sur la lagune.',
'appartement', 200000, 150, 4, 2, true, 'Abidjan',
'Plateau, Abidjan', 5.365248, -3.986234,
'2025-01-15', 'available',
'["https://images.unsplash.com/photo-1580587748325-fdb4982816db"]',
'["climatisation", "parking", "sécurité", "balcon"]',
NOW(), NOW()),

(23, '33333333-3333-3333-3333-333333333333', 'Studio meublé',
'Studio cozy meublé idéal pour étudiant ou jeune professionnel.',
'studio', 40000, 25, 1, 1, true, 'Abidjan',
'Marcory, Abidjan', 5.319229, -4.007482,
'2025-01-10', 'available',
'["https://images.unsplash.com/photo-1580587748325-fdb4982816db"]',
'["meublé", "climatisation", "wifi"]',
NOW(), NOW()),

(24, '44444444-4444-4444-4444-444444444444', 'Bureau de prestige',
'Bureau de standing dans centre d''affaires moderne.',
'bureau', 100000, 50, 1, 1, false, 'Abidjan',
'Zone 4, Abidjan', 5.3789445, -4.023456,
'2025-01-20', 'available',
'["https://images.unsplash.com/photo-1580587748325-fdb4982816db"]',
'["climatisation", "parking", "sécurité", "accès handicapé"]',
NOW(), NOW()),

(25, '22222222-2222-2222-2222-222222222222', 'Chambre individuelle',
'Chambre calme dans maison familiale, idéale pour étudiant.',
'chambre', 20000, 12, 1, 1, true, 'Abidjan',
'Yopougon, Abidjan', 5.344901, -4.017502,
'2025-01-05', 'available',
'["https://images.unsplash.com/photo-1580587748325-fdb4982816db"]',
'["wifi", "linge de lit", "cuisine partagée"]',
NOW(), NOW())

ON CONFLICT (id) DO NOTHING;