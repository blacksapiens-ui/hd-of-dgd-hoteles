-- SECURE PUBLIC ACCESS & FIX VULNERABILITIES (CORRECTED)
-- Ejecutar en Supabase SQL Editor

-- ==========================================
-- 1. SECURIZING 'news' TABLE
-- ==========================================

-- Drop ALL potential existing policies to ensure clean slate
DROP POLICY IF EXISTS "Public can view news" ON public.news;
DROP POLICY IF EXISTS "Public insert news" ON public.news;
DROP POLICY IF EXISTS "Public update news" ON public.news;
DROP POLICY IF EXISTS "Public Anon view news" ON public.news;
DROP POLICY IF EXISTS "Authenticated Users view news" ON public.news;
DROP POLICY IF EXISTS "Admins can insert news" ON public.news;
DROP POLICY IF EXISTS "Admins can update news" ON public.news;
DROP POLICY IF EXISTS "Admins can delete news" ON public.news;
-- Drop the specific ones we are about to create to avoid "already exists" error
DROP POLICY IF EXISTS "Public read news" ON public.news;


-- READ: Allow everyone (anon + authenticated) to view news
CREATE POLICY "Public read news"
ON public.news
FOR SELECT
TO public
USING (true);

-- WRITE: Allow ONLY Admins to Insert, Update, Delete
CREATE POLICY "Admins can insert news"
ON public.news
FOR INSERT
WITH CHECK ( public.is_admin() );

CREATE POLICY "Admins can update news"
ON public.news
FOR UPDATE
USING ( public.is_admin() );

CREATE POLICY "Admins can delete news"
ON public.news
FOR DELETE
USING ( public.is_admin() );


-- ==========================================
-- 2. SECURIZING 'hotels' TABLE
-- ==========================================

-- Drop ALL potential existing policies
DROP POLICY IF EXISTS "Public read hotels" ON public.hotels;
DROP POLICY IF EXISTS "Public insert hotels" ON public.hotels;
DROP POLICY IF EXISTS "Public update hotels" ON public.hotels;
DROP POLICY IF EXISTS "Admins can insert hotels" ON public.hotels;
DROP POLICY IF EXISTS "Admins can update hotels" ON public.hotels;
DROP POLICY IF EXISTS "Admins can delete hotels" ON public.hotels;

-- READ: Allow everyone to view hotels
CREATE POLICY "Public read hotels"
ON public.hotels
FOR SELECT
TO public
USING (true);

-- WRITE: Allow ONLY Admins to Insert, Update, Delete
CREATE POLICY "Admins can insert hotels"
ON public.hotels
FOR INSERT
WITH CHECK ( public.is_admin() );

CREATE POLICY "Admins can update hotels"
ON public.hotels
FOR UPDATE
USING ( public.is_admin() );

CREATE POLICY "Admins can delete hotels"
ON public.hotels
FOR DELETE
USING ( public.is_admin() );
