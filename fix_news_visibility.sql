-- FIX NEWS VISIBILITY FOR ALL USERS
-- Ejecute este script en el Editor SQL de Supabase

-- 1. Eliminar política de lectura anterior (para evitar duplicados o conflictos)
DROP POLICY IF EXISTS "Public can view news" ON public.news;

-- 2. Crear políticas explícitas para cada rol
-- Esto asegura que tanto usuarios logueados (authenticated) como visitantes (anon) puedan ver
CREATE POLICY "Public Anon view news"
ON public.news
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Authenticated Users view news"
ON public.news
FOR SELECT
TO authenticated
USING (true);

-- 3. Confirmar permisos de Escritura (Admin)
-- (Opcional, solo para asegurar que no se rompieron)
-- DROP POLICY IF EXISTS "Admins can insert news" ON public.news;
-- CREATE POLICY "Admins can insert news" ON public.news FOR INSERT WITH CHECK ( public.is_admin() );
-- (Dejamos los de escritura como estaban en el script anterior)
