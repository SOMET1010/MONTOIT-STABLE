-- seed data for MONTOIT-STABLE platform
-- this script adds sample properties and users for testing

-- create sample users in auth.users with metadata for automatic profile creation
INSERT INTO auth.users (id, aud, role, email, raw_user_meta_data, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'owner1@exemple.ci', '{"full_name": "Konan Bi Bly", "user_type": "proprietaire"}'::jsonb, NOW()),
('22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'owner2@exemple.ci', '{"full_name": "Awa Kouadio", "user_type": "proprietaire"}'::jsonb, NOW()),
('33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'owner3@exemple.ci', '{"full_name": "Brahima Soro", "user_type": "proprietaire"}'::jsonb, NOW()),
('44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'owner4@exemple.ci', '{"full_name": "Mariam Touré", "user_type": "proprietaire"}'::jsonb, NOW()),
('55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'owner5@exemple.ci', '{"full_name": "Yao Konan", "user_type": "proprietaire"}'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;

-- update profiles with additional information after automatic creation
UPDATE profiles SET
    city = CASE
        WHEN id = '11111111-1111-1111-1111-111111111111' THEN 'Abidjan'
        WHEN id = '22222222-2222-2222-2222-222222222222' THEN 'Abidjan'
        WHEN id = '33333333-3333-3333-3333-333333333333' THEN 'Bouaké'
        WHEN id = '44444444-4444-4444-4444-444444444444' THEN 'Abidjan'
        WHEN id = '55555555-5555-5555-5555-555555555555' THEN 'San Pedro'
    END,
    phone = CASE
        WHEN id = '11111111-1111-1111-1111-111111111111' THEN '+2250707070707'
        WHEN id = '22222222-2222-2222-2222-222222222222' THEN '+2250808080808'
        WHEN id = '33333333-3333-3333-3333-333333333333' THEN '+2250909090909'
        WHEN id = '44444444-4444-4444-4444-444444444444' THEN '+2250606060606'
        WHEN id = '55555555-5555-5555-5555-555555555555' THEN '+2250750750750'
    END,
    bio = CASE
        WHEN id = '11111111-1111-1111-1111-111111111111' THEN 'Propriétaire professionnel avec 10 ans d''expérience'
        WHEN id = '22222222-2222-2222-2222-222222222222' THEN 'Je mets en location mes biens immobiliers depuis 5 ans'
        WHEN id = '33333333-3333-3333-3333-333333333333' THEN 'Agent immobilier certifié, spécialiste du Nord'
        WHEN id = '44444444-4444-4444-4444-444444444444' THEN 'Propriétaire de plusieurs appartements à Cocody'
        WHEN id = '55555555-5555-5555-5555-555555555555' THEN 'Investisseur immobilier à San Pedro'
    END,
    is_verified = CASE
        WHEN id = '33333333-3333-3333-3333-333333333333' THEN false
        ELSE true
    END,
    oneci_verified = CASE
        WHEN id = '33333333-3333-3333-3333-333333333333' THEN false
        ELSE true
    END
WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555');

-- create verification records for owners
INSERT INTO user_verifications (user_id, tenant_score, oneci_status, oneci_verified_at, ansut_certified)
VALUES
('11111111-1111-1111-1111-111111111111', 85, 'verifie', NOW() - INTERVAL '30 days', true),
('22222222-2222-2222-2222-222222222222', 78, 'verifie', NOW() - INTERVAL '15 days', true),
('33333333-3333-3333-3333-333333333333', 65, 'rejete', NOW() - INTERVAL '5 days', false),
('44444444-4444-4444-4444-444444444444', 90, 'verifie', NOW() - INTERVAL '45 days', true),
('55555555-5555-5555-5555-555555555555', 72, 'verifie', NOW() - INTERVAL '20 days', true)
ON CONFLICT (user_id) DO NOTHING;

-- assign roles to owners
INSERT INTO user_roles (user_id, role)
VALUES
('11111111-1111-1111-1111-111111111111', 'user'),
('22222222-2222-2222-2222-222222222222', 'user'),
('33333333-3333-3333-3333-333333333333', 'user'),
('44444444-4444-4444-4444-444444444444', 'user'),
('55555555-5555-5555-5555-555555555555', 'user')
ON CONFLICT DO NOTHING;

-- insert sample properties (20 properties)
INSERT INTO properties (
    id, owner_id, title, description, address, city, neighborhood,
    latitude, longitude, property_type, status, bedrooms, bathrooms,
    surface_area, has_parking, has_garden, is_furnished, has_ac,
    monthly_rent, deposit_amount, charges_amount, images, main_image,
    created_at
) VALUES
-- Appartements à Abidjan
('00000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'Appartement F3 Modern Cocody', 'Bel appartement F3 dans résidence sécurisée, proche du centre commercial et des écoles. Climatisé, avec balcon et vue dégagée.', 'Rue des Jardins, Cocody', 'Abidjan', 'Cocody', 5.359951, -4.008254, 'appartement', 'disponible', 3, 2, 120.0, true, false, true, true, 350000, 700000, 45000, ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'], 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', NOW() - INTERVAL '1 day'),

('00000002-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111', 'Studio Meublé Plateau', 'Studio moderne et fonctionnel, idéalement situé dans le quartier des affaires. Parfait pour jeune professionnel ou étudiant.', 'Avenue Chardy, Plateau', 'Abidjan', 'Plateau', 5.335684, -4.007653, 'appartement', 'disponible', 1, 1, 35.0, false, false, true, true, 120000, 240000, 25000, ARRAY['https://images.unsplash.com/photo-1554995207-c18c8da59a91', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'], 'https://images.unsplash.com/photo-1554995207-c18c8da59a91', NOW() - INTERVAL '2 days'),

('00000003-0003-0003-0003-000000000003', '22222222-2222-2222-2222-222222222222', 'Duplex 4 Chambres Marcory', 'Magnifique duplex avec terrasse, vue sur lagune. Très lumineux, avec cuisine équipée et 2 salles de bain.', 'Boulevard de Marseille, Marcory', 'Abidjan', 'Marcory', 5.306942, -3.998958, 'appartement', 'disponible', 4, 2, 180.0, true, false, false, true, 550000, 1100000, 60000, ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750', 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d'], 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750', NOW() - INTERVAL '3 days'),

('00000004-0004-0004-0004-000000000004', '44444444-4444-4444-4444-444444444444', 'F3 Standing Treichville', 'Appartement rénové dans quartier calme, proche marché et transports. Idéal pour famille.', 'Rue Princesse, Treichville', 'Abidjan', 'Treichville', 5.285835, -4.004032, 'appartement', 'disponible', 3, 1, 95.0, false, true, false, false, 280000, 560000, 30000, ARRAY['https://images.unsplash.com/photo-1572120360610-d971b9d7767c', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'], 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c', NOW() - INTERVAL '4 days'),

('00000005-0005-0005-0005-000000000005', '22222222-2222-2222-2222-222222222222', 'T2 Charmant Yopougon', 'Petit T2 coquet, bien agencé, proche des commodités. Secteur résidentiel tranquille.', 'Sicogi, Yopougon', 'Abidjan', 'Yopougon', 5.344113, -4.045247, 'appartement', 'disponible', 2, 1, 55.0, false, false, false, true, 180000, 360000, 20000, ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914', 'https://images.unsplash.com/photo-1584214862964-fb944680e5c7'], 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914', NOW() - INTERVAL '5 days'),

-- Villas et maisons
('00000006-0006-0006-0006-000000000006', '11111111-1111-1111-1111-111111111111', 'Villa 5 Chambres avec Piscine Riviera', 'Superbe villa avec jardin et piscine. Très sécurisée, quartier résidentiel huppé.', 'Rue des Palmiers, Riviera', 'Abidjan', 'Riviera', 5.376762, -4.011338, 'villa', 'disponible', 5, 3, 280.0, true, true, true, true, 1200000, 2400000, 120000, ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'], 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914', NOW() - INTERVAL '6 days'),

('00000007-0007-0007-0007-000000000007', '55555555-5555-5555-5555-555555555555', 'Maison Familiale 4 Chambres San Pedro', 'Grande maison familiale, idéale pour famille avec enfants. Proche écoles et commerces.', 'Quartier France, San Pedro', 'San Pedro', 'Centre', 4.744992, -6.617651, 'villa', 'disponible', 4, 2, 220.0, true, true, false, false, 450000, 900000, 80000, ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'], 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', NOW() - INTERVAL '7 days'),

('00000008-0008-0008-0008-000000000008', '33333333-3333-3333-3333-333333333333', 'Villa Moderne 3 Chambres Bouaké', 'Villa récente avec grandes ouvertures. Terrain 800m2 avec possibilité extension.', 'Zone Résidentielle, Bouaké', 'Bouaké', 'Centre', 7.693779, -5.034071, 'villa', 'disponible', 3, 2, 160.0, true, true, false, true, 250000, 500000, 50000, ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'], 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', NOW() - INTERVAL '8 days'),

('00000009-0009-0009-0009-000000000009', '22222222-2222-2222-2222-222222222222', 'Maison 2 Chambres Vridi', 'Maison de plain-pied, facile d''accès. Idéale pour personnes âgées ou famille avec jeunes enfants.', 'Rue Vridi, Abidjan', 'Abidjan', 'Vridi', 5.295642, -4.018995, 'villa', 'disponible', 2, 1, 80.0, true, true, false, false, 320000, 640000, 40000, ARRAY['https://images.unsplash.com/photo-1600566753376-12c872727755', 'https://images.unsplash.com/photo-1584214862964-fb944680e5c7'], 'https://images.unsplash.com/photo-1600566753376-12c872727755', NOW() - INTERVAL '9 days'),

('00000010-0010-0010-0010-000000000010', '11111111-1111-1111-1111-111111111111', 'Villa de Luxe 6 Chambres 2 Plages', 'Villa prestige avec vue mer, deux piscines. Service de ménage inclus. Quartier exclusif.', 'Route des Pêches, 2 Plages', 'Abidjan', '2 Plages', 5.250432, -3.944183, 'villa', 'disponible', 6, 4, 380.0, true, true, true, true, 2500000, 5000000, 200000, ARRAY['https://images.unsplash.com/photo-1572120360610-d971b9d7767c', 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d'], 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c', NOW() - INTERVAL '10 days'),

-- Studios et chambres
('00000011-0011-0011-0011-000000000011', '44444444-4444-4444-4444-444444444444', 'Studio Cosy Abobo', 'Studio rénové avec kitchenette. Proche gare et commerces. Idéal étudiant.', 'Centre Commercial, Abobo', 'Abidjan', 'Abobo', 5.401529, -4.041266, 'studio', 'disponible', 1, 1, 25.0, false, false, true, true, 80000, 160000, 15000, ARRAY['https://images.unsplash.com/photo-1554995207-c18c8da59a91', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'], 'https://images.unsplash.com/photo-1554995207-c18c8da59a91', NOW() - INTERVAL '11 days'),

('00000012-0012-0012-0012-000000000012', '33333333-3333-3333-3333-333333333333', 'Chambre Meublée Adjamé', 'Grande chambre meublée dans grande villa. Salon, cuisine et jardin partagés. Calme et sécurisé.', 'Adjamé, Abidjan', 'Abidjan', 'Adjamé', 5.379332, -4.002987, 'chambre', 'disponible', 1, 1, 20.0, true, true, true, true, 60000, 120000, 10000, ARRAY['https://images.unsplash.com/photo-1584214862964-fb944680e5c7', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'], 'https://images.unsplash.com/photo-1584214862964-fb944680e5c7', NOW() - INTERVAL '12 days'),

('00000013-0013-0013-0013-000000000013', '22222222-2222-2222-2222-222222222222', 'Studio Atelier Attécoubé', 'Studio avec coin atelier, idéal artisan ou étudiant en art. Lumière naturelle abondante.', 'Zone Artisanale, Attécoubé', 'Abidjan', 'Attécoubé', 5.358651, -4.099845, 'studio', 'disponible', 1, 1, 40.0, false, false, false, true, 95000, 190000, 18000, ARRAY['https://images.unsplash.com/photo-1570129477492-45c003edd2be', 'https://images.unsplash.com/photo-1554995207-c18c8da59a91'], 'https://images.unsplash.com/photo-1570129477492-45c003edd2be', NOW() - INTERVAL '13 days'),

('00000014-0014-0014-0014-000000000014', '11111111-1111-1111-1111-111111111111', 'Chambre Indépendante Bingerville', 'Chambre avec entrée indépendante dans villa. Parc arboré, très calme. Proche Abidjan.', 'Résidence les Palmiers, Bingerville', 'Abidjan', 'Bingerville', 5.533402, -3.866731, 'chambre', 'disponible', 1, 1, 22.0, true, true, true, false, 70000, 140000, 12000, ARRAY['https://images.unsplash.com/photo-1600587771525-78b9dba3b914', 'https://images.unsplash.com/photo-1600587771525-78b9dba3b914'], 'https://images.unsplash.com/photo-1600587771525-78b9dba3b914', NOW() - INTERVAL '14 days'),

-- Appartements spécifiques
('00000015-0015-0015-0015-000000000015', '44444444-4444-4444-4444-444444444444', 'F4 Luxe Angre', 'Appartement haut de gamme, quartier chic. Conciergerie, salle de sport, parking sécurisé.', '7ème Tranche, Angre', 'Abidjan', 'Angre', 5.378934, -3.995763, 'appartement', 'disponible', 4, 3, 150.0, true, false, true, true, 650000, 1300000, 75000, ARRAY['https://images.unsplash.com/photo-1560185007-c5ca9d2c014d', 'https://images.unsplash.com/photo-1584214862964-fb944680e5c7'], 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d', NOW() - INTERVAL '15 days'),

('00000016-0016-0016-0016-000000000016', '33333333-3333-3333-3333-333333333333', 'F3 Meublé Zone 4', 'Appartement meublé, prêt à habiter. Proche faculté et transports en commun.', 'Zone 4, Abidjan', 'Abidjan', 'Zone 4', 5.359472, -4.009135, 'appartement', 'disponible', 3, 2, 105.0, false, false, true, true, 320000, 640000, 35000, ARRAY['https://images.unsplash.com/photo-1570129477492-45c003edd2be', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'], 'https://images.unsplash.com/photo-1570129477492-45c003edd2be', NOW() - INTERVAL '16 days'),

('00000017-0017-0017-0017-000000000017', '22222222-2222-2222-2222-222222222222', 'T2 Rénové Le Plateau', 'T2 complètement rénové avec matériaux haut de gamme. Quartier des affaires, très recherché.', 'Rue Prince, Le Plateau', 'Abidjan', 'Le Plateau', 5.334572, -4.006864, 'appartement', 'disponible', 2, 1, 65.0, false, false, false, true, 420000, 840000, 40000, ARRAY['https://images.unsplash.com/photo-1600566753376-12c872727755', 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d'], 'https://images.unsplash.com/photo-1600566753376-12c872727755', NOW() - INTERVAL '17 days'),

('00000018-0018-0018-0018-000000000018', '55555555-5555-5555-5555-555555555555', 'F3 Familial Gagnoa', 'Appartement familial spacieux. Écoles et commerces à proximité. Secteur calme et résidentiel.', 'Centre Ville, Gagnoa', 'Gagnoa', 'Centre', 5.934858, -5.938359, 'appartement', 'disponible', 3, 2, 110.0, true, true, false, true, 200000, 400000, 30000, ARRAY['https://images.unsplash.com/photo-1584214862964-fb944680e5c7', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'], 'https://images.unsplash.com/photo-1584214862964-fb944680e5c7', NOW() - INTERVAL '18 days'),

('00000019-0019-0019-0019-000000000019', '11111111-1111-1111-1111-111111111111', 'Penthouse Vue Mer Grand-Bassam', 'Penthouse exclusif avec terrasse panoramique vue mer. Service housekeeping inclus.', 'Route de la Paix, Grand-Bassam', 'Grand-Bassam', 'Centre', 5.207856, -3.674418, 'appartement', 'disponible', 4, 3, 200.0, true, false, true, true, 1800000, 3600000, 150000, ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c'], 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', NOW() - INTERVAL '19 days'),

('00000020-0020-0020-0020-000000000020', '44444444-4444-4444-4444-444444444444', 'F2 Moderne Anyama', 'F2 récemment construit dans nouveau programme immobilier. Proche zone industrielle.', 'Programme les Jardins, Anyama', 'Abidjan', 'Anyama', 5.453242, -4.042657, 'appartement', 'disponible', 2, 1, 75.0, true, false, false, true, 250000, 500000, 28000, ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c'], 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', NOW() - INTERVAL '20 days');

-- update view counts for some properties to simulate activity
UPDATE properties SET view_count = FLOOR(RANDOM() * 50 + 10) WHERE id IN ('00000001-0001-0001-0001-000000000001', '00000002-0002-0002-0002-000000000002', '00000003-0003-0003-0003-000000000003', '00000006-0006-0006-0006-000000000006', '00000015-0015-0015-0015-000000000015');