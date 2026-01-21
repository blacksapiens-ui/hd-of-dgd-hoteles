-- Fix for Infinite Recursion in RLS Policies
-- Execute this in Supabase SQL Editor

-- 1. Create a secure function to check admin status
-- This bypasses RLS to avoid the infinite loop
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 2. You will need to update your policies manually or run the following:
-- (Uncomment and run if you want to replace the policy completely)

-- DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
-- CREATE POLICY "Admins can view all profiles" 
-- ON public.profiles 
-- FOR SELECT 
-- USING ( is_admin() );

-- DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
-- CREATE POLICY "Users can view own profile" 
-- ON public.profiles 
-- FOR SELECT 
-- USING ( auth.uid() = id );
