-- ============================================
-- SCRIPT 01: CREAR TABLAS BASE DE DATOS
-- Proyecto: Gallos Los Indios
-- Fecha: 17 Marzo 2026
-- ============================================

-- Tabla: usuarios (gestión de admins)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('admin', 'soporte')) DEFAULT 'soporte',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: ejemplares (gallos de la网站上)
CREATE TABLE IF NOT EXISTS ejemplares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    tipo TEXT,
    peso DECIMAL(5,2),
    edad INTEGER,
    pedigree_resumido TEXT,
    pedigree_completo JSONB,
    imagen_url TEXT,
    precio TEXT,
    descripcion TEXT,
    estado TEXT DEFAULT 'disponible' CHECK (estado IN ('disponible', 'vendido', 'reservado')),
    destacado BOOLEAN DEFAULT false,
    orden INTEGER DEFAULT 0,
    creado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: consultas (mensajes del formulario de contacto)
CREATE TABLE IF NOT EXISTS consultas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    mensaje TEXT NOT NULL,
    tema TEXT,
    leido BOOLEAN DEFAULT false,
    respondida BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ejemplares ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;

-- Comentarios para documentación
COMMENT ON TABLE usuarios IS 'Usuarios administradores del sistema';
COMMENT ON TABLE ejemplares IS 'Catálogo de gallos de la网站';
COMMENT ON TABLE consultas IS 'Consultas recibidas desde el formulario de contacto';
