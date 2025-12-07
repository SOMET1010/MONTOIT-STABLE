-- Ajouter les champs manquants pour la vérification faciale et documentaire
ALTER TABLE user_verifications
ADD COLUMN IF NOT EXISTS document_verification_status VARCHAR(20) DEFAULT 'non_commence',
ADD COLUMN IF NOT EXISTS document_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS document_image_url TEXT,
ADD COLUMN IF NOT EXISTS extracted_document_data JSONB,
ADD COLUMN IF NOT EXISTS document_confidence DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS document_expired BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS document_verification_error TEXT,
ADD COLUMN IF NOT EXISTS face_match_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS face_confidence DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS liveness_detected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS face_verification_error TEXT;

-- Ajouter des contraintes de validation (sans IF NOT EXISTS car pas supporté dans PostgreSQL pour ADD CONSTRAINT)
DO $$
BEGIN
    -- Supprimer les contraintes si elles existent déjà
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'chk_document_verification_status' AND table_name = 'user_verifications') THEN
        ALTER TABLE user_verifications DROP CONSTRAINT chk_document_verification_status;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'chk_document_confidence' AND table_name = 'user_verifications') THEN
        ALTER TABLE user_verifications DROP CONSTRAINT chk_document_confidence;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'chk_face_match_score' AND table_name = 'user_verifications') THEN
        ALTER TABLE user_verifications DROP CONSTRAINT chk_face_match_score;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'chk_face_confidence' AND table_name = 'user_verifications') THEN
        ALTER TABLE user_verifications DROP CONSTRAINT chk_face_confidence;
    END IF;

    -- Ajouter les nouvelles contraintes
    ALTER TABLE user_verifications
    ADD CONSTRAINT chk_document_verification_status
        CHECK (document_verification_status IN ('non_commence', 'en_attente', 'verifie', 'echoue', 'rejete')),
    ADD CONSTRAINT chk_document_confidence
        CHECK (document_confidence >= 0 AND document_confidence <= 1),
    ADD CONSTRAINT chk_face_match_score
        CHECK (face_match_score >= 0 AND face_match_score <= 1),
    ADD CONSTRAINT chk_face_confidence
        CHECK (face_confidence >= 0 AND face_confidence <= 1);
END $$;

-- Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_verifications_document_status ON user_verifications(document_verification_status);
CREATE INDEX IF NOT EXISTS idx_user_verifications_document_type ON user_verifications(document_type);
CREATE INDEX IF NOT EXISTS idx_user_verifications_document_expired ON user_verifications(document_expired);

-- Ajouter des commentaires pour la documentation
COMMENT ON COLUMN user_verifications.document_verification_status IS 'Statut de la vérification du document: non_commence, en_attente, verifie, echoue, rejete';
COMMENT ON COLUMN user_verifications.document_type IS 'Type de document: national_id, passport, driver_license, voter_card';
COMMENT ON COLUMN user_verifications.document_image_url IS 'URL de l''image du document téléversé';
COMMENT ON COLUMN user_verifications.extracted_document_data IS 'Données extraites du document via OCR (format JSON)';
COMMENT ON COLUMN user_verifications.document_confidence IS 'Niveau de confiance de la validation du document (0-1)';
COMMENT ON COLUMN user_verifications.document_expired IS 'Indique si le document est expiré';
COMMENT ON COLUMN user_verifications.document_verification_error IS 'Message d''erreur en cas d''échec de la validation du document';
COMMENT ON COLUMN user_verifications.face_match_score IS 'Score de correspondance faciale (0-1)';
COMMENT ON COLUMN user_verifications.face_confidence IS 'Niveau de confiance de la détection faciale (0-1)';
COMMENT ON COLUMN user_verifications.liveness_detected IS 'Indique si une détection de vie a été réussie';
COMMENT ON COLUMN user_verifications.face_verification_error IS 'Message d''erreur en cas d''échec de la vérification faciale';