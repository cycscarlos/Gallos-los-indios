-- ============================================
-- SCRIPT 05: STORAGE (BUCKET IMÁGENES)
-- Proyecto: Gallos Los Indios
-- Fecha: 17 Marzo 2026
-- ============================================

-- NOTA: Este script es de REFERENCE ONLY
-- El Storage se configura desde el panel de Supabase
-- en la sección Storage > New bucket
--
-- INSTRUCCIONES:
-- 1. Ir a Supabase Dashboard > Storage
-- 2. Crear nuevo bucket:
--    - Name: ejemplos
--    - Public bucket: YES (para que sea accesible públicamente)
-- 3. Configurar políticas:
--    - Publico puede LEER archivos
--    - Solo auth usuarios pueden SUBIR archivos
--
-- POLÍTICAS SQL (ejecutar después de crear bucket):

/*
-- Permitir lectura pública de imágenes
CREATE POLICY "Publico puede ver imagenes"
ON storage.objects FOR SELECT
USING ( bucket_id = 'ejemplos' );

-- Permitir upload a usuarios autenticados
CREATE POLICY "Usuarios pueden subir imagenes"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'ejemplos' 
    AND auth.role() = 'authenticated'
);

-- Permitir delete a usuarios autenticados
CREATE POLICY "Usuarios pueden eliminar imagenes"
ON storage.objects FOR DELETE
USING ( auth.role() = 'authenticated' );
*/
