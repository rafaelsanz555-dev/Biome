-- ═══════════════════════════════════════════════════════════
-- bio.me · Seasons format column
-- Pegá este SQL en el SQL Editor de Supabase y dale Run
-- ═══════════════════════════════════════════════════════════

-- Agregar columna 'format' a seasons:
--   'series' = Historia (capítulos densos, arco editorial)
--   'thread' = Historia en hilo (estilo Twitter, posts cortos cronológicos)
ALTER TABLE seasons
    ADD COLUMN IF NOT EXISTS format text DEFAULT 'series' NOT NULL
    CHECK (format IN ('series', 'thread'));

-- Series existentes asumimos como 'series' (default). No hace falta backfill.
