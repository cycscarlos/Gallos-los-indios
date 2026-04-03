-- Políticas RLS corregidas para evitar recursión infinita
-- Usa auth.jwt() -> 'user_metadata' ->> 'rol' en lugar de consultar la tabla usuarios

-- DELETE: Usuarios - permitido para admins (no puede eliminarse a sí mismo)
DROP POLICY IF EXISTS "Admins pueden eliminar usuarios" ON usuarios;

CREATE POLICY "Admins pueden eliminar usuarios"
ON usuarios FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin'
  AND id != auth.uid()
);

-- UPDATE: Usuarios - permitido para admins
DROP POLICY IF EXISTS "Admins pueden actualizar usuarios" ON usuarios;

CREATE POLICY "Admins pueden actualizar usuarios"
ON usuarios FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin'
);
