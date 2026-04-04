-- Políticas RLS de SELECT para tabla usuarios
-- Permite a usuarios autenticados leer su propio registro

-- SELECT: usuarios pueden leer su propio registro
CREATE POLICY "Usuarios pueden leer su propio registro"
ON usuarios FOR SELECT
TO authenticated
USING (id = auth.uid());

-- SELECT: admins pueden leer todos los usuarios
CREATE POLICY "Admins pueden leer todos los usuarios"
ON usuarios FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM usuarios u
        WHERE u.id = auth.uid()
        AND u.rol = 'admin'
    )
);