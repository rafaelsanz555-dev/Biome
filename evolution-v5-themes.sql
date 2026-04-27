-- ─────────────────────────────────────────────────────────────────
-- bio.me · Theme System Extensible
-- Una tabla `themes` con themes oficiales + custom + comunitarios.
-- Soporta gradientes simples, imágenes de fondo, y animaciones.
-- Idempotente.
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS themes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('official', 'custom', 'community')),
    style TEXT NOT NULL CHECK (style IN ('solid', 'gradient', 'image', 'animated', 'pattern')),
    config JSONB NOT NULL,                          -- toda la configuración del theme
    preview_url TEXT,                                -- thumbnail
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,  -- null si oficial
    is_premium BOOLEAN DEFAULT false,
    is_animated BOOLEAN DEFAULT false,
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS themes_type_idx ON themes(type);
CREATE INDEX IF NOT EXISTS themes_creator_idx ON themes(creator_id);

ALTER TABLE themes DISABLE ROW LEVEL SECURITY;
GRANT SELECT ON themes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON themes TO authenticated;

-- creators ahora tiene un theme_id opcional (gana sobre los campos individuales)
ALTER TABLE creators ADD COLUMN IF NOT EXISTS theme_id UUID REFERENCES themes(id) ON DELETE SET NULL;

-- ── Seed: 6 themes oficiales curados ──

-- 1. EDITORIAL VERDE (default actual)
INSERT INTO themes (slug, name, description, type, style, config, is_animated)
VALUES ('editorial-verde', 'Editorial Verde', 'El default de bio.me. Sobrio, editorial, enfocado en el texto.', 'official', 'solid',
    '{
        "accent_color": "#22C55E",
        "accent_soft": "rgba(34,197,94,0.1)",
        "font": "playfair",
        "background": "#0A0B0E",
        "card_style": "editorial"
    }'::jsonb, false)
ON CONFLICT (slug) DO UPDATE SET config = EXCLUDED.config, name = EXCLUDED.name;

-- 2. AURORA (gradiente animado morado-rosa-cyan, sutil)
INSERT INTO themes (slug, name, description, type, style, config, is_animated)
VALUES ('aurora', 'Aurora', 'Gradiente animado en cámara lenta. Para historias de transformación.', 'official', 'animated',
    '{
        "accent_color": "#A78BFA",
        "accent_soft": "rgba(167,139,250,0.12)",
        "font": "playfair",
        "background_gradient": "linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4c1d95 50%, #831843 75%, #1e1b4b 100%)",
        "background_animation": "aurora-shift 30s ease-in-out infinite alternate",
        "background_size": "300% 300%",
        "card_style": "editorial"
    }'::jsonb, true)
ON CONFLICT (slug) DO UPDATE SET config = EXCLUDED.config, name = EXCLUDED.name;

-- 3. PARIS NOCHE (foto urbana sepia con vignette)
INSERT INTO themes (slug, name, description, type, style, config, is_animated)
VALUES ('paris-noche', 'París Noche', 'Foto urbana en sepia. Para crónicas de viaje y nostalgia.', 'official', 'image',
    '{
        "accent_color": "#E8B86D",
        "accent_soft": "rgba(232,184,109,0.12)",
        "font": "crimson",
        "background_image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80",
        "background_overlay": "linear-gradient(180deg, rgba(10,11,14,0.85) 0%, rgba(10,11,14,0.95) 50%, rgba(10,11,14,1) 100%)",
        "card_style": "journal"
    }'::jsonb, false)
ON CONFLICT (slug) DO UPDATE SET config = EXCLUDED.config, name = EXCLUDED.name;

