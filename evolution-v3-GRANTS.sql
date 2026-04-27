-- ─────────────────────────────────────────────────────────────────
-- bio.me · GRANTS Fix
-- Las policies estaban OK. El problema es que faltan los GRANTs
-- a nivel de tabla. RLS no funciona si anon no tiene permiso base.
-- ─────────────────────────────────────────────────────────────────

-- Tracking analytics (anon + authenticated pueden insertar)
GRANT INSERT ON episode_views TO anon, authenticated;
GRANT SELECT ON episode_views TO authenticated;
GRANT INSERT, UPDATE ON reading_sessions TO anon, authenticated;
GRANT SELECT ON reading_sessions TO authenticated;
GRANT INSERT ON episode_cta_clicks TO anon, authenticated;
GRANT SELECT ON episode_cta_clicks TO authenticated;

-- Bookmarks (solo authenticated, ya estaba bien pero refuerzo)
GRANT INSERT, SELECT, UPDATE ON reading_bookmarks TO authenticated;

-- AI assists (logging de uso del copiloto)
GRANT INSERT, SELECT ON ai_assists TO authenticated;

-- Reports + content_flags (moderación)
GRANT INSERT, SELECT ON reports TO authenticated;
GRANT SELECT ON content_flags TO authenticated;

-- Trust events (lectura pública)
GRANT SELECT ON trust_events TO anon, authenticated;

-- Refrescar el schema cache de PostgREST (Supabase) para que los grants apliquen
NOTIFY pgrst, 'reload schema';

-- Verificación: muestra los grants efectivos
SELECT
    grantee,
    table_name,
    string_agg(privilege_type, ', ' ORDER BY privilege_type) AS permisos
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name IN (
    'episode_views', 'reading_sessions', 'episode_cta_clicks',
    'reading_bookmarks', 'ai_assists', 'reports', 'content_flags', 'trust_events'
)
AND grantee IN ('anon', 'authenticated')
GROUP BY grantee, table_name
ORDER BY table_name, grantee;
