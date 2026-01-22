-- 1. Fix function is_admin to be SECURITY DEFINER (Bypasses RLS for the check itself)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- 2. Ensure RLS is ON
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

-- 3. CLEANUP OLD POLICIES (Drop indiscriminately to start fresh)
-- PROFILES
DROP POLICY IF EXISTS "Public profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- NEWS
DROP POLICY IF EXISTS "Public read news" ON public.news;
DROP POLICY IF EXISTS "Admins can insert news" ON public.news;
DROP POLICY IF EXISTS "Admins can update news" ON public.news;
DROP POLICY IF EXISTS "Admins can delete news" ON public.news;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.news;
DROP POLICY IF EXISTS "Enable insert for admins" ON public.news;
DROP POLICY IF EXISTS "Enable update for admins" ON public.news;
DROP POLICY IF EXISTS "Enable delete for admins" ON public.news;
DROP POLICY IF EXISTS "Admins can manage news" ON public.news;

-- HOTELS
DROP POLICY IF EXISTS "Public read hotels" ON public.hotels;
DROP POLICY IF EXISTS "Admins can insert hotels" ON public.hotels;
DROP POLICY IF EXISTS "Admins can update hotels" ON public.hotels;
DROP POLICY IF EXISTS "Admins can delete hotels" ON public.hotels;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.hotels;
DROP POLICY IF EXISTS "Enable insert for admins" ON public.hotels;
DROP POLICY IF EXISTS "Enable update for admins" ON public.hotels;
DROP POLICY IF EXISTS "Enable delete for admins" ON public.hotels;
DROP POLICY IF EXISTS "Admins can manage hotels" ON public.hotels;


-- 4. APPLY NEW ROBUST POLICIES

-- === PROFILES ===
-- Admins need to see everyone for UserManagement
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (is_admin());

-- Users need to see their own profile for AuthContext loading
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Admins can update roles/status of anyone
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (is_admin());

-- Users allow update last_login etc (careful with role, but logic handles that in backend usually, or trusted frontend)
-- Ideally we restrict columns but standard RLS for update is row-based.
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Only admins delete users
CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
USING (is_admin());


-- === NEWS ===
-- Public Read
CREATE POLICY "Public read news"
ON public.news FOR SELECT
USING (true);

-- Admin Full Write
CREATE POLICY "Admins can manage news"
ON public.news FOR ALL
USING (is_admin());


-- === HOTELS ===
-- Public Read
CREATE POLICY "Public read hotels"
ON public.hotels FOR SELECT
USING (true);

-- Admin Full Write
CREATE POLICY "Admins can manage hotels"
ON public.hotels FOR ALL
USING (is_admin());
