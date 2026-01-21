-- Execute this in your Supabase Dashboard SQL Editor

-- 1. Add last_login column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- 2. Create RPC function to delete users securely
-- This needs to be run with privileges (postgres role in Dashboard has this)
CREATE OR REPLACE FUNCTION public.delete_user(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete from public.profiles
  DELETE FROM public.profiles WHERE id = user_id;
  
  -- Delete from auth.users (this removes the login credentials)
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;
