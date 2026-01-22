-- SCRIPT MAESTRO DE REPARACION DE NOTICIAS
-- Ejecute TODO este script en el Editor SQL de Supabase

-- 1. Asegurar que la extensión para UUIDs exista
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Asegurar que la función de seguridad 'is_admin' exista
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
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

-- 3. Crear tabla 'news' si no existe
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. AGREGAR COLUMNAS FALTANTES (snake_case)
-- Esto arregla el problema si la tabla ya existía con columnas diferentes
DO $$
BEGIN
    ALTER TABLE public.news ADD COLUMN IF NOT EXISTS category TEXT;
    ALTER TABLE public.news ADD COLUMN IF NOT EXISTS tag_color TEXT;
    ALTER TABLE public.news ADD COLUMN IF NOT EXISTS title TEXT;
    ALTER TABLE public.news ADD COLUMN IF NOT EXISTS content TEXT;
    ALTER TABLE public.news ADD COLUMN IF NOT EXISTS related_hotel_id TEXT;
    ALTER TABLE public.news ADD COLUMN IF NOT EXISTS destination TEXT;
    ALTER TABLE public.news ADD COLUMN IF NOT EXISTS publish_date DATE;
    ALTER TABLE public.news ADD COLUMN IF NOT EXISTS expiration_date DATE;
    ALTER TABLE public.news ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'Column already exists';
END $$;

-- 5. Asegurar RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- 6. Limpiar políticas antiguas (por si acaso)
DROP POLICY IF EXISTS "Public can view news" ON public.news;
DROP POLICY IF EXISTS "Admins can manage news" ON public.news;
DROP POLICY IF EXISTS "Admins can insert news" ON public.news;
DROP POLICY IF EXISTS "Admins can update news" ON public.news;
DROP POLICY IF EXISTS "Admins can delete news" ON public.news;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.news;
DROP POLICY IF EXISTS "Enable insert for admins" ON public.news;
DROP POLICY IF EXISTS "Enable update for admins" ON public.news;
DROP POLICY IF EXISTS "Enable delete for admins" ON public.news;

-- 7. Crear Políticas Definitivas

-- Lectura para TODOS
CREATE POLICY "Public can view news" 
ON public.news FOR SELECT 
USING ( true );

-- Escritura solo para ADMINS
CREATE POLICY "Admins can insert news" 
ON public.news FOR INSERT 
WITH CHECK ( public.is_admin() );

CREATE POLICY "Admins can update news" 
ON public.news FOR UPDATE 
USING ( public.is_admin() );

CREATE POLICY "Admins can delete news" 
ON public.news FOR DELETE 
USING ( public.is_admin() );
