-- FIX RLS FINAL (V3) - ROMPIENDO EL BUCLE
-- Ejecute TODO este script.

-- 1. Eliminamos todo lo previo para limpiar
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP FUNCTION IF EXISTS public.is_admin();

-- 2. Creamos la función is_admin con SEARCH_PATH seguro
-- IMPORTANTE: "SECURITY DEFINER" hace que la función se ejecute con los permisos del CREADOR (postgres/admin),
-- IGNORANDO las políticas RLS de la tabla para la consulta interna.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Esta consulta se ejecuta como superusuario/creador, saltándose RLS
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- 3. Políticas Simplificadas

-- Política para que CUALQUIERA pueda leer su propio perfil
-- (Esto es necesario para que AuthContext funcione al inicio)
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING ( auth.uid() = id );

-- Política para que los ADMINS puedan ver TODO (usando la función segura)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING ( is_admin() );

-- Política de actualización solo para uno mismo
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING ( auth.uid() = id );

-- Política de inserción (registro)
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK ( auth.uid() = id );
