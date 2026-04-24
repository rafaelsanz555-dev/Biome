-- ═══════════════════════════════════════════════════════════
-- bio.me · Innovations Schema
-- Copia y pega en el SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════

-- 1. 🎵 Chapter Soundtrack — una canción por episodio
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS soundtrack_url TEXT;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS soundtrack_title TEXT;

-- 2. 🎭 Emotional Signature — reacciones emoji por capítulo
CREATE TABLE IF NOT EXISTS reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(episode_id, user_id)
);

CREATE INDEX IF NOT EXISTS reactions_episode_idx ON reactions(episode_id);
CREATE INDEX IF NOT EXISTS reactions_user_idx ON reactions(user_id);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reactions_select" ON reactions;
CREATE POLICY "reactions_select" ON reactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "reactions_insert" ON reactions;
CREATE POLICY "reactions_insert" ON reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reactions_update" ON reactions;
CREATE POLICY "reactions_update" ON reactions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reactions_delete" ON reactions;
CREATE POLICY "reactions_delete" ON reactions
    FOR DELETE USING (auth.uid() = user_id);

-- Done! Vuelve a bio.me y ya funciona todo.