-- 4. VINTAGE PAPER (textura de papel envejecido)
INSERT INTO themes (slug, name, description, type, style, config, is_animated)
VALUES ('vintage-paper', 'Vintage Paper', 'Textura de papel antiguo. Para memorias y diarios.', 'official', 'pattern',
    '{
        "accent_color": "#92400E",
        "accent_soft": "rgba(146,64,14,0.12)",
        "font": "crimson",
        "background": "#1A1612",
        "background_pattern": "url(\"data:image/svg+xml;utf8,<svg xmlns=''http://www.w3.org/2000/svg'' width=''200'' height=''200''><filter id=''noise''><feTurbulence type=''fractalNoise'' baseFrequency=''0.65'' numOctaves=''2'' stitchTiles=''stitch''/></filter><rect width=''100%25'' height=''100%25'' filter=''url(%23noise)'' opacity=''0.08''/></svg>\")",
        "card_style": "journal"
    }'::jsonb, false)
ON CONFLICT (slug) DO UPDATE SET config = EXCLUDED.config, name = EXCLUDED.name;

-- 5. CYBERPUNK (neón animado)
INSERT INTO themes (slug, name, description, type, style, config, is_animated)
VALUES ('cyberpunk', 'Cyberpunk', 'Neón vibrante con grid animado. Para historias urbanas modernas.', 'official', 'animated',
    '{
        "accent_color": "#F0ABFC",
        "accent_soft": "rgba(240,171,252,0.15)",
        "font": "ibm-plex",
        "background": "#0A0014",
        "background_gradient": "radial-gradient(ellipse at top, rgba(168,85,247,0.15), transparent 50%), radial-gradient(ellipse at bottom, rgba(236,72,153,0.1), transparent 50%)",
        "background_animation": "cyberpunk-pulse 8s ease-in-out infinite",
        "card_style": "editorial"
    }'::jsonb, true)
ON CONFLICT (slug) DO UPDATE SET config = EXCLUDED.config, name = EXCLUDED.name;

-- 6. MINIMAL CLARO (alternativa luminosa)
INSERT INTO themes (slug, name, description, type, style, config, is_animated)
VALUES ('minimal-claro', 'Minimal Claro', 'Espacio blanco generoso. Para narrativa contemplativa.', 'official', 'solid',
    '{
        "accent_color": "#0F172A",
        "accent_soft": "rgba(15,23,42,0.08)",
        "font": "ibm-plex",
        "background": "#FAF7F0",
        "text_color": "#0F172A",
        "card_style": "minimal",
        "is_light": true
    }'::jsonb, false)
ON CONFLICT (slug) DO UPDATE SET config = EXCLUDED.config, name = EXCLUDED.name;

-- 7. AKATSUKI (homenaje a anime, gradiente rojo nube)
INSERT INTO themes (slug, name, description, type, style, config, is_animated)
VALUES ('akatsuki', 'Akatsuki', 'Tributo a las nubes rojas. Para historias de pertenencia y secretos.', 'official', 'animated',
    '{
        "accent_color": "#DC2626",
        "accent_soft": "rgba(220,38,38,0.12)",
        "font": "ibm-plex",
        "background": "#0A0405",
        "background_gradient": "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(220,38,38,0.18), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(127,29,29,0.15), transparent 60%)",
        "background_animation": "akatsuki-float 25s ease-in-out infinite",
        "card_style": "editorial"
    }'::jsonb, true)
ON CONFLICT (slug) DO UPDATE SET config = EXCLUDED.config, name = EXCLUDED.name;

-- 8. OCÉANO (azul profundo con olas sutiles)
INSERT INTO themes (slug, name, description, type, style, config, is_animated)
VALUES ('oceano', 'Océano', 'Profundidades azules con movimiento de olas. Para historias de viaje interior.', 'official', 'animated',
    '{
        "accent_color": "#38BDF8",
        "accent_soft": "rgba(56,189,248,0.12)",
        "font": "playfair",
        "background": "#020617",
        "background_gradient": "linear-gradient(180deg, #020617 0%, #0c1f3a 50%, #042f5e 100%)",
        "background_animation": "ocean-wave 20s ease-in-out infinite alternate",
        "card_style": "editorial"
    }'::jsonb, true)
ON CONFLICT (slug) DO UPDATE SET config = EXCLUDED.config, name = EXCLUDED.name;
