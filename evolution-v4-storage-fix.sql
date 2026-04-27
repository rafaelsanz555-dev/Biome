-- ─────────────────────────────────────────────────────────────────
-- bio.me · Storage RLS Fix
-- Las policies de storage.objects existentes no tienen role explícito
-- y rechazan uploads de creators autenticados.
-- ─────────────────────────────────────────────────────────────────

-- Asegurar que los buckets existan
INSERT INTO storage.buckets (id, name, public)
    VALUES ('avatars', 'avatars', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public)
    VALUES ('post-images', 'post-images', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public)
    VALUES ('episodes', 'episodes', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public)
    VALUES ('themes', 'themes', true)
    ON CONFLICT (id) DO UPDATE SET public = true;

-- Borrar todas las policies existentes en storage.objects para los buckets de bio.me
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Recrear con sintaxis explícita "TO public" que funciona para anon + authenticated
CREATE POLICY "biome_storage_public_read" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id IN ('avatars', 'post-images', 'episodes', 'themes'));

CREATE POLICY "biome_storage_authenticated_insert" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id IN ('avatars', 'post-images', 'episodes', 'themes'));

CREATE POLICY "biome_storage_owner_update" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id IN ('avatars', 'post-images', 'episodes', 'themes') AND auth.uid() = owner);

CREATE POLICY "biome_storage_owner_delete" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id IN ('avatars', 'post-images', 'episodes', 'themes') AND auth.uid() = owner);

-- Grants explícitos para que la capa RLS pueda evaluar
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO anon, authenticated;

-- Verificación
SELECT
    policyname,
    cmd,
    roles::text,
    with_check::text
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
