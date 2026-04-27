-- ─────────────────────────────────────────────────────────────────
-- bio.me · RLS Fix FORZADO
-- Borra todas las policies de las tablas afectadas y las recrea
-- correctamente. NO toca datos. Es seguro.
-- ─────────────────────────────────────────────────────────────────

-- 1. EPISODE_VIEWS — analytics anónima de lecturas
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'episode_views'
    LOOP EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON episode_views';
    END LOOP;
END $$;
ALTER TABLE episode_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ev_insert_all" ON episode_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "ev_select_creator" ON episode_views FOR SELECT TO authenticated
    USING (episode_id IN (SELECT id FROM episodes WHERE creator_id = auth.uid()));

-- 2. READING_SESSIONS
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'reading_sessions'
    LOOP EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON reading_sessions';
    END LOOP;
END $$;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rs_insert_all" ON reading_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "rs_update_all" ON reading_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "rs_select_creator" ON reading_sessions FOR SELECT TO authenticated
    USING (view_id IN (
        SELECT ev.id FROM episode_views ev
        JOIN episodes e ON e.id = ev.episode_id
        WHERE e.creator_id = auth.uid()
    ));

-- 3. EPISODE_CTA_CLICKS
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'episode_cta_clicks'
    LOOP EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON episode_cta_clicks';
    END LOOP;
END $$;
ALTER TABLE episode_cta_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ecc_insert_all" ON episode_cta_clicks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "ecc_select_creator" ON episode_cta_clicks FOR SELECT TO authenticated
    USING (episode_id IN (SELECT id FROM episodes WHERE creator_id = auth.uid()));

-- 4. READING_BOOKMARKS
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'reading_bookmarks'
    LOOP EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON reading_bookmarks';
    END LOOP;
END $$;
ALTER TABLE reading_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rb_select_own" ON reading_bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "rb_insert_own" ON reading_bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rb_update_own" ON reading_bookmarks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. AI_ASSISTS
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'ai_assists'
    LOOP EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ai_assists';
    END LOOP;
END $$;
ALTER TABLE ai_assists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aa_select_own" ON ai_assists FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "aa_insert_own" ON ai_assists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 6. TRUST_EVENTS
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'trust_events'
    LOOP EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON trust_events';
    END LOOP;
END $$;
ALTER TABLE trust_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "te_select_public" ON trust_events FOR SELECT TO anon, authenticated USING (true);

-- 7. REPORTS
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'reports'
    LOOP EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON reports';
    END LOOP;
END $$;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rep_select_own" ON reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "rep_insert_own" ON reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- 8. CONTENT_FLAGS
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'content_flags'
    LOOP EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON content_flags';
    END LOOP;
END $$;
ALTER TABLE content_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cf_select_creator" ON content_flags FOR SELECT TO authenticated
    USING (episode_id IN (SELECT id FROM episodes WHERE creator_id = auth.uid()));

-- 9. EPISODE_SHINGLES — solo backend
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'episode_shingles'
    LOOP EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON episode_shingles';
    END LOOP;
END $$;
ALTER TABLE episode_shingles ENABLE ROW LEVEL SECURITY;
-- sin policies = solo service_role puede tocar (lo correcto)

-- Verificación final
SELECT tablename, policyname, cmd, roles::text
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('episode_views', 'reading_sessions', 'episode_cta_clicks', 'reading_bookmarks', 'ai_assists', 'trust_events', 'reports', 'content_flags')
ORDER BY tablename, policyname;
