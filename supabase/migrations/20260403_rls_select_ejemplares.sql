-- Políticas RLS de SELECT para tabla ejemplares
-- Permite a usuarios autenticados leer ejemplares

-- SELECT: usuarios autenticados pueden leer ejemplares
CREATE POLICY "Usuarios pueden leer ejemplares"
ON ejemplares FOR SELECT
TO authenticated
USING (true);

-- SELECT: cualquier usuario (incluyendo anonimo) puede leer ejemplares disponibles
CREATE POLICY "Publico puede leer ejemplares disponibles"
ON ejemplares FOR SELECT
TO anon
USING (estado = 'disponible');