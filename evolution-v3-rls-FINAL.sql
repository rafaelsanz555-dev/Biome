-- ─────────────────────────────────────────────────────────────────
-- bio.me · RLS Fix DEFINITIVO
-- Recrea SOLO las 3 policies de INSERT/UPDATE para tracking
-- usando "TO public" (incluye anon, authenticated, todo).
-- ─────────────────────────────────────────────────────────────────

-- 1. episode_views: cualquiera puede insertar (analytics anónima)
DROP POLICY IF EXISTS "ev_insert_all" ON episode_views;
DROP POLICY IF EXISTS "episode_views_insert" ON episode_views;
CREATE POLICY "ev_public_insert" ON episode_views
    AS PERMISSIVE FOR INSERT
    TO public
    WITH CHECK (true);

-- 2. reading_sessions: cualquiera puede insertar y actualizar
DROP POLICY IF EXISTS "rs_insert_all" ON reading_sessions;
DROP POLICY IF EXISTS "rs_update_all" ON reading_sessions;
DROP POLICY IF EXISTS "reading_sessions_insert" ON reading_sessions;
DROP POLICY IF EXISTS "reading_sessions_update" ON reading_sessions;
CREATE POLICY "rs_public_insert" ON reading_sessions
    AS PERMISSIVE FOR INSERT
    TO public
    WITH CHECK (true);
CREATE POLICY "rs_public_update" ON reading_sessions
    AS PERMISSIVE FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

-- 3. episode_cta_clicks: cualquiera puede insertar
DROP POLICY IF EXISTS "ecc_insert_all" ON episode_cta_clicks;
DROP POLICY IF EXISTS "episode_cta_clicks_insert" ON episode_cta_clicks;
CREATE POLICY "ecc_public_insert" ON episode_cta_clicks
    AS PERMISSIVE FOR INSERT
    TO public
    WITH CHECK (true);

-- Verificación inmediata: muestra qué policies hay ahora
SELECT
    tablename,
    policyname,
    cmd,
    roles::text,
    with_check::text
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('episode_views', 'reading_sessions', 'episode_cta_clicks')
AND cmd IN ('INSERT', 'UPDATE')
ORDER BY tablename;
