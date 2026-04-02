# Scripts SQL - Gallos Los Indios

Scripts SQL para ejecutar en Supabase (Dashboard > SQL Editor).

## Uso

1. Abrir **Supabase Dashboard**
2. Ir a **SQL Editor**
3. Copiar y pegar el contenido del script deseado
4. Ejecutar (botón "Run")

---

## Scripts Disponibles

### `rls_usuarios_fix.sql`
**Propósito:** Corregir políticas RLS de la tabla `usuarios`

**Problema resuelto:**
- DELETE de usuarios fallaba por políticas RLS incorrectas
- UPDATE de usuarios fallaba por políticas RLS incorrectas

**Nueva política DELETE:**
- Permite a admins eliminar usuarios (excepto a sí mismos)
- Usa `auth.jwt() -> 'user_metadata' ->> 'rol'` para evitar recursión infinita

**Nueva política UPDATE:**
- Permite a admins actualizar usuarios
- Verifica rol desde JWT

---

## Notas

- Los scripts están diseñados para ejecutarse directamente en el SQL Editor de Supabase
- No requieren herramientas adicionales (CLI de Supabase)
- Los scripts son idempotentes (se pueden ejecutar múltiples veces)