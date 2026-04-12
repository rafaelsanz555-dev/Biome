-- ==========================================
-- BIO.ME v2 — Supabase Setup Script
-- ==========================================
-- Paste everything in Supabase SQL Editor → Run

-- ==========================================
-- 1. Core Tables
-- ==========================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  role text DEFAULT 'reader',  -- 'reader' | 'writer' | 'admin'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS creators (
  profile_id uuid REFERENCES profiles(id) PRIMARY KEY,
  stripe_account_id text,
  subscription_price numeric DEFAULT 5.00,  -- monthly price for readers
  stripe_product_id text,
  stripe_price_id text,
  is_active boolean DEFAULT true,
  writer_subscription_active boolean DEFAULT false,  -- has writer paid $5/mo?
  writer_stripe_subscription_id text
);

CREATE TABLE IF NOT EXISTS follows (
  follower_id uuid REFERENCES profiles(id),
  creator_id uuid REFERENCES creators(profile_id),
  created_at timestamp DEFAULT now(),
  PRIMARY KEY (follower_id, creator_id)
);

CREATE TABLE IF NOT EXISTS seasons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id uuid REFERENCES creators(profile_id) NOT NULL,
  title text NOT NULL,
  description text,
  sort_order int DEFAULT 1,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS episodes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id uuid REFERENCES seasons(id),
  creator_id uuid REFERENCES creators(profile_id) NOT NULL,
  title text NOT NULL,
  preview_text text,
  full_text text,
  cover_image_url text,
  images text[],                          -- NEW: array of image URLs in the post
  audio_url text,
  is_published boolean DEFAULT false,
  is_subscription_only boolean DEFAULT true,
  ppv_price numeric,
  stripe_product_id text,
  stripe_price_id text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entitlements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  creator_id uuid REFERENCES creators(profile_id),
  episode_id uuid REFERENCES episodes(id),
  entitlement_type text NOT NULL,  -- 'subscription' | 'ppv'
  valid_until timestamp,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  creator_id uuid REFERENCES creators(profile_id),
  amount numeric NOT NULL,
  currency text DEFAULT 'usd',
  transaction_type text NOT NULL,  -- 'ppv' | 'subscription' | 'tip' | 'gift'
  stripe_payment_intent text UNIQUE,
  status text DEFAULT 'pending',
  created_at timestamp DEFAULT now()
);

-- NEW: Gifts table
CREATE TABLE IF NOT EXISTS gifts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES profiles(id),
  recipient_id uuid REFERENCES profiles(id) NOT NULL,
  post_id uuid REFERENCES episodes(id),
  amount numeric NOT NULL,           -- total amount in USD (e.g., $10)
  platform_fee numeric NOT NULL,     -- 12% goes to bio.me
  writer_earnings numeric NOT NULL,  -- 88% goes to writer
  emoji text,
  stripe_payment_intent text UNIQUE,
  status text DEFAULT 'pending',     -- 'pending' | 'completed'
  created_at timestamp DEFAULT now()
);

-- ==========================================
-- 2. Enable Row Level Security
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. RLS Policies
-- ==========================================

-- Profiles
CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Creators
CREATE POLICY "Public creators viewable" ON creators FOR SELECT USING (true);
CREATE POLICY "Creators insert own" ON creators FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Creators update own" ON creators FOR UPDATE USING (auth.uid() = profile_id);

-- Seasons & Episodes
CREATE POLICY "Seasons viewable by everyone" ON seasons FOR SELECT USING (true);
CREATE POLICY "Creators manage seasons" ON seasons FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Episodes viewable by everyone" ON episodes FOR SELECT USING (true);
CREATE POLICY "Creators manage episodes" ON episodes FOR ALL USING (auth.uid() = creator_id);

-- Entitlements
CREATE POLICY "Users see own entitlements" ON entitlements FOR SELECT USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users see own transactions" ON transactions FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = creator_id);

-- Gifts
CREATE POLICY "Senders see own gifts" ON gifts FOR SELECT USING (auth.uid() = sender_id);
CREATE POLICY "Recipients see gifts they received" ON gifts FOR SELECT USING (auth.uid() = recipient_id);

-- ==========================================
-- 4. Storage Buckets
-- ==========================================

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Avatar images are public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Post images are public" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
CREATE POLICY "Writers upload post images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post-images');
