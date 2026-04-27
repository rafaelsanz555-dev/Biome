-- ─────────────────────────────────────────────────────────────────
-- bio.me · Evolution v6 — STABILIZE
-- Único SQL para correr. Idempotente. Arregla:
--   1. RLS de episodes con role explícito (causa 404 falso)
--   2. RLS de seasons + storage por si v4 nunca corrió
--   3. Configs de themes problemáticos (Paris Noche, Vintage Paper, Aurora, Akatsuki)
--   4. Verifica que el creator de cada profile con role='creator' tenga row en creators
--   5. Verificación final
-- ─────────────────────────────────────────────────────────────────

-- ═══ PARTE 1: RLS DE EPISODES (CAUSA RAÍZ DEL 404) ═══

DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'episodes'
    LOOP EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.episodes';
    END LOOP;
END $$;

ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Lectura pública de episodes publicados + lectura propia de drafts
CREATE POLICY "episodes_public_select" ON public.episodes
    FOR SELECT TO anon, authenticated
    USING (is_published = true OR auth.uid() = creator_id);

-- Solo el creator dueño puede insertar/actualizar/borrar sus episodes
CREATE POLICY "episodes_owner_insert" ON public.episodes
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "episodes_owner_update" ON public.episodes
    FOR UPDATE TO authenticated
    USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "episodes_owner_delete" ON public.episodes
    FOR DELETE TO authenticated
    USING (auth.uid() = creator_id);

-- Grants explícitos
GRANT SELECT ON public.episodes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.episodes TO authenticated;

-- ═══ PARTE 2: RLS DE SEASONS (queries con join lo necesitan) ═══

DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'seasons'
    LOOP EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.seasons';
    END LOOP;
END $$;

ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seasons_public_select" ON public.seasons
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "seasons_owner_all" ON public.seasons
    FOR ALL TO authenticated
    USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

GRANT SELECT ON public.seasons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.seasons TO authenticated;

-- ═══ PARTE 3: RLS DE PROFILES + CREATORS (asegurar lectura pública) ═══

GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.creators TO anon, authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT UPDATE, INSERT ON public.creators TO authenticated;

-- ═══ PARTE 4: STORAGE BUCKETS Y POLICIES (por si v4 nunca corrió) ═══

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

DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    LOOP EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;

CREATE POLICY "biome_storage_public_read" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id IN ('avatars', 'post-images', 'episodes', 'themes'));
CREATE POLICY "biome_storage_authenticated_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id IN ('avatars', 'post-images', 'episodes', 'themes'));
CREATE POLICY "biome_storage_owner_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id IN ('avatars', 'post-images', 'episodes', 'themes') AND auth.uid() = owner);
CREATE POLICY "biome_storage_owner_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id IN ('avatars', 'post-images', 'episodes', 'themes') AND auth.uid() = owner);

GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO anon, authenticated;

-- ═══ PARTE 5: CONFIGS DE THEMES VISUALMENTE PROBLEMÁTICOS ═══

-- París Noche: overlay menos opaco para que se vea la foto urbana
UPDATE themes
SET config = config || jsonb_build_object(
    'background_overlay',
    'linear-gradient(180deg, rgba(10,11,14,0.40) 0%, rgba(10,11,14,0.65) 50%, rgba(10,11,14,0.85) 100%)'
)
WHERE slug = 'paris-noche';

-- Vintage Paper: cambiar SVG malformado por imagen real con overlay sutil
UPDATE themes
SET style = 'image',
    config = jsonb_build_object(
        'accent_color', '#92400E',
        'accent_soft', 'rgba(146,64,14,0.12)',
        'font', 'crimson',
        'background', '#1A1612',
        'background_image', 'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=1920&q=80',
        'background_overlay', 'linear-gradient(180deg, rgba(26,22,18,0.55) 0%, rgba(26,22,18,0.78) 100%)',
        'card_style', 'journal'
    )
WHERE slug = 'vintage-paper';

-- Aurora: agregar background base + ajuste para que el gradiente respire
UPDATE themes
SET config = config || jsonb_build_object(
    'background', '#1e1b4b',
    'accent_soft', 'rgba(167,139,250,0.18)'
)
WHERE slug = 'aurora';

-- Akatsuki: subir opacidad de las nubes rojas (eran 0.18 → 0.35)
UPDATE themes
SET config = config || jsonb_build_object(
    'background_gradient',
    'radial-gradient(ellipse 80% 60% at 30% 20%, rgba(220,38,38,0.35), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(127,29,29,0.32), transparent 60%)'
)
WHERE slug = 'akatsuki';

-- Océano: subir contraste del gradiente
UPDATE themes
SET config = config || jsonb_build_object(
    'background_gradient',
    'linear-gradient(180deg, #020617 0%, #0c1f3a 30%, #042f5e 60%, #0e3a6f 100%)',
    'background_size', '100% 200%'
)
WHERE slug = 'oceano';

-- Cyberpunk: ajustar gradient + posición animation
UPDATE themes
SET config = config || jsonb_build_object(
    'background', '#0A0014',
    'background_gradient',
    'radial-gradient(ellipse at 30% 20%, rgba(168,85,247,0.22), transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(236,72,153,0.18), transparent 50%)'
)
WHERE slug = 'cyberpunk';

-- ═══ PARTE 6: AUTO-FIX CREATORS ROWS FALTANTES ═══

-- Si un profile.role='creator' pero no tiene row en creators, créala
INSERT INTO creators (profile_id, subscription_price, is_active)
SELECT p.id, 5.00, true
FROM profiles p
LEFT JOIN creators c ON c.profile_id = p.id
WHERE p.role = 'creator' AND c.profile_id IS NULL
ON CONFLICT (profile_id) DO NOTHING;

-- ═══ PARTE 7: VERIFICACIÓN FINAL ═══

-- Ver policies activas en episodes
SELECT
    'episodes RLS' AS check_type,
    policyname,
    cmd,
    roles::text,
    CASE WHEN roles::text LIKE '%anon%' THEN '✓' ELSE '✗ falta anon' END AS status
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'episodes'
ORDER BY policyname;

-- Ver themes problemáticos actualizados
SELECT
    'themes' AS check_type,
    slug,
    style,
    config->>'background_overlay' AS overlay_preview,
    CASE
        WHEN config ? 'background_image' THEN '✓ tiene imagen'
        WHEN config ? 'background_gradient' THEN '✓ tiene gradient'
        ELSE '✗ sin background'
    END AS bg_status
FROM themes
WHERE slug IN ('paris-noche', 'vintage-paper', 'aurora', 'akatsuki', 'oceano', 'cyberpunk')
ORDER BY slug;

-- Ver creators sin row (deberían ser 0 después del auto-fix)
SELECT
    'orphan creators' AS check_type,
    COUNT(*) AS count,
    CASE WHEN COUNT(*) = 0 THEN '✓ todos los creators tienen row'
         ELSE '✗ falta creators row para algunos profiles'
    END AS status
FROM profiles p
LEFT JOIN creators c ON c.profile_id = p.id
WHERE p.role = 'creator' AND c.profile_id IS NULL;
