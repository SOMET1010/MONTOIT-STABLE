-- migration: fix profile triggers for Smile ID
-- description: update triggers to use Smile ID fields instead of ONECI
-- created: 2025-12-07T09:40:00Z

-- Drop existing trigger to recreate it
drop trigger if exists trigger_handle_profile_update on profiles;

-- Recreate trigger with Smile ID fields
create trigger trigger_handle_profile_update
    after update on profiles
    for each row
    when (
        old.is_verified is distinct from new.is_verified or
        old.smile_id_verified is distinct from new.smile_id_verified or
        old.cnam_verified is distinct from new.cnam_verified or
        old.face_verified is distinct from new.face_verified
    )
    execute function handle_profile_update();