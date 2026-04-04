-- Permitir a soporte leer todos los usuarios (Solo lectura)
DROP POLICY IF EXISTS "Admins pueden leer todos los usuarios" ON usuarios;

CREATE POLICY "Admins y Soporte pueden leer todos los usuarios"
ON usuarios FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM usuarios u
        WHERE u.id = auth.uid()
        AND u.rol IN ('admin', 'soporte')
    )
);
