# Informe de Errores y Soluciones - Módulo de Usuarios

**Fecha:** 2 de abril de 2026
**Analista:** opencode (asistente IA)

---

## Resumen

Se identificaron y corrigieron 3 problemas críticos en el módulo de gestión de usuarios del panel de administración.

---

## Problema 1: Modal congelado al crear usuario

### Síntomas
- Al crear un nuevo usuario, el modal queda congelado en "Guardando..."
- El usuario se crea correctamente en la base de datos
- Para cerrar el modal hay que pulsar "Cancelar" o "X"

### Causa raíz
El método `supabase.auth.signUp()` reemplaza la sesión actual del administrador, causando que:
1. El estado de autenticación cambia
2. El modal no se cierra correctamente
3. La UI queda bloqueada

### Solución aplicada

**1.1 Edge function `create-user`**

Se creó una edge function que usa `supabase.auth.admin.createUser()` con la service role key, lo cual:
- No afecta la sesión del admin
- Crea el usuario en Supabase Auth
- Inserta el registro en la tabla `usuarios`

**Archivo:** `supabase/functions/create-user/index.ts`

```typescript
const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { nombre }
})
```

**1.2 Actualización de `usuarios.js`**

Se modificó `src/admin/usuarios.js` para usar la edge function:

```javascript
const result = await API.functions.invoke('create-user', {
  email,
  password,
  nombre,
  rol
});
```

También se agregó recarga de página después de crear para asegurar que el estado de auth esté correcto.

---

## Problema 2: Botón "Cerrar sesión" inactivo

### Síntomas
- Después de crear un usuario y volver al dashboard
- El botón "Cerrar sesión" queda inactivo
- Solo se reactiva al recargar la página manualmente

### Causa raíz
Cuando `supabase.auth.signUp()` ejecuta, cambia el estado de autenticación y puede dejar el event listener del botón en un estado inconsistente.

### Solución aplicada

Se agregó `window.location.reload()` después de crear un usuario exitosamente:

```javascript
closeModal();
await loadUsuarios();
window.location.reload();
```

Esto re-inicializa todo el estado de la aplicación correctamente.

---

## Problema 3: No permite eliminar usuarios

### Síntomas
- Al intentar eliminar un usuario, aparece un alert:
  > "No se pudo eliminar. Verifica que tienes permisos de administrador y que no estás intentando eliminarte a ti mismo."

### Causa raíz
Las políticas RLS (Row Level Security) tenían un problema de recursión infinita:
- Las políticas consultaban la tabla `usuarios` dentro del `USING`
- Esto causaba que la política se invocara a sí misma
- Resultado: timeout de 8 segundos y error de permisos

### Solución aplicada

**3.1 Edge function `delete-user`**

Se creó una edge function que usa la service role key para evitar RLS:

**Archivo:** `supabase/functions/delete-user/index.ts`

```typescript
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Eliminar de la tabla usuarios
await supabaseAdmin.from('usuarios').delete().eq('id', id)

// Eliminar de Supabase Auth
await supabaseAdmin.auth.admin.deleteUser(id)
```

**3.2 Migración SQL de políticas RLS corregidas**

Se creó el archivo `supabase/migrations/20260402_rls_usuarios_fix.sql`:

```sql
-- Usa auth.jwt() -> 'user_metadata' ->> 'rol' en lugar de consultar la tabla usuarios
-- Esto evita la recursión infinita

CREATE POLICY "Admins pueden eliminar usuarios"
ON usuarios FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin'
  AND id != auth.uid()
);

CREATE POLICY "Admins pueden actualizar usuarios"
ON usuarios FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin'
);
```

**3.3 Actualización de `usuarios.js`**

Se cambió el método de eliminación para usar la edge function:

```javascript
async function deleteUsuario(id) {
  const result = await API.functions.invoke('delete-user', { id });
  if (result.error) {
    alert('Error al eliminar: ' + result.error.message);
  } else {
    usuarios = usuarios.filter(u => u.id !== id);
    renderUsuarios(usuarios);
  }
}
```

---

## Archivos modificados/creados

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `supabase/functions/create-user/index.ts` | Creado | Edge function para crear usuarios |
| `supabase/functions/create-user/deno.json` | Creado | Configuración Deno |
| `supabase/functions/delete-user/index.ts` | Creado | Edge function para eliminar usuarios |
| `supabase/functions/delete-user/deno.json` | Creado | Configuración Deno |
| `supabase/config.toml` | Modificado | Registradas las 2 edge functions |
| `supabase/migrations/20260402_rls_usuarios_fix.sql` | Creado | Políticas RLS corregidas |
| `src/admin/usuarios.js` | Modificado | Usar edge functions para crear/eliminar |
| `src/lib/auth.js` | Modificado | Removido import de `register` (ya no se usa) |

---

## Estado actual

| Problema | Estado | Fecha resolución |
|----------|--------|------------------|
| Modal congelado al crear usuario | ✅ RESUELTO | 2 abril 2026 |
| Botón cerrar sesión inactivo | ✅ RESUELTO | 2 abril 2026 |
| No permite eliminar usuario | ✅ RESUELTO | 2 abril 2026 |

---

## Deployment realizado

Las edge functions fueron desplegadas exitosamente:

```bash
npx supabase functions deploy create-user
npx supabase functions deploy delete-user
```

La migración RLS debe ejecutarse manualmente en el SQL Editor del Dashboard de Supabase.

---

## Pendiente por ejecutar en Supabase

El siguiente SQL debe ejecutarse en el SQL Editor de Supabase:

```sql
DROP POLICY IF EXISTS "Admins pueden eliminar usuarios" ON usuarios;

CREATE POLICY "Admins pueden eliminar usuarios"
ON usuarios FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin'
  AND id != auth.uid()
);

DROP POLICY IF EXISTS "Admins pueden actualizar usuarios" ON usuarios;

CREATE POLICY "Admins pueden actualizar usuarios"
ON usuarios FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin'
);
```

---

*Documento generado el 2 de abril de 2026*
