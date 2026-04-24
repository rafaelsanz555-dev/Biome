-- ═══════════════════════════════════════════════════════════════════
-- bio.me · Evolution Migrations (Phase A → F)
-- Consolida las migraciones de los 8 pilares. Idempotente.
-- Copia y pega en el SQL Editor de Supabase. Se puede correr múltiples veces.
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- PILAR 1 — Creator Branding
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE creators ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#22C55E';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'inter';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS card_style TEXT DEFAULT 'editorial';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS cover_pattern TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS brand_tagline TEXT;


-- ═══════════════════════════════════════════════════════════════════
-- PILAR 2 — Rich Content (TipTap JSON)
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS content_json JSONB;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS word_count INTEGER;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS reading_time_min INTEGER;


-- ═══════════════════════════════════════════════════════════════════
-- PILAR 3 — Moderation, Reports, Copyright
-- ═══════════════════════════════════════════════════════════════════

-- Reports (manual from users)
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    resolution TEXT,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
CREATE INDEX IF NOT EXISTS reports_target_idx ON reports(target_type, target_id);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_insert" ON reports;
CREATE POLICY "reports_insert" ON reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);
DROP POLICY IF EXISTS "reports_select_own" ON reports;
CREATE POLICY "reports_select_own" ON reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- Content flags (automatic from similarity/moderation)
CREATE TABLE IF NOT EXISTS content_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE NOT NULL,
    flag_type TEXT NOT NULL,
    confidence NUMERIC(3,2),
    evidence JSONB,
    auto_flagged BOOLEAN DEFAULT true,
    reviewed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS content_flags_episode_idx ON content_flags(episode_id);
CREATE INDEX IF NOT EXISTS content_flags_reviewed_idx ON content_flags(reviewed) WHERE reviewed = false;
ALTER TABLE content_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "content_flags_select_own_episode" ON content_flags;
CREATE POLICY "content_flags_select_own_episode" ON content_flags
    FOR SELECT USING (
        episode_id IN (SELECT id FROM episodes WHERE creator_id = auth.uid())
    );

-- Episode shingles (for internal similarity detection)
CREATE TABLE IF NOT EXISTS episode_shingles (
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    shingle_hash BIGINT,
    PRIMARY KEY (episode_id, shingle_hash)
);
CREATE INDEX IF NOT EXISTS episode_shingles_hash_idx ON episode_shingles(shingle_hash);


-- ═══════════════════════════════════════════════════════════════════
-- PILAR 4 — i18n
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'es';


-- ═══════════════════════════════════════════════════════════════════
-- PILAR 5 — Rich Profiles (Identity)
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pronouns TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS story_themes TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;


-- ═══════════════════════════════════════════════════════════════════
-- PILAR 6 — Creator Analytics (Reading behavior)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS episode_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE NOT NULL,
    viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    anon_id TEXT,
    country_code TEXT,
    referrer TEXT,
    device_type TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS episode_views_episode_idx ON episode_views(episode_id);
CREATE INDEX IF NOT EXISTS episode_views_started_idx ON episode_views(started_at DESC);
ALTER TABLE episode_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "episode_views_insert" ON episode_views;
CREATE POLICY "episode_views_insert" ON episode_views
    FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "episode_views_select_creator" ON episode_views;
CREATE POLICY "episode_views_select_creator" ON episode_views
    FOR SELECT USING (
        episode_id IN (SELECT id FROM episodes WHERE creator_id = auth.uid())
    );

CREATE TABLE IF NOT EXISTS reading_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    view_id UUID REFERENCES episode_views(id) ON DELETE CASCADE NOT NULL,
    reached_percent NUMERIC(5,2),
    time_spent_seconds INTEGER,
    completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS reading_sessions_view_idx ON reading_sessions(view_id);
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reading_sessions_all" ON reading_sessions;
CREATE POLICY "reading_sessions_all" ON reading_sessions
    FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS episode_cta_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    cta_type TEXT NOT NULL,
    converted BOOLEAN DEFAULT false,
    clicked_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS episode_cta_clicks_episode_idx ON episode_cta_clicks(episode_id);
ALTER TABLE episode_cta_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "episode_cta_clicks_insert" ON episode_cta_clicks;
CREATE POLICY "episode_cta_clicks_insert" ON episode_cta_clicks
    FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "episode_cta_clicks_select_creator" ON episode_cta_clicks;
CREATE POLICY "episode_cta_clicks_select_creator" ON episode_cta_clicks
    FOR SELECT USING (
        episode_id IN (SELECT id FROM episodes WHERE creator_id = auth.uid())
    );


-- ═══════════════════════════════════════════════════════════════════
-- FIN. Vuelve a la app y ya funciona todo.
-- ═══════════════════════════════════════════════════════════════════
