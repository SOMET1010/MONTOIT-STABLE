-- minimal seed data for MONTOIT-STABLE platform
-- this script adds sample users for testing without verification data

-- create sample users in auth.users with metadata for automatic profile creation
INSERT INTO auth.users (id, aud, role, email, raw_user_meta_data, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'owner1@exemple.ci', '{"full_name": "Konan Bi Bly", "user_type": "proprietaire"}'::jsonb, NOW()),
('22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'tenant1@exemple.ci', '{"full_name": "Awa Kouadio", "user_type": "locataire"}'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;