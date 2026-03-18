-- ============================================
-- SCRIPT 03: TRIGGER AUTENTICACIÓN
-- Sincroniza usuarios de Supabase Auth con tabla usuarios
-- Proyecto: Gallos Los Indios
-- Fecha: 17 Marzo 2026
-- ============================================

-- Función que se ejecuta al crear usuario en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar nuevo usuario en tabla usuarios con rol soporte por defecto
    INSERT INTO public.usuarios (id, email, nombre, rol, activo)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'rol', 'soporte'),
        true
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función al crear usuario en Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- NOTA IMPORTANTE:
-- Este trigger crea automáticamente un registro
-- en la tabla 'usuarios' cuando alguien se registra
-- en Supabase Auth.
--
-- Para el primer usuario admin, después de crear
-- la cuenta en Auth, ejecutar:
--
-- UPDATE usuarios 
-- SET rol = 'admin' 
-- WHERE email = 'luiscolmenaresa.indio@gmail.com';
-- ============================================
