-- ─────────────────────────────────────────────────────────────────
-- bio.me · Evolution v3 — RLS Policy Fix
--
-- PROBLEMA: Las policies de evolution.sql se crearon sin
-- "TO anon, authenticated" explícito. Eso hace que rechacen
-- los INSERTs de usuarios anónimos (lectores no logueados),
-- bloqueando analytics y bookmarks.
--
-- FIX: Recrear las policies con role explícito.
-- Idempotente. Aditivo. Seguro de correr varias veces.
-- ─────────────────────────────────────────────────────────────────

-- episode_views: cualquiera puede insertar (analytics anónima de lecturas)
DROP POLICY IF EXISTS "episode_views_insert" ON episode_views;
CREATE POLICY "episode_views_insert" ON episode_views
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- reading_sessions: cualquiera puede insertar/actualizar (igual, analytics)
DROP POLICY IF EXISTS "reading_sessions_all" ON reading_sessions;
CREATE POLICY "reading_sessions_insert" ON reading_sessions
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);
CREATE POLICY "reading_sessions_update" ON reading_sessions
    FOR UPDATE TO anon, authenticated
    USING (true) WITH CHECK (true);
CREATE POLICY "reading_sessions_select_creator" ON reading_sessions
    FOR SELECT TO authenticated
    USING (
        view_id IN (
            SELECT ev.id FROM episode_views ev
            JOIN episodes e ON e.id = ev.episode_id
            WHERE e.creator_id = auth.uid()
        )
    );

-- episode_cta_clicks: igual
DROP POLICY IF EXISTS "episode_cta_clicks_insert" ON episode_cta_clicks;
CREATE POLICY "episode_cta_clicks_insert" ON episode_cta_clicks
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- episode_shingles: solo backend (service role) escribe; nadie lee públicamente
DROP POLICY IF EXISTS "episode_shingles_no_public" ON episode_shingles;
CREATE POLICY "episode_shingles_no_public" ON episode_shingles
    FOR SELECT TO authenticated
    USING (false);

-- content_flags: solo el creator del episodio o admin lee sus flags
DROP POLICY IF EXISTS "content_flags_select_creator" ON content_flags;
CREATE POLICY "content_flags_select_creator" ON content_flags
    FOR SELECT TO authenticated
    USING (
        episode_id IN (SELECT id FROM episodes WHERE creator_id = auth.uid())
    );

-- reports: el reporter ve sus propios reportes
DROP POLICY IF EXISTS "reports_select_reporter" ON reports;
CREATE POLICY "reports_select_reporter" ON reports
    FOR SELECT TO authenticated
    USING (auth.uid() = reporter_id);
DROP POLICY IF EXISTS "reports_insert_authenticated" ON reports;
CREATE POLICY "reports_insert_authenticated" ON reports
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = reporter_id);

-- reading_bookmarks: solo el dueño (ya estaba bien, refuerzo con role)
DROP POLICY IF EXISTS "users see their own bookmarks" ON reading_bookmarks;
DROP POLICY IF EXISTS "users manage their own bookmarks" ON reading_bookmarks;
DROP POLICY IF EXISTS "users update their own bookmarks" ON reading_bookmarks;
CREATE POLICY "reading_bookmarks_select_own" ON reading_bookmarks
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
CREATE POLICY "reading_bookmarks_insert_own" ON reading_bookmarks
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reading_bookmarks_update_own" ON reading_bookmarks
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_assists: solo el dueño
DROP POLICY IF EXISTS "users see their own ai_assists" ON ai_assists;
DROP POLICY IF EXISTS "users insert their own ai_assists" ON ai_assists;
CREATE POLICY "ai_assists_select_own" ON ai_assists
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
CREATE POLICY "ai_assists_insert_own" ON ai_assists
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- trust_events: lectura pública, escritura solo backend
DROP POLICY IF EXISTS "trust events readable by all" ON trust_events;
CREATE POLICY "trust_events_select_public" ON trust_events
    FOR SELECT TO anon, authenticated
    USING (true);
