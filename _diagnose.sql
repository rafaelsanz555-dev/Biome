-- Diagnóstico: muestra TODAS las policies de las tablas críticas
-- con su with_check real (lo que rechaza o permite los INSERTs)

SELECT
    tablename,
    policyname,
    cmd AS operacion,
    roles::text AS aplica_a,
    permissive,
    with_check::text AS check_clause,
    qual::text AS using_clause
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('episode_views', 'episode_cta_clicks', 'reading_sessions')
ORDER BY tablename, cmd, policyname;

-- Y verificar si RLS está habilitado
SELECT
    tablename,
    rowsecurity AS rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('episode_views', 'episode_cta_clicks', 'reading_sessions');
