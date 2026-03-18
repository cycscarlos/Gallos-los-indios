-- ============================================
-- SCRIPT 02: POLÍTICAS RLS (Row Level Security)
-- Proyecto: Gallos Los Indios
-- Fecha: 17 Marzo 2026
-- ============================================

-- ============================================
-- POLÍTICAS PARA TABLA: usuarios
-- ============================================

-- Todos pueden leer usuarios (solo admins verían esto)
CREATE POLICY "Permitir lectura usuarios" ON usuarios
    FOR SELECT
    USING (true);

-- Solo admins pueden insertar/actualizar usuarios
CREATE POLICY "Permitir manage usuarios" ON usuarios
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid()
            AND rol = 'admin'
            AND activo = true
        )
    );


-- ============================================
-- POLÍTICAS PARA TABLA: ejemplares
-- ============================================

-- Público puede leer ejemplares disponibles
CREATE POLICY "Publico puede leer ejemplares" ON ejemplares
    FOR SELECT
    USING (
        estado = 'disponible' 
        OR EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid()
            AND activo = true
        )
    );

-- Soporte y Admin pueden insertar/actualizar
CREATE POLICY "Soporte y Admin pueden gestionar ejemplares" ON ejemplares
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid()
            AND rol IN ('admin', 'soporte')
            AND activo = true
        )
    );


-- ============================================
-- POLÍTICAS PARA TABLA: consultas
-- ============================================

-- Público puede crear consultas (formulario contacto)
CREATE POLICY "Publico puede crear consultas" ON consultas
    FOR INSERT
    WITH CHECK (true);

-- Público puede leer solo sus propias consultas (opcional)
CREATE POLICY "Usuario puede leer sus consultas" ON consultas
    FOR SELECT
    USING (
        email = auth.jwt()->>'email'
        OR EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid()
            AND activo = true
        )
    );

-- Solo soporte y admin pueden actualizar consultas
CREATE POLICY "Soporte y Admin pueden gestionar consultas" ON consultas
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid()
            AND rol IN ('admin', 'soporte')
            AND activo = true
        )
    );


-- ============================================
-- NOTA IMPORTANTE:
-- Las políticas RLS usan auth.uid() que depende
-- de Supabase Auth. El trigger de autenticación
-- se configura en Script 03.
-- ============================================
