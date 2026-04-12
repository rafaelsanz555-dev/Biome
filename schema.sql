-- bio.me Database Schema

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  role text DEFAULT 'reader', 
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.creators (
  profile_id uuid REFERENCES public.profiles(id) PRIMARY KEY,
  stripe_account_id text,
  subscription_price numeric DEFAULT 3.00,
  stripe_product_id text,
  stripe_price_id text,
  is_active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.follows (
  follower_id uuid REFERENCES public.profiles(id),
  creator_id uuid REFERENCES public.creators(profile_id),
  created_at timestamp DEFAULT now(),
  PRIMARY KEY (follower_id, creator_id)
);

CREATE TABLE IF NOT EXISTS public.seasons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id uuid REFERENCES public.creators(profile_id) NOT NULL,
  title text NOT NULL,
  description text,
  sort_order int DEFAULT 1,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.episodes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id uuid REFERENCES public.seasons(id),
  creator_id uuid REFERENCES public.creators(profile_id) NOT NULL,
  title text NOT NULL,
  preview_text text,
  full_text text,
  cover_image_url text,
  audio_url text,
  is_published boolean DEFAULT false,
  is_subscription_only boolean DEFAULT true,
  ppv_price numeric,
  stripe_product_id text,
  stripe_price_id text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.entitlements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  creator_id uuid REFERENCES public.creators(profile_id),
  episode_id uuid REFERENCES public.episodes(id),
  entitlement_type text NOT NULL,
  valid_until timestamp,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  creator_id uuid REFERENCES public.creators(profile_id),
  amount numeric NOT NULL,
  currency text DEFAULT 'usd',
  transaction_type text NOT NULL,
  stripe_payment_intent text UNIQUE,
  status text DEFAULT 'pending',
  created_at timestamp DEFAULT now()
);

-- RLS Settings (Example: turning RLS on)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are visible to everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public creators are visible to everyone." ON public.creators FOR SELECT USING (true);
CREATE POLICY "Creators can update own config." ON public.creators FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Episodes are readable by everyone" ON public.episodes FOR SELECT USING (true);
-- To secure full_text, you'd handle it at the server level, or create a separate table with strict conditional RLS.


-- Note: We assume auth.users is already managed by Supabase. User trigger to insert profile on signup can also be added.

-- Supabase Storage Setup for Images
INSERT INTO storage.buckets (id, name, public) VALUES ('episodes', 'episodes', true) ON CONFLICT DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'episodes');
CREATE POLICY "Creators can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'episodes' AND auth.uid() IS NOT NULL);
CREATE POLICY "Creators can update their images" ON storage.objects FOR UPDATE USING (bucket_id = 'episodes' AND auth.uid() = owner);
CREATE POLICY "Creators can delete their images" ON storage.objects FOR DELETE USING (bucket_id = 'episodes' AND auth.uid() = owner);
