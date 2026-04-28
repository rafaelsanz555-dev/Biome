-- ─────────────────────────────────────────────────────────────────
-- bio.me · Evolution v7 — REBRAND a Cobalt Rich (#2563EB)
--
-- Renombra el theme default "Editorial Verde" a "Editorial Azul"
-- y actualiza su accent_color de #22C55E a #2563EB.
--
-- Los OTROS themes (Aurora, Akatsuki, Cyberpunk, etc.) NO se tocan —
-- mantienen su accent propio.
-- ─────────────────────────────────────────────────────────────────

-- Actualizar nombre + accent del theme default
UPDATE themes
SET
    name = 'Editorial Azul',
    description = 'El default de bio.me. Sobrio, editorial, enfocado en el texto.',
    config = config || jsonb_build_object(
        'accent_color', '#2563EB',
        'accent_soft', 'rgba(37, 99, 235, 0.1)'
    )
WHERE slug = 'editorial-verde';

-- Cambiar el slug también (mantiene la PK por id, no rompe FKs)
UPDATE themes SET slug = 'editorial-azul' WHERE slug = 'editorial-verde';

-- Verificación final: muestra todos los themes oficiales con su accent
SELECT
    slug,
    name,
    config->>'accent_color' AS accent,
    style,
    is_animated
FROM themes
WHERE type = 'official'
ORDER BY slug;
