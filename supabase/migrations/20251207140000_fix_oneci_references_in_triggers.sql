-- Fixer toutes les références à ONECI dans les triggers et fonctions
-- Créée: 2025-12-07T14:00:00Z

-- Supprimer et recréer le trigger update_ansut_certification avec les bons noms de champs
DROP TRIGGER IF EXISTS trigger_update_ansut_certification ON user_verifications;
DROP FUNCTION IF EXISTS update_ansut_certification();

-- Créer la fonction correcte avec smile_id_status
CREATE OR REPLACE FUNCTION update_ansut_certification()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
begin
    -- Vérifier si l'utilisateur a complété toutes les vérifications requises
    -- Utiliser smile_id_status au lieu de oneci_status
    if new.smile_id_status = 'verifie' and new.face_verification_status = 'verifie' then
        new.ansut_certified := true;
        new.ansut_certified_at := now();

        -- Mettre à jour la table profiles
        update profiles
        set
            is_verified = true,
            ansut_certified = true,
            ansut_certified_at = now()
        where id = new.user_id;
    end if;

    return new;
end;
$function$;

-- Recréer le trigger
CREATE TRIGGER trigger_update_ansut_certification
    BEFORE UPDATE ON user_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_ansut_certification();

-- Vérifier s'il y a d'autres références à oneci_status dans d'autres fonctions/triggers
DO $$
DECLARE
    trigger_record RECORD;
    function_record RECORD;
BEGIN
    -- Afficher les triggers qui contiennent encore "oneci_status"
    RAISE NOTICE 'Vérification des triggers contenant des références ONECI...';

    FOR trigger_record IN
        SELECT trigger_name, event_manipulation, event_object_table, action_statement
        FROM information_schema.triggers
        WHERE action_statement LIKE '%oneci_status%'
    LOOP
        RAISE NOTICE 'Trigger trouvé: % sur la table %', trigger_record.trigger_name, trigger_record.event_object_table;
    END LOOP;

    -- Afficher les fonctions qui contiennent encore "oneci_status"
    RAISE NOTICE 'Vérification des fonctions contenant des références ONECI...';

    FOR function_record IN
        SELECT routine_name, routine_definition
        FROM information_schema.routines
        WHERE routine_definition LIKE '%oneci_status%'
        AND routine_schema = 'public'
    LOOP
        RAISE NOTICE 'Fonction trouvée: %', function_record.routine_name;
    END LOOP;
END $$;