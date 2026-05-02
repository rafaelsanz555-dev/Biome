-- ═══════════════════════════════════════════════════════════
-- bio.me · Comments + Votes Schema
-- Ejecuta este SQL en el SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════

-- ── Tabla de comentarios ──────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    episode_id  uuid REFERENCES episodes(id) ON DELETE CASCADE NOT NULL,
    author_id   uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id   uuid REFERENCES comments(id) ON DELETE CASCADE,  -- NULL = raíz
    body        text NOT NULL CHECK (length(body) BETWEEN 1 AND 2000),
    score       int  DEFAULT 0 NOT NULL,                          -- denormalizado
    is_hidden   boolean DEFAULT false NOT NULL,                   -- el creator ocultó
    is_pinned   boolean DEFAULT false NOT NULL,                   -- destacado por creator
    edited_at   timestamptz,
    created_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS comments_episode_idx ON comments(episode_id, created_at DESC);
CREATE INDEX IF NOT EXISTS comments_parent_idx  ON comments(parent_id);
CREATE INDEX IF NOT EXISTS comments_author_idx  ON comments(author_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ── Policies comments ─────────────────────────────────────

DROP POLICY IF EXISTS "comments_select" ON comments;
CREATE POLICY "comments_select" ON comments FOR SELECT USING (
    is_hidden = false
    OR auth.uid() = author_id
    OR auth.uid() = (SELECT creator_id FROM episodes WHERE id = comments.episode_id)
);

DROP POLICY IF EXISTS "comments_insert" ON comments;
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (
    auth.uid() = author_id
);

DROP POLICY IF EXISTS "comments_update_author" ON comments;
CREATE POLICY "comments_update_author" ON comments FOR UPDATE USING (
    -- el autor puede editar su propio body
    auth.uid() = author_id
);

DROP POLICY IF EXISTS "comments_update_creator" ON comments;
CREATE POLICY "comments_update_creator" ON comments FOR UPDATE USING (
    -- el creator del episodio puede pinear / ocultar
    auth.uid() = (SELECT creator_id FROM episodes WHERE id = comments.episode_id)
);

DROP POLICY IF EXISTS "comments_delete" ON comments;
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (
    auth.uid() = author_id
    OR auth.uid() = (SELECT creator_id FROM episodes WHERE id = comments.episode_id)
);

-- ── Tabla de votos (👍 / 👎) ──────────────────────────────
CREATE TABLE IF NOT EXISTS comment_votes (
    comment_id  uuid REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
    user_id     uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    value       int NOT NULL CHECK (value IN (-1, 1)),
    created_at  timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS comment_votes_user_idx ON comment_votes(user_id);

ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comment_votes_select" ON comment_votes;
CREATE POLICY "comment_votes_select" ON comment_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "comment_votes_insert" ON comment_votes;
CREATE POLICY "comment_votes_insert" ON comment_votes FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

DROP POLICY IF EXISTS "comment_votes_update" ON comment_votes;
CREATE POLICY "comment_votes_update" ON comment_votes FOR UPDATE USING (
    auth.uid() = user_id
);

DROP POLICY IF EXISTS "comment_votes_delete" ON comment_votes;
CREATE POLICY "comment_votes_delete" ON comment_votes FOR DELETE USING (
    auth.uid() = user_id
);

-- ── Función trigger: mantener comments.score sincronizado ─

CREATE OR REPLACE FUNCTION recompute_comment_score(c_id uuid) RETURNS void AS $$
BEGIN
    UPDATE comments
    SET score = COALESCE((SELECT SUM(value) FROM comment_votes WHERE comment_id = c_id), 0)
    WHERE id = c_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION on_comment_vote_change() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recompute_comment_score(OLD.comment_id);
        RETURN OLD;
    ELSE
        PERFORM recompute_comment_score(NEW.comment_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS comment_votes_score_trigger ON comment_votes;
CREATE TRIGGER comment_votes_score_trigger
    AFTER INSERT OR UPDATE OR DELETE ON comment_votes
    FOR EACH ROW EXECUTE FUNCTION on_comment_vote_change();
