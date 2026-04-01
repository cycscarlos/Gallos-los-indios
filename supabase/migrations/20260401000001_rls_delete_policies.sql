-- Políticas RLS de DELETE para tablas admin
-- Permite a usuarios autenticados con rol 'admin' eliminar registros

-- Consultas: DELETE permitido para admins
CREATE POLICY "Admins pueden eliminar consultas"
ON consultas FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'admin'
  )
);

-- Usuarios: DELETE permitido para admins (no puede eliminarse a sí mismo)
CREATE POLICY "Admins pueden eliminar usuarios"
ON usuarios FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'admin'
  )
  AND id != auth.uid()
);

-- Ejemplares: DELETE permitido para admins
CREATE POLICY "Admins pueden eliminar ejemplares"
ON ejemplares FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'admin'
  )
);
