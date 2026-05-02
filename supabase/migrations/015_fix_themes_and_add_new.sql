-- ─────────────────────────────────────────────────────────────────
-- bio.me · Corrección de Themes Animados y Nuevos Themes Premium
-- Corrige la falta de 'background_size' en JSON para animaciones
-- Corrige el escape de comillas en SVG
-- Agrega 4 themes premium: Midnight Memoir, Golden Journal, Rain Letters, Scarlet Confession
-- ─────────────────────────────────────────────────────────────────

-- 1. FIX: AURORA (usando imagen real)
UPDATE themes
SET config = '{
    "accent_color": "#A78BFA",
    "accent_soft": "rgba(167,139,250,0.12)",
    "font": "playfair",
    "background": "#1e1b4b",
    "background_image": "/themes/aurora_bg.png",
    "background_overlay": "linear-gradient(180deg, rgba(30,27,75,0.7), rgba(30,27,75,0.95))",
    "background_animation": "aurora-shift 30s ease-in-out infinite alternate",
    "background_size": "cover",
    "card_style": "editorial"
}'::jsonb
WHERE slug = 'aurora';

-- 2. FIX: VINTAGE PAPER (usando imagen real)
UPDATE themes
SET config = '{
    "accent_color": "#92400E",
    "accent_soft": "rgba(146,64,14,0.12)",
    "font": "crimson",
    "background": "#1A1612",
    "background_image": "/themes/vintage_paper_bg.png",
    "background_overlay": "linear-gradient(180deg, rgba(26,22,18,0.3), rgba(26,22,18,0.6))",
    "background_size": "cover",
    "card_style": "journal"
}'::jsonb
WHERE slug = 'vintage-paper';

-- 3. FIX: CYBERPUNK (usando imagen real)
UPDATE themes
SET config = '{
    "accent_color": "#F0ABFC",
    "accent_soft": "rgba(240,171,252,0.15)",
    "font": "ibm-plex",
    "background": "#0A0014",
    "background_image": "/themes/cyberpunk_bg.png",
    "background_overlay": "linear-gradient(180deg, rgba(10,0,20,0.6), rgba(10,0,20,0.9))",
    "background_animation": "cyberpunk-pulse 8s ease-in-out infinite",
    "background_size": "cover",
    "card_style": "editorial"
}'::jsonb
WHERE slug = 'cyberpunk';

-- 4. FIX: AKATSUKI (usando imagen generada real)
UPDATE themes
SET config = '{
    "accent_color": "#DC2626",
    "accent_soft": "rgba(220,38,38,0.12)",
    "font": "ibm-plex",
    "background": "#0A0405",
    "background_image": "/themes/akatsuki_bg.png",
    "background_overlay": "linear-gradient(180deg, rgba(10,4,5,0.85), rgba(10,4,5,0.95))",
    "background_animation": "akatsuki-float 25s ease-in-out infinite",
    "background_size": "cover",
    "card_style": "editorial"
}'::jsonb
WHERE slug = 'akatsuki';

-- 5. FIX: OCÉANO (usando imagen real)
UPDATE themes
SET config = '{
    "accent_color": "#38BDF8",
    "accent_soft": "rgba(56,189,248,0.12)",
    "font": "playfair",
    "background": "#020617",
    "background_image": "/themes/oceano_bg.png",
    "background_overlay": "linear-gradient(180deg, rgba(2,6,23,0.6), rgba(2,6,23,0.95))",
    "background_animation": "ocean-wave 20s ease-in-out infinite alternate",
    "background_size": "cover",
    "card_style": "editorial"
}'::jsonb
WHERE slug = 'oceano';

-- ─────────────────────────────────────────────────────────────────
-- AGREGAR 4 NUEVOS THEMES PREMIUM
-- ─────────────────────────────────────────────────────────────────

-- 6. MIDNIGHT MEMOIR
INSERT INTO themes (slug, name, description, type, style, config, is_animated)
VALUES ('midnight-memoir', 'Midnight Memoir', 'Fondo oscuro profundo con azul cobalto sutil. Estética íntima/nocturna/editorial.', 'official', 'image',
    '{
        "accent_color": "#3B82F6",
        "accent_soft": "rgba(59,130,246,0.1)",
        "font": "playfair",
        "background": "#05070A",
        "background_image": "/themes/midnight_memoir_bg.png",
        "background_overlay": "linear-gradient(180deg, rgba(5,7,10,0.6), rgba(5,7,10,0.9))",
        "background_size": "cover",
        "text_color": "#E2E8F0",
        "card_style": "editorial"
    }'::jsonb, false)
ON CONFLICT (slug) DO UPDATE SET config = EXCLUDED.config, name = EXCLUDED.name, description = EXCLUDED.description;

-- 7. GOLDEN JOURNAL
INSERT INTO themes (slug, name, description, type, style, config, is_animated)
VALUES ('golden-journal', 'Golden Journal', 'Papel cálido con detalles dorados suaves. Sensación de diario premium.', 'official', 'image',
    '{
        "accent_color": "#D4AF37",
        "accent_soft": "rgba(212,175,55,0.1)",
        "font": "crimson",
        "background": "#FDFBF7",
        "background_image": "/themes/golden_journal_bg.png",
        "background_overlay": "linear-gradient(180deg, rgba(253,251,247,0.3), rgba(253,251,247,0.6))",
        "background_size": "cover",
        "text_color": "#2C2A26",
        "card_style": "journal",
        "is_light": true
    }'::jsonb, false)
ON CONFLICT (slug) DO UPDATE SET config = EXCLUDED.config, name = EXCLUDED.name, description = EXCLUDED.description;

-- 8. RAIN LETTERS
INSERT INTO themes (slug, name, description, type, style, config, is_animated)
VALUES ('rain-letters', 'Rain Letters', 'Azul grisáceo melancólico. Ideal para historias personales o pérdida.', 'official', 'image',
    '{
        "accent_color": "#64748B",
        "accent_soft": "rgba(100,116,139,0.1)",
        "font": "inter",
        "background": "#1E293B",
        "background_image": "/themes/rain_letters_bg.png",
        "background_overlay": "linear-gradient(180deg, rgba(15,23,42,0.7), rgba(30,41,59,0.9))",
        "background_size": "cover",
        "text_color": "#CBD5E1",
        "card_style": "minimal"
    }'::jsonb, false)
ON CONFLICT (slug) DO UPDATE SET config = EXCLUDED.config, name = EXCLUDED.name, description = EXCLUDED.description;

-- 9. SCARLET CONFESSION
INSERT INTO themes (slug, name, description, type, style, config, is_animated)
VALUES ('scarlet-confession', 'Scarlet Confession', 'Rojo vino oscuro. Dramático y elegante.', 'official', 'image',
    '{
        "accent_color": "#BE123C",
        "accent_soft": "rgba(190,18,60,0.1)",
        "font": "playfair",
        "background": "#1A050B",
        "background_image": "/themes/scarlet_confession_bg.png",
        "background_overlay": "linear-gradient(180deg, rgba(26,5,11,0.7), rgba(26,5,11,0.95))",
        "background_size": "cover",
        "text_color": "#F3E8E8",
        "card_style": "editorial"
    }'::jsonb, false)
ON CONFLICT (slug) DO UPDATE SET config = EXCLUDED.config, name = EXCLUDED.name, description = EXCLUDED.description;
