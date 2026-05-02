-- ─────────────────────────────────────────────────────────────────
-- bio.me · Fix Episodes RLS and missing columns
-- Agrega políticas de inserción, actualización y borrado para los creadores
-- ─────────────────────────────────────────────────────────────────

-- 1. Ensure columns exist (if they weren't in schema.sql originally)
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS content_json jsonb;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS word_count integer;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS reading_time_min integer;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS soundtrack_url text;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS soundtrack_title text;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;

-- 2. Add proper RLS policies so creators can publish and edit
CREATE POLICY "Creators can insert own episodes" ON public.episodes 
FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own episodes" ON public.episodes 
FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own episodes" ON public.episodes 
FOR DELETE USING (auth.uid() = creator_id);

-- 2.5 Create ai_assists table for tracking usage
CREATE TABLE IF NOT EXISTS public.ai_assists (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    episode_id uuid REFERENCES public.episodes(id),
    assist_type text NOT NULL,
    input_length integer,
    output_length integer,
    model text,
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.ai_assists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own ai assists" ON public.ai_assists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own ai assists" ON public.ai_assists FOR SELECT USING (auth.uid() = user_id);

-- 3. Fix Akatsuki theme background image
UPDATE themes SET config = '{
    "accent_color": "#DC2626", "accent_soft": "rgba(220,38,38,0.12)", "font": "ibm-plex", "background": "#0A0405",
    "background_image": "/themes/akatsuki_bg.png", "background_overlay": "linear-gradient(180deg, rgba(10,4,5,0.85), rgba(10,4,5,0.95))",
    "background_animation": "akatsuki-float 25s ease-in-out infinite", "background_size": "cover", "card_style": "editorial"
}'::jsonb WHERE slug = 'akatsuki';

-- 4. Fix Aurora theme
UPDATE themes SET config = '{
    "accent_color": "#A78BFA", "accent_soft": "rgba(167,139,250,0.12)", "font": "playfair", "background": "#1e1b4b",
    "background_image": "/themes/aurora_bg.png", "background_overlay": "linear-gradient(180deg, rgba(30,27,75,0.7), rgba(30,27,75,0.95))",
    "background_animation": "aurora-shift 30s ease-in-out infinite alternate", "background_size": "cover", "card_style": "editorial"
}'::jsonb WHERE slug = 'aurora';

-- 5. Fix Vintage Paper theme
UPDATE themes SET config = '{
    "accent_color": "#92400E", "accent_soft": "rgba(146,64,14,0.12)", "font": "crimson", "background": "#1A1612",
    "background_image": "/themes/vintage_paper_bg.png", "background_overlay": "linear-gradient(180deg, rgba(26,22,18,0.3), rgba(26,22,18,0.6))",
    "background_size": "cover", "card_style": "journal"
}'::jsonb WHERE slug = 'vintage-paper';

-- 6. Fix Cyberpunk theme
UPDATE themes SET config = '{
    "accent_color": "#F0ABFC", "accent_soft": "rgba(240,171,252,0.15)", "font": "ibm-plex", "background": "#0A0014",
    "background_image": "/themes/cyberpunk_bg.png", "background_overlay": "linear-gradient(180deg, rgba(10,0,20,0.6), rgba(10,0,20,0.9))",
    "background_animation": "cyberpunk-pulse 8s ease-in-out infinite", "background_size": "cover", "card_style": "editorial"
}'::jsonb WHERE slug = 'cyberpunk';

-- 7. Fix Oceano theme
UPDATE themes SET config = '{
    "accent_color": "#38BDF8", "accent_soft": "rgba(56,189,248,0.12)", "font": "playfair", "background": "#020617",
    "background_image": "/themes/oceano_bg.png", "background_overlay": "linear-gradient(180deg, rgba(2,6,23,0.6), rgba(2,6,23,0.95))",
    "background_animation": "ocean-wave 20s ease-in-out infinite alternate", "background_size": "cover", "card_style": "editorial"
}'::jsonb WHERE slug = 'oceano';

-- 8. Fix Midnight Memoir theme
UPDATE themes SET config = '{
    "accent_color": "#3B82F6", "accent_soft": "rgba(59,130,246,0.1)", "font": "playfair", "background": "#05070A",
    "background_image": "/themes/midnight_memoir_bg.png", "background_overlay": "linear-gradient(180deg, rgba(5,7,10,0.6), rgba(5,7,10,0.9))",
    "background_size": "cover", "text_color": "#E2E8F0", "card_style": "editorial"
}'::jsonb WHERE slug = 'midnight-memoir';

-- 9. Fix Golden Journal theme
UPDATE themes SET config = '{
    "accent_color": "#D4AF37", "accent_soft": "rgba(212,175,55,0.1)", "font": "crimson", "background": "#FDFBF7",
    "background_image": "/themes/golden_journal_bg.png", "background_overlay": "linear-gradient(180deg, rgba(253,251,247,0.3), rgba(253,251,247,0.6))",
    "background_size": "cover", "text_color": "#2C2A26", "card_style": "journal", "is_light": true
}'::jsonb WHERE slug = 'golden-journal';

-- 10. Fix Rain Letters theme
UPDATE themes SET config = '{
    "accent_color": "#64748B", "accent_soft": "rgba(100,116,139,0.1)", "font": "inter", "background": "#1E293B",
    "background_image": "/themes/rain_letters_bg.png", "background_overlay": "linear-gradient(180deg, rgba(15,23,42,0.7), rgba(30,41,59,0.9))",
    "background_size": "cover", "text_color": "#CBD5E1", "card_style": "minimal"
}'::jsonb WHERE slug = 'rain-letters';

-- 11. Fix Scarlet Confession theme
UPDATE themes SET config = '{
    "accent_color": "#BE123C", "accent_soft": "rgba(190,18,60,0.1)", "font": "playfair", "background": "#1A050B",
    "background_image": "/themes/scarlet_confession_bg.png", "background_overlay": "linear-gradient(180deg, rgba(26,5,11,0.7), rgba(26,5,11,0.95))",
    "background_size": "cover", "text_color": "#F3E8E8", "card_style": "editorial"
}'::jsonb WHERE slug = 'scarlet-confession';
