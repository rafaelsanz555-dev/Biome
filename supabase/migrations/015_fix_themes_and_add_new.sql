-- ─────────────────────────────────────────────────────────────────
-- bio.me · Corrección de Themes Animados y Nuevos Themes Premium
-- Corrige la falta de 'background_size' en JSON para animaciones
-- Corrige el escape de comillas en SVG
-- Agrega 4 themes premium: Midnight Memoir, Golden Journal, Rain Letters, Scarlet Confession
-- ─────────────────────────────────────────────────────────────────

-- 1. FIX: AURORA (asegurarse de que tiene size)
UPDATE themes
SET config = '{
    "accent_color": "#A78BFA",
    "accent_soft": "rgba(167,139,250,0.12)",
    "font": "playfair",
    "background_gradient": "linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4c1d95 50%, #831843 75%, #1e1b4b 100%)",
    "background_animation": "aurora-shift 30s ease-in-out infinite alternate",
    "background_size": "300% 300%",
    "card_style": "editorial"
}'::jsonb
WHERE slug = 'aurora';

-- 2. FIX: VINTAGE PAPER (Encodeo SVG corregido sin comillas anidadas dobles problemáticas)
UPDATE themes
SET config = '{
    "accent_color": "#92400E",
    "accent_soft": "rgba(146,64,14,0.12)",
    "font": "crimson",
    "background": "#1A1612",
    "background_pattern": "url(\"data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' width=''200'' height=''200''%3E%3Cfilter id=''noise''%3E%3CfeTurbulence type=''fractalNoise'' baseFrequency=''0.65'' numOctaves=''2'' stitchTiles=''stitch''/%3E%3C/filter%3E%3Crect width=''100%25'' height=''100%25'' filter=''url(%23noise)'' opacity=''0.08''/%3E%3C/svg%3E\")",
    "card_style": "journal"
}'::jsonb
WHERE slug = 'vintage-paper';

-- 3. FIX: CYBERPUNK (necesita background_size para animar)
UPDATE themes
SET config = '{
    "accent_color": "#F0ABFC",
    "accent_soft": "rgba(240,171,252,0.15)",
    "font": "ibm-plex",
    "background": "#0A0014",
    "background_gradient": "radial-gradient(ellipse at top, rgba(168,85,247,0.15), transparent 50%), radial-gradient(ellipse at bottom, rgba(236,72,153,0.1), transparent 50%)",
    "background_animation": "cyberpunk-pulse 8s ease-in-out infinite",
    "background_size": "200% 200%",
    "card_style": "editorial"
}'::jsonb
WHERE slug = 'cyberpunk';

-- 4. FIX: AKATSUKI (necesita background_size para respirar adecuadamente si hubiese movimiento)
UPDATE themes
SET config = '{
    "accent_color": "#DC2626",
    "accent_soft": "rgba(220,38,38,0.12)",
    "font": "ibm-plex",
    "background": "#0A0405",
    "background_gradient": "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(220,38,38,0.18), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(127,29,29,0.15), transparent 60%)",
    "background_animation": "akatsuki-float 25s ease-in-out infinite",
    "background_size": "200% 200%",
    "card_style": "editorial"
}'::jsonb
WHERE slug = 'akatsuki';

-- 5. FIX: OCÉANO (necesita background_size)
UPDATE themes
SET config = '{
    "accent_color": "#38BDF8",
    "accent_soft": "rgba(56,189,248,0.12)",
    "font": "playfair",
    "background": "#020617",
    "background_gradient": "linear-gradient(180deg, #020617 0%, #0c1f3a 50%, #042f5e 100%)",
    "background_animation": "ocean-wave 20s ease-in-out infinite alternate",
    "background_size": "100% 300%",
    "card_style": "editorial"
}'::jsonb
WHERE slug = 'oceano';

-- ─────────────────────────────────────────────────────────────────
-- AGREGAR 4 NUEVOS THEMES PREMIUM
-- ─────────────────────────────────────────────────────────────────

-- 6. MIDNIGHT MEMOIR
INSERT INTO themes (slug, name, description, type, style, config, is_animated)
VALUES ('midnight-memoir', 'Midnight Memoir', 'Fondo oscuro profundo con azul cobalto sutil. Estética íntima/nocturna/editorial.', 'official', 'gradient',
    '{
        "accent_color": "#3B82F6",
        "accent_soft": "rgba(59,130,246,0.1)",
        "font": "playfair",
        "background": "#05070A",
        "background_gradient": "radial-gradient(circle at 50% 0%, rgba(30,58,138,0.15), transparent 70%)",
        "text_color": "#E2E8F0",
        "card_style": "editorial"
    }'::jsonb, false)
ON CONFLICT (slug) DO UPDATE SET config = EXCLUDED.config, name = EXCLUDED.name, description = EXCLUDED.description;

-- 7. GOLDEN JOURNAL
INSERT INTO themes (slug, name, description, type, style, config, is_animated)
VALUES ('golden-journal', 'Golden Journal', 'Papel cálido con detalles dorados suaves. Sensación de diario premium.', 'official', 'solid',
    '{
        "accent_color": "#D4AF37",
        "accent_soft": "rgba(212,175,55,0.1)",
        "font": "crimson",
        "background": "#FDFBF7",
        "text_color": "#2C2A26",
        "card_style": "journal",
        "is_light": true
    }'::jsonb, false)
ON CONFLICT (slug) DO UPDATE SET config = EXCLUDED.config, name = EXCLUDED.name, description = EXCLUDED.description;

-- 8. RAIN LETTERS
INSERT INTO themes (slug, name, description, type, style, config, is_animated)
VALUES ('rain-letters', 'Rain Letters', 'Azul grisáceo melancólico. Ideal para historias personales o pérdida.', 'official', 'gradient',
    '{
        "accent_color": "#64748B",
        "accent_soft": "rgba(100,116,139,0.1)",
        "font": "inter",
        "background": "#1E293B",
        "background_gradient": "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
        "text_color": "#CBD5E1",
        "card_style": "minimal"
    }'::jsonb, false)
ON CONFLICT (slug) DO UPDATE SET config = EXCLUDED.config, name = EXCLUDED.name, description = EXCLUDED.description;

-- 9. SCARLET CONFESSION
INSERT INTO themes (slug, name, description, type, style, config, is_animated)
VALUES ('scarlet-confession', 'Scarlet Confession', 'Rojo vino oscuro. Dramático y elegante.', 'official', 'gradient',
    '{
        "accent_color": "#BE123C",
        "accent_soft": "rgba(190,18,60,0.1)",
        "font": "playfair",
        "background": "#1A050B",
        "background_gradient": "radial-gradient(ellipse at center, rgba(136,19,55,0.2), transparent 80%)",
        "text_color": "#F3E8E8",
        "card_style": "editorial"
    }'::jsonb, false)
ON CONFLICT (slug) DO UPDATE SET config = EXCLUDED.config, name = EXCLUDED.name, description = EXCLUDED.description;
