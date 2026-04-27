-- Pega esto en el SQL Editor de Supabase y corre.
-- Te muestra qué policies REALMENTE están activas en las tablas críticas.

SELECT
    tablename,
    policyname,
    cmd AS operacion,
    roles::text AS aplica_a,
    qual AS using_clause,
    with_check AS check_clause
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('episode_views', 'reading_sessions', 'episode_cta_clicks', 'reading_bookmarks', 'ai_assists', 'trust_events')
ORDER BY tablename, policyname;
