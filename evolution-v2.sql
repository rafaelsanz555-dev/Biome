-- ─────────────────────────────────────────────────────────────────
-- bio.me · Evolution v2 — Loop refinement (Trust + Continuity + AI)
-- Aditivo. Idempotente. NO modifica nada de evolution.sql.
-- Correr DESPUÉS de evolution.sql.
-- ─────────────────────────────────────────────────────────────────

-- ─── creators: trust + frequency + verification ───
ALTER TABLE creators ADD COLUMN IF NOT EXISTS posting_frequency TEXT
    CHECK (posting_frequency IN ('weekly', 'biweekly', 'monthly', 'irregular'))
    DEFAULT 'irregular';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS frequency_promise TEXT;            -- frase humana ej: "Cada domingo"
ALTER TABLE creators ADD COLUMN IF NOT EXISTS series_status TEXT
    CHECK (series_status IN ('active', 'paused', 'completed', 'planning'))
    DEFAULT 'active';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS is_verified_storyteller BOOLEAN DEFAULT false;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS verification_method TEXT
    CHECK (verification_method IN ('id', 'social', 'manual', NULL));
ALTER TABLE creators ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS why_i_write TEXT;                  -- "por qué cuento mi historia" (max 280)
ALTER TABLE creators ADD COLUMN IF NOT EXISTS expected_episodes_per_month INTEGER;

-- ─── seasons: estado y plan ───
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS status TEXT
    CHECK (status IN ('publishing', 'paused', 'completed', 'planning'))
    DEFAULT 'publishing';
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS expected_episodes INTEGER;          -- "Esta temporada tendrá 12 episodios"
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- ─── episodes: scheduling + draft state + recap ───
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS auto_recap TEXT;                   -- AI-generated previously-on summary
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS hook_text TEXT;                    -- gancho/lead para el feed (opcional)
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS chapter_number INTEGER;            -- nº dentro de la temporada
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS reading_complete_threshold NUMERIC DEFAULT 0.85;

-- ─── reading_bookmarks: "resume where you left off" ───
CREATE TABLE IF NOT EXISTS reading_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE NOT NULL,
    reached_percent NUMERIC(5,2) DEFAULT 0,
    last_position_text TEXT,                                                     -- snippet del último párrafo leído
    completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, episode_id)
);

CREATE INDEX IF NOT EXISTS reading_bookmarks_user_updated_idx
    ON reading_bookmarks(user_id, updated_at DESC);

-- RLS
ALTER TABLE reading_bookmarks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "users see their own bookmarks" ON reading_bookmarks
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "users manage their own bookmarks" ON reading_bookmarks
        FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "users update their own bookmarks" ON reading_bookmarks
        FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── trust_events: log auditable de señales de confianza ───
CREATE TABLE IF NOT EXISTS trust_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,                                                    -- 'verified', 'consistency_streak', 'reader_milestone', 'identity_check'
    event_value TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trust_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "trust events readable by all" ON trust_events
        FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── ai_assists: log de uso de IA copiloto (para analítica + transparencia) ───
CREATE TABLE IF NOT EXISTS ai_assists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    episode_id UUID REFERENCES episodes(id) ON DELETE SET NULL,
    assist_type TEXT NOT NULL,                                                   -- 'improve_text', 'suggest_titles', 'recap', 'translate'
    input_length INTEGER,
    output_length INTEGER,
    model TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_assists ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "users see their own ai_assists" ON ai_assists
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "users insert their own ai_assists" ON ai_assists
        FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
