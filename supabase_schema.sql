-- Supabase PostgreSQL Schema for Daily Islamic Blogging Platform & Custom CMS

-- 1. Create enum for post content types
CREATE TYPE post_content_type AS ENUM ('text_only', 'image_only', 'image_text');
CREATE TYPE post_status AS ENUM ('draft', 'published');

-- 2. Create Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_type post_content_type DEFAULT 'image_text'::post_content_type NOT NULL,
  title TEXT,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT,
  cover_image TEXT,
  category TEXT DEFAULT 'Daily Reflection',
  tags TEXT[] DEFAULT '{}',
  author_name TEXT DEFAULT 'Imran Ahmad',
  author_avatar TEXT,
  author_email TEXT,
  status post_status DEFAULT 'published'::post_status NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  read_time INT DEFAULT 2,
  views INT DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Users / Admin Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  google_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar TEXT,
  is_admin BOOLEAN DEFAULT TRUE,
  secret_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Subscriptions Table for Web Push Notifications
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT UNIQUE NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  user_agent TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published posts
CREATE POLICY "Public read access for published posts"
  ON public.posts FOR SELECT
  USING (status = 'published');

-- Allow public insert to subscriptions
CREATE POLICY "Allow public subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (true);
