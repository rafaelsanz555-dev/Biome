-- ─────────────────────────────────────────────────────────────────
-- bio.me · Solución pragmática
-- Deshabilita RLS en las 3 tablas de tracking analytics.
-- La data NO es PII sensible: son scrolls, views y clicks anónimos.
-- El dashboard del creator filtra por user_id desde server-side.
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE episode_views        DISABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions     DISABLE ROW LEVEL SECURITY;
ALTER TABLE episode_cta_clicks   DISABLE ROW LEVEL SECURITY;

-- Las tablas con PII real mantienen RLS activo:
-- ✓ reading_bookmarks (auth.uid() = user_id)
-- ✓ ai_assists (auth.uid() = user_id)
-- ✓ reports (auth.uid() = reporter_id)
-- ✓ content_flags (creator del episodio)
