-- FIX RLS PERMANENTE - V2
-- Por favor, ejecute TODO este script en el Editor SQL de Supabase.

-- 1. Aseguramos que la función existe
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

-- 2. ELIMINAMOS las políticas antiguas que causan el error
-- (Intenta borrar variantes comunes de nombres de políticas)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
-- Elimina cualquier política que permita SELECT a todos
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- 3. CREAMOS las nuevas políticas seguras

-- Política A: Admins pueden ver TODO
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR ALL 
USING ( is_admin() );

-- Política B: Usuarios pueden ver SU PROPIO perfil
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING ( auth.uid() = id );

-- Política C: Usuarios pueden actualizar SU PROPIO perfil
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING ( auth.uid() = id );

-- Política D: Permitir inserción al registrarse
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK ( auth.uid() = id );
