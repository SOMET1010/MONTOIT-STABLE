-- Clean seed data for MONTOIT-STABLE platform
-- This script adds sample users and properties for testing without verification data

-- Create sample users in auth.users with metadata for automatic profile creation
INSERT INTO auth.users (id, aud, role, email, raw_user_meta_data, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'owner1@exemple.ci', '{"full_name": "Konan Bi Bly", "user_type": "proprietaire"}'::jsonb, NOW()),
('22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'tenant1@exemple.ci', '{"full_name": "Awa Kouadio", "user_type": "locataire"}'::jsonb, NOW()),
('33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'owner2@exemple.ci', '{"full_name": "Yao Koffi", "user_type": "proprietaire"}'::jsonb, NOW()),
('44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'agency1@exemple.ci', '{"full_name": "Société Immobilière CI", "user_type": "agence"}'::jsonb, NOW()),
('55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'tenant2@exemple.ci', '{"full_name": "Sylla Aïcha", "user_type": "locataire"}'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample properties for testing
INSERT INTO properties (
  id,
  owner_id,
  title,
  description,
  property_type,
  monthly_rent,
  surface_area,
  bedrooms,
  bathrooms,
  is_furnished,
  city,
  address,
  latitude,
  longitude,
  created_at,
  updated_at,
  status,
  images,
  main_image,
  has_parking,
  has_garden,
  has_ac
) VALUES
-- Properties for owner 1 (Konan Bi Bly)
(1, '11111111-1111-1111-1111-111111111111', 'Appartement T3 Cocody', 'Bel appartement T3 dans le quartier résidentiel de Cocody, proche de tous les commerces et écoles. Très lumineux avec balcon donnant sur jardin.', 'appartement', 150000, 120, 3, 2, true, 'Abidjan', 'Boulevard Latrille, Cocody Plateau', 5.360933, -3.989757, NOW(), NOW(), 'disponible', '{"https://images.unsplash.com/photo-1545111485-4f6a6c9586fe"}', 'https://images.unsplash.com/photo-1545111485-4f6a6c9586fe', true, false, true),

(2, '11111111-1111-1111-1111-111111111111', 'Villa 5 pièces Riviera', 'Magnifique villa avec piscine et grand jardin dans un quartier calme et sécurisé de Riviera. Idéale pour famille.', 'villa', 400000, 280, 5, 3, true, 'Abidjan', 'Zone 4, Riviera Palmeraie', 5.376425, -3.953118, NOW(), NOW(), 'disponible', '{"https://images.unsplash.com/photo-1472226403649-b3770d273b49"}', 'https://images.unsplash.com/photo-1472226403649-b3770d273b49', true, true, true),

(3, '11111111-1111-1111-1111-111111111111', 'Studio Meublé Marcory', 'Studio moderne et meublé parfaitement équipé pour étudiant ou jeune professionnel. Très bien desservi par les transports en commun.', 'studio', 50000, 28, 1, 1, true, 'Abidjan', 'Rue Principale, Marcory', 5.319229, -4.007482, NOW(), NOW(), 'disponible', '{"https://images.unsplash.com/photo-1580587748325-fdb4982816db"}', 'https://images.unsplash.com/photo-1580587748325-fdb4982816db', false, false, true),

-- Properties for owner 2 (Yao Koffi)
(4, '33333333-3333-3333-3333-333333333333', 'Appartement F2 Yopougon', 'Appartement 2 pièces au 4ème étage avec vue dégagée. Situé près du marché et des écoles. Idéal pour premier achat.', 'appartement', 80000, 65, 2, 1, false, 'Abidjan', 'Avenue 13, Yopougon Sicogi', 5.344901, -4.017502, '2025-01-20', 'available', '["https://images.unsplash.com/photo-1570129506544-c312966e9d92"]', '["parking", "ascenseur", "interphone", "terrasse"]', NOW(), NOW()),

(5, '33333333-3333-3333-3333-333333333333', 'Maison R+4 Treichville', 'Maison familiale avec 4 chambres et grand jardin. Quartier calme avec écoles et commerces à proximité.', 'maison', 250000, 200, 4, 2, false, 'Abidjan', 'Rue du Commerce, Treichville', 5.272444, -3.932765, '2025-02-15', 'available', '["https://images.unsplash.com/photo-1448630360764-1e8808316b23"]', '["garage", "jardin", "terrasse", "cuisine équipée", "sécurité"]', NOW(), NOW()),

(6, '33333333-3333-3333-3333-333333333333', 'Bureau Attijan Plateau', 'Bureau de standing dans centre d''affaires prestigieux. Idéal pour profession libérale ou petite entreprise.', 'bureau', 120000, 45, 1, 1, false, 'Abidjan', 'Avenue Jean-Paul II, Plateau', 5.365248, -3.986234, '2025-01-05', 'available', '["https://images.unsplash.com/photo-1497366214041-4c8475a390f5"]', '["climatisation", "parking", "sécurité 24/7", "salle de réunion"]', NOW(), NOW()),

-- Properties for agency (Société Immobilière CI)
(7, '44444444-4444-4444-4444-444444444444', 'Résidence Le Palmier', 'Ensemble résidentiel de luxe avec espaces verts, piscine et gardiennage. Appartements du T1 au T4.', 'appartement', 180000, 95, 3, 2, true, 'Abidjan', 'Boulevard France Abidjan, Riviera', 5.371112, -3.962443, '2025-03-01', 'available', '["https://images.unsplash.com/photo-1580587748325-fdb4982816db"]', '["piscine", "jardins", "sécurité", "parking", "garderie", "salle de sport"]', NOW(), NOW()),

(8, '44444444-4444-4444-4444-444444444444', 'Immeuble Commercial Zone 4', 'Immeuble commercial avec bureaux et espaces de stockage. Forte visibilité sur axe principal.', 'bureau_commercial', 350000, 150, 1, 2, false, 'Abidjan', 'Avenue 4, Zone 4', 5.3789445, -4.023456, '2025-02-10', 'available', '["https://images.unsplash.com/photo-1486406146405-cb990642c71e"]', '["parking client", "sécurité", "ascenseur", "accueil"]', NOW(), NOW()),

(9, '44444444-4444-4444-4444-444444444444', 'Villas de Prestige', 'Collection de villas de luxe dans quartier résidentiel exclusif. Chaque villa avec piscine privée.', 'villa', 600000, 350, 6, 4, true, 'Abidjan', 'Route d''Abidjan, Bingerville', 5.312987, -3.894567, '2025-01-25', 'available', '["https://images.unsplash.com/photo-1522709329849-394a3ae7d5d4a"]', '["piscine privée", "jardin", "personnel de maison", "sécurité", "vue mer"]', NOW(), NOW()),

(10, '44444444-4444-4444-4444-444444444444', 'Résidences Universitaires', 'Résidences étudiantes près des grandes universités. Chambres individuelles et studios meublés.', 'appartement', 45000, 22, 1, 1, true, 'Abidjan', 'Campus Universitaire, Cocody', 5.363445, -4.003456, '2025-09-01', 'available', '["https://images.unsplash.com/photo-1559332585-0f2f49a44b69"]', '["wifi", "laverie", "salle d''étude", "sécurité"]', NOW(), NOW()),

(11, '11111111-1111-1111-1111-111111111111', 'Duplex Angré', 'Duplex moderne avec 4 chambres et terrasses. Grand jardin sécurisé, idéal pour famille nombreuse.', 'duplex', 350000, 180, 4, 3, false, 'Abidjan', 'Quartier Angré, Abidjan', 5.289876, -4.012345, '2025-01-18', 'available', '["https://images.unsplash.com/photo-1522709329849-394a3ae7d5d4a"]', '["jardin", "terrasse", "garage", "sécurité"]', NOW(), NOW()),

(12, '11111111-1111-1111-1111-111111111111', 'Loft Industriel Plateau', 'Loft artistique avec plafonds hauts et grandes ouvertures. Quartier branché et dynamique.', 'loft', 220000, 85, 2, 2, false, 'Abidjan', 'Rue du Commerce, Plateau', 5.367890, -3.998765, '2025-02-05', 'available', '["https://images.unsplash.com/photo-1449475312244-d5b2ad32e27d"]', '["parking", "double vitrage", "cuisine ouverte", "espace de stockage"]', NOW(), NOW()),

(13, '33333333-3333-3333-3333-333333333333', 'Penthouse View Skyline', 'Penthouse luxueux avec vue panoramique sur la ville. 200m² de terrasse privée.', 'appartement', 750000, 200, 5, 3, true, 'Abidjan', 'Rue des Princes, Plateau', 5.369123, -3.987654, '2025-03-01', 'available', '["https://images.unsplash.com/photo-1580587748325-fdb4982816db"]', '["jacuzzi", "terrasse panoramique", "sécurité", "cave à vin", "service de concierge"]', NOW(), NOW()),

(14, '11111111-1111-1111-1111-111111111111', 'Chambre bon marché Deux Plateaux', 'Petite chambre idéale pour étudiant avec budget limité. Proche des transports et commerces.', 'chambre', 25000, 15, 1, 1, true, 'Abidjan', 'Avenue 7, Deux Plateaux', 5.345678, -4.023456, '2025-01-12', 'available', '["https://images.unsplash.com/photo-1580587748325-fdb4982816db"]', '["wifi", "linge de lit", "shared kitchen", "climatisation"]', NOW(), NOW()),

(15, '22222222-2222-2222-2222-222222222222', 'Maison Famille Grand-Bassam', 'Maison familiale avec grand jardin dans ville calme. Idéale pour familles avec enfants.', 'maison', 120000, 150, 3, 2, false, 'Grand-Bassam', 'Centre-Ville, Grand-Bassam', 5.213456, -3.774321, '2025-01-08', 'available', '["https://images.unsplash.com/photo-1580587748325-fdb4982816db"]', '["jardin", "parking", "terrasse", "espace jeux"]', NOW(), NOW()),

(16, '22222222-2222-2222-2222-222222222222', 'Appartement Étudiant Bouaké', 'Appartement meublé pour étudiants à budget maîtrisé. Quartier calme et sécurisé.', 'appartement', 35000, 35, 1, 1, true, 'Bouaké', 'Centre Urbain, Bouaké', 7.654321, -5.342198, '2025-01-22', 'available', '["https://images.unsplash.com/photo-1580587748325-fdb4982816db"]', '["meublé", "wifi", "lave-linge", "étude"]', NOW(), NOW()),

(17, '11111111-1111-1111-1111-111111111111', 'Ferme écologique Yamoussoukro', 'Belle ferme avec 2 hectares de terre et étang. Produits bio et élevage de volailles.', 'ferme', 200000, 180, 5, 3, false, 'Yamoussoukro', 'Route de Toumodi, Yamoussoukro', 6.823456, -5.034567, '2025-04-01', 'available', '["https://images.unsplash.com/photo-1558628252-3090-1aa3745b14a9"]', '["2 hectares", "étang", "potager", "poulailler"]', NOW(), NOW()),

(18, '44444444-4444-4444-4444-444444444444', 'Boutiques Commerciales Cocody', 'Emplacements commerciaux sur rue très passante. Idéal pour commerces et services.', 'bureau_commercial', 80000, 40, 1, 1, false, 'Abidjan', 'Rue Princesse, Cocody', 5.367890, -3.998765, '2025-02-15', 'available', '["https://images.unsplash.com/photo-1486406146405-cb990642c71e"]', '["grande vitrine", "stockage arrière", "parking"]', NOW(), NOW()),

(19, '33333333-3333-3333-3333-333333333333', 'Complexe Appartements San Pedro', 'Ensemble de 12 appartements avec services partagés. Piscine et parkings inclus.', 'appartement', 90000, 70, 2, 1, true, 'San Pedro', 'Avenue des Nations, San Pedro', 4.934567, -6.432198, '2025-05-01', 'available', '["https://images.unsplash.com/photo-1580587748325-fdb4982816db"]', '["piscine", "parking", "sécurité", "fitness", "petanque"]', NOW(), NOW()),

(20, '11111111-1111-1111-1111-111111111111', 'Terrasses Attijan', 'Terrasses de standing avec vue sur le golf et lagune. Perfect aménagement extérieur.', 'terrasse', 500000, 80, 1, 1, false, 'Abidjan', 'Boulevard de la Marina, Riviera', 5.365123, -3.990123, '2025-06-01', 'available', '["https://images.unsplash.com/photo-1580587748325-fdb4982816db"]', '["vue golf", "barbecue", "japonais", "rangement intégré"]', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;