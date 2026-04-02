-- Políticas RLS actualizadas para DELETE de usuarios
-- Usar auth.jwt() -> 'user_metadata' ->> 'rol' para evitar recursión infinita

-- Eliminar políticas existentes de DELETE en usuarios (si existen)
DROP POLICY IF EXISTS "Admins pueden eliminar usuarios" ON usuarios;

-- Nueva política DELETE para usuarios - verificar rol desde JWT
CREATE POLICY "Admins pueden eliminar usuarios"
ON usuarios FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin'
  AND id != auth.uid()
);

-- Eliminar políticas existentes de UPDATE en usuarios (si existen)
DROP POLICY IF EXISTS "Admins pueden actualizar usuarios" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON usuarios;

-- Nueva política UPDATE para usuarios
CREATE POLICY "Admins pueden actualizar usuarios"
ON usuarios FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin'
);