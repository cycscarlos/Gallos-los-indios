-- ============================================
-- SCRIPT 04: DATOS DE EJEMPLO (OPCIONAL)
-- Proyecto: Gallos Los Indios
-- Fecha: 17 Marzo 2026
-- ============================================

-- Insertar ejemplos de ejemplares (solo para testing)
-- NOTA: imagen_url debe ser la URL pública de Supabase Storage

INSERT INTO ejemplares (nombre, categoria, tipo, peso, edad, pedigree_resumido, precio, descripcion, estado, destacado, orden) VALUES
('Indio Grande', 'Pelea', 'Gallo Americano', 3.5, 2, 'Hijo de Estrella 501', '$150', 'Gallo de línea pura con pedigree certificado', 'disponible', true, 1),
('El Trueno', 'Pelea', 'Gallo Peruano', 4.2, 3, 'Nieto de Combatiente 007', '$200', 'Experto en peleas de campo', 'disponible', true, 2),
('Diamante Negro', 'Pelea', 'Gallo Español', 3.8, 2, 'Línea original de José', '$180', 'Color negro con reflejos dorados', 'disponible', false, 3),
('Aurelio', 'Reproducción', 'Padrillo', 5.0, 4, 'Padre de múltiples campeones', '$250', 'Excelente genetics para reproducción', 'disponible', true, 4),
('La Esperanza', 'Pelea', 'Gallo Americano', 3.2, 1, 'Hijo de Indio Grande', '$100', 'Gallo joven con gran potencial', 'disponible', false, 5);


-- Insertar una consulta de ejemplo
INSERT INTO consultas (nombre, email, telefono, mensaje, tema) VALUES
('Juan Pérez', 'juan@example.com', '+52 618 123 4567', 'Me interesa comprar el gallo Indio Grande, ¿tienen envío a Durango?', 'compra');
