-- Políticas RLS de UPDATE para tablas admin
-- Permite a usuarios autenticados con rol 'admin' actualizar registros

-- Consultas: UPDATE permitido para admins (leido, respondida)
CREATE POLICY "Admins pueden actualizar consultas"
ON consultas FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'admin'
  )
);

-- Usuarios: UPDATE permitido para admins
CREATE POLICY "Admins pueden actualizar usuarios"
ON usuarios FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'admin'
  )
);

-- Ejemplares: UPDATE permitido para admins
CREATE POLICY "Admins pueden actualizar ejemplares"
ON ejemplares FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'admin'
  )
);
