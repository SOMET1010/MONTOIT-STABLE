/*
  # Propriétés de démonstration Mon Toit

  Crée 12 propriétés de test à Abidjan avec images et données réalistes
*/

-- Créer un utilisateur de démonstration
INSERT INTO auth.users (id, email, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'demo@montoit.ci', NOW())
ON CONFLICT (id) DO NOTHING;

-- Créer le profil associé
INSERT INTO profiles (id, email, full_name, user_type, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'demo@montoit.ci', 'Utilisateur Démonstration', 'proprietaire'::user_type, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Propriétés de démonstration
INSERT INTO properties (owner_id, title, description, property_type, status, city, neighborhood, address, latitude, longitude, bedrooms, bathrooms, surface_area, monthly_rent, deposit_amount, main_image) VALUES
('00000000-0000-0000-0000-000000000001', 'Appartement moderne à Cocody Riviera', 'Magnifique appartement de 3 chambres avec vue panoramique, résidence sécurisée avec piscine.', 'appartement', 'disponible', 'Abidjan', 'Cocody-Riviera', 'Riviera Bonoumin', 5.3599, -3.9600, 3, 2, 120.00, 350000, 700000, 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'),
('00000000-0000-0000-0000-000000000001', 'Villa luxueuse à Cocody 2 Plateaux', 'Villa de standing avec 5 chambres, jardin, garage double. Quartier calme et résidentiel.', 'villa', 'disponible', 'Abidjan', '2 Plateaux', 'Rue des Jardins', 5.3700, -3.9800, 5, 4, 280.00, 800000, 1600000, 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'),
('00000000-0000-0000-0000-000000000001', 'Studio moderne au Plateau', 'Studio meublé au coeur du Plateau. Idéal pour jeune professionnel.', 'studio', 'disponible', 'Abidjan', 'Plateau', 'Avenue Chardy', 5.3167, -4.0167, 1, 1, 35.00, 150000, 300000, 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'),
('00000000-0000-0000-0000-000000000001', 'Appartement familial à Marcory Zone 4', 'Grand appartement 4 pièces lumineux. Parfait pour une famille.', 'appartement', 'disponible', 'Abidjan', 'Marcory Zone 4', 'Boulevard VGE', 5.2800, -3.9900, 4, 2, 150.00, 280000, 560000, 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'),
('00000000-0000-0000-0000-000000000001', 'Chambre à Yopougon', 'Chambre meublée dans maison familiale. Eau et électricité comprises.', 'chambre', 'disponible', 'Abidjan', 'Yopougon', 'Niangon Nord', 5.3333, -4.0833, 1, 1, 20.00, 60000, 60000, 'https://images.pexels.com/photos/271795/pexels-photo-271795.jpeg?auto=compress&cs=tinysrgb&w=800'),
('00000000-0000-0000-0000-000000000001', 'Bureau moderne à Plateau Dokui', 'Espace de bureau 80m² dans immeuble récent. Climatisé et sécurisé.', 'bureau', 'disponible', 'Abidjan', 'Plateau Dokui', 'Boulevard Clozel', 5.3200, -4.0150, 0, 2, 80.00, 400000, 800000, 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800'),
('00000000-0000-0000-0000-000000000001', 'Appartement standing à Cocody Angré', 'Appartement haut standing avec terrasse, résidence avec salle de sport.', 'appartement', 'disponible', 'Abidjan', 'Cocody-Angré', 'Angré 7e Tranche', 5.3800, -3.9500, 3, 3, 140.00, 450000, 900000, 'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=800'),
('00000000-0000-0000-0000-000000000001', 'Villa bord de mer à Bassam', 'Magnifique villa avec vue mer. 4 chambres, piscine, accès plage.', 'villa', 'disponible', 'Grand-Bassam', 'Plage', 'Boulevard de la Plage', 5.2000, -3.7333, 4, 3, 250.00, 600000, 1200000, 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800'),
('00000000-0000-0000-0000-000000000001', 'Studio étudiant à Abobo', 'Petit studio pour étudiant. Proche université, commerces et transports.', 'studio', 'disponible', 'Abidjan', 'Abobo', 'Abobo Gare', 5.4167, -4.0167, 1, 1, 25.00, 80000, 80000, 'https://images.pexels.com/photos/1428348/pexels-photo-1428348.jpeg?auto=compress&cs=tinysrgb&w=800'),
('00000000-0000-0000-0000-000000000001', 'Commerce au Cap Sud', 'Local commercial 100m² dans centre commercial. Idéal boutique ou restaurant.', 'commerce', 'disponible', 'Abidjan', 'Marcory', 'Cap Sud', 5.2700, -3.9800, 0, 2, 100.00, 500000, 1000000, 'https://images.pexels.com/photos/2467506/pexels-photo-2467506.jpeg?auto=compress&cs=tinysrgb&w=800'),
('00000000-0000-0000-0000-000000000001', 'Appartement duplex à Cocody Vallon', 'Splendide duplex avec salon double hauteur. Quartier calme et verdoyant.', 'appartement', 'disponible', 'Abidjan', 'Cocody-Vallon', 'Vallon', 5.3650, -3.9700, 4, 3, 200.00, 550000, 1100000, 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=800'),
('00000000-0000-0000-0000-000000000001', 'Villa moderne à Bingerville', 'Villa neuve avec finitions de qualité. 4 chambres, jardin paysagé.', 'villa', 'disponible', 'Bingerville', 'Centre', 'Rue Principale', 5.3550, -3.8900, 4, 3, 220.00, 480000, 960000, 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800');

UPDATE properties SET view_count = floor(random() * 500 + 50)::int WHERE status = 'disponible';