-- FIX NEWS MODULE & PERMISSIONS
-- Ejecute este script en el Editor SQL de Supabase

-- 1. Asegurar estructura correcta de la tabla 'news' (usando snake_case)
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    category TEXT NOT NULL,
    tag_color TEXT,
    title TEXT NOT NULL,
    content TEXT,
    related_hotel_id TEXT, -- Puede ser UUID si tus hoteles usan UUID, dejémoslo como TEXT por compatibilidad
    destination TEXT,
    publish_date DATE,
    expiration_date DATE,
    is_active BOOLEAN DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- 2. Limpiar políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Public can view news" ON public.news;
DROP POLICY IF EXISTS "Admins can manage news" ON public.news;
DROP POLICY IF EXISTS "Admins can insert news" ON public.news;
DROP POLICY IF EXISTS "Admins can update news" ON public.news;
DROP POLICY IF EXISTS "Admins can delete news" ON public.news;

-- 3. Crear Nuevas Políticas

-- A. Lectura Pública: Cualquiera puede ver las noticias
CREATE POLICY "Public can view news" 
ON public.news 
FOR SELECT 
USING ( true );

-- B. Escritura Administrativa: Solo admins pueden insertar/editar/borrar
-- Usamos la función is_admin() que ya arreglamos

CREATE POLICY "Admins can insert news" 
ON public.news 
FOR INSERT 
WITH CHECK ( is_admin() );

CREATE POLICY "Admins can update news" 
ON public.news 
FOR UPDATE 
USING ( is_admin() );

CREATE POLICY "Admins can delete news" 
ON public.news 
FOR DELETE 
USING ( is_admin() );
