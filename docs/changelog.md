# Changelog - Gallos Los Indios

## [2026-04-03] - Fix Errors Crear/Eliminar Usuarios + UI Contraseñas

### Problemas Resueltos

#### 1. Edge Functions con CORS
**Problema:** Error "Failed to send a request to the Edge Function" por CORS bloqueado.

**Solución:**
- Agregados headers CORS a `create-user` y `delete-user`:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type`
  - Soporte para método OPTIONS (preflight)
- Configurado `verify_jwt = false` en `config.toml`

**Archivos modificados:**
- `supabase/functions/create-user/index.ts`
- `supabase/functions/delete-user/index.ts`
- `supabase/config.toml`

---

#### 2. Timeout Aumentado
**Problema:** Timeout de 8s se agotaba en llamadas consecutivas.

**Solución:**
- Aumentado timeout de 8000ms a 15000ms en `withTimeout()`

**Archivos modificados:**
- `src/lib/supabase.js`

---

#### 3. Error 409 Duplicate Key
**Problema:** Error al crear usuarios (ID ya existente en tabla usuarios).

**Solución:**
- Verificación de usuario existente por email antes de crear
- Verificación de ID antes de insertar en tabla usuarios
- Si existe, retorna el usuario existente en lugar de crear duplicado

**Archivos modificados:**
- `supabase/functions/create-user/index.ts`

---

#### 4. Edge Function delete-user
**Problema:** No se podían eliminar usuarios por políticas RLS con recursión infinita.

**Solución:**
- Creada edge function que usa service role key (evita RLS)
- Verifica que el usuario no se elimine a sí mismo
- Elimina tanto de la tabla `usuarios` como de Supabase Auth

**Archivos nuevos:**
- `supabase/functions/delete-user/index.ts`
- `supabase/functions/delete-user/deno.json`

**Archivos modificados:**
- `supabase/config.toml` - Registrada función `delete-user`
- `src/admin/usuarios.js` - Usa edge function para eliminar
- `supabase/migrations/20260402_rls_usuarios_fix.sql` - Migración RLS corregida

---

#### 5. Modal Crear Usuario - Fix Congelamiento
**Problema:** Modal se quedaba congelado después de crear usuario, botón cerrar sesión inactivo.

**Solución:**
- Eliminado `window.location.reload()` que causaba problemas con la sesión
- Ahora solo cierra el modal y carga usuarios
- Botón cerrar sesión se mantiene activo

**Archivos modificados:**
- `src/admin/usuarios.js`

---

### UI: Toggle Ojo en Contraseñas

#### 6. Login - Ojo Toggle
**Problema:** Campo de contraseña sin opción para ver/ocultar.

**Solución:**
- Agregado botón toggle con icono ojo
- Función expuesta a window para que sea accesible desde onclick
- Estilo dorado (`var(--gold-primary)`) para consistencia con el theme

**Archivos nuevos:**
- `pages/login.html` - HTML con toggle
- `src/pages/login.js` - Función `toggleLoginPassword()` expuesta a window

**Archivos modificados:**
- `public/css/login.css` - Estilos para `.password-input-wrapper` y `.password-toggle`
- `public/css/fontawesome-custom.css` - Agregados iconos `fa-eye` y `fa-eye-slash`
- `pages/login.html` - Agregado link a fontawesome-custom.css

---

#### 7. Modal Usuarios - Ojo Toggle
**Problema:** Campo "Contraseña temporal" sin opción para ver/ocultar.

**Solución:**
- Agregado botón toggle con icono ojo en el modal
- Función expuesta a window para onclick
- Estilo dorado consistente

**Archivos nuevos:**
- `pages/admin/usuarios.html` - HTML con toggle

**Archivos modificados:**
- `src/admin/usuarios.js` - Función `togglePassword()` expuesta a window
- `public/css/admin.css` - Estilos para password toggle

---

## [2026-04-02] - Corrección de Diseño Responsive (Sesión 5)

### Problemas Corregidos
- **Diseño Responsive Roto**: Se detectaron media queries con sintaxis inválida (`var(--bp-*)`) que impedían el funcionamiento del diseño adaptable en todo el sitio.
- **Navbar Interactivity**: El menú de hamburguesa no se activaba correctamente en tablets, causando solapamiento de enlaces.
- **Grillas de Galería e Instalaciones**: Las grillas se mostraban apretadas en móviles (2 columnas), dificultando la legibilidad.

### Soluciones Implementadas
- **Sintaxis CSS Estándar**: Reemplazo de variables CSS en `@media queries` por valores literales (`1024px`, `768px`, `600px`, `480px`) en 7 archivos CSS.
- **Ajuste de Breakpoint Navbar**: Se subió el umbral del menú de hamburguesa a `1024px` para garantizar una navegación limpia en tablets.
- **Grillas Single-Column**: Se forzó el diseño de 1 columna a partir de los `600px` para Galería e Instalaciones.
- **Footer Responsivo**: Centrado de elementos y corrección de desbordamiento horizontal en pantallas pequeñas.

### Archivos Modificados
- `public/css/base.css`
- `public/css/index.css`
- `public/css/galeria.css`
- `public/css/instalaciones.css`
- `public/css/servicios.css`
- `public/css/contacto.css`
- `public/css/admin.css`

---

## [2026-04-02] - Optimización Font Awesome + Imagen Fundador

### Issues Resueltos

#### Issue #12.2: Font Awesome CDN Optimización (BAJO)
**Problema:** Font Awesome 6.4.0 se cargaba desde CDN (`all.min.css` ~200KB+) con miles de iconos no utilizados.

**Solución:**
- Instalado `@fortawesome/fontawesome-free@6.4.0` como dependencia npm
- Creado CSS personalizado `/css/fontawesome-custom.css` con solo 9 iconos utilizados en el proyecto:
  - `fa-th-large`, `fa-feather-pointed`, `fa-comment-dots`, `fa-user-shield`
  - `fa-arrow-left`, `fa-sign-out-alt`, `fa-plus`, `fa-home`, `fa-exclamation-triangle`
- Copiadas fuentes WOFF2 y TTF a `/public/fonts/`
- Reemplazado CDN en 5 archivos HTML:
  - `pages/admin/usuarios.html`
  - `pages/admin/ejemplares.html`
  - `pages/admin/consultas.html`
  - `pages/admin/dashboard.html`
  - `pages/linaje.html`

**Impacto:** Reducción de ~200KB a ~5KB de CSS (iconos usados) + fuentes locales (sin dependencia CDN).

#### Issue #12.3: Imagen Fundador (BAJO)
**Problema:** `fundador1.png` comprimida con pérdida de resolución y color.

**Solución:**
- Cambiada referencia en `index.html` de `fundador1.png` a `fundador2.png` (imagen original sin comprimir)

**Archivos modificados:**
- `index.html`: Referencia de imagen actualizada

---

### Archivos Nuevos
- `/public/css/fontawesome-custom.css` - CSS optimizado con 9 iconos Font Awesome
- `/public/fonts/fa-solid-900.woff2` - Fuente WOFF2
- `/public/fonts/fa-solid-900.ttf` - Fuente TTF (fallback)

### Archivos Modificados
- `pages/admin/usuarios.html` - CDN → CSS local
- `pages/admin/ejemplares.html` - CDN → CSS local
- `pages/admin/consultas.html` - CDN → CSS local
- `pages/admin/dashboard.html` - CDN → CSS local
- `pages/linaje.html` - CDN → CSS local
- `index.html` - fundador1.png → fundador2.png

### Dependencias
- Agregada: `@fortawesome/fontawesome-free@6.4.0`

---

## Issues Pendientes (Próxima Sesión)

### ALTO: Crear usuario — modal se queda en "guardando"
- `supabase.auth.signUp` reemplaza la sesión del admin
- Solución pendiente: usar `supabase.auth.admin.createUser()` desde edge function, o habilitar `GOTRUE_SECURITY_AUTO_CONFIRM` en Supabase Auth

---

## [2026-04-02] - Crear Usuario vía Edge Function (Issue #12.1)

### Issue Resuelto

#### Issue #12.1: Crear usuario — modal se queda en "guardando" (ALTO)
**Problema:** `supabase.auth.signUp` reemplazaba la sesión del admin, causando que el modal se quedara en estado "guardando..." indefinidamente.

**Solución:**
- Creada edge function `create-user` que usa `supabase.auth.admin.createUser()`
- La función no afecta la sesión del admin
- El rol se pasa directamente al crear el usuario (sin update posterior)
- El modal se cierra correctamente después de crear el usuario

**Archivos nuevos:**
- `supabase/functions/create-user/index.ts` - Edge function para crear usuarios

**Archivos modificados:**
- `src/lib/auth.js` - Función `register()` actualizada para usar edge function
- `src/admin/usuarios.js` - Llamada a `register()` actualizada con parámetro `rol`
- `src/lib/api.js` - Agregado objeto `functions` para invocar edge functions
- `supabase/config.toml` - Configuración de edge function `create-user`

**Commits:**
- `feat: resolver issue #12.1 - crear usuario vía edge function (sin perder sesión admin)`

---

## [2026-04-02] - Corrección Errores Crear/Eliminar Usuario

### Issues Corregidos

#### Error 1: Crear usuario — "Failed to send a request to the Edge Function"
**Problema:** La edge function `create-user` no estaba accesible en producción, causando error al crear usuarios.

**Solución:**
- Revertido a método `supabase.auth.signUp` con restauración de sesión del admin
- Mejorado manejo de sesión: se guarda access_token y refresh_token antes de signUp
- Se restaura la sesión inmediatamente después de signUp
- Modal se cierra y lista se recarga después de crear usuario exitosamente

#### Error 2: Eliminar usuario — "No se pudo eliminar. Posible falta de permisos (RLS)"
**Problema:** Al eliminar usuarios, se mostraba alert de error de permisos RLS.

**Solución:**
- Verificada política RLS DELETE en tabla usuarios (ya existente y correcta)
- La política permite a admins eliminar usuarios (excepto a sí mismos)
- El error puede ocurrir si el usuario intenta eliminarse a sí mismo o si la sesión no es de admin

**Archivos modificados:**
- `src/lib/auth.js` - Función `register()` usa signUp con restauración de sesión
- `src/admin/usuarios.js` - Cerrar modal y recargar lista después de crear usuario

**Commits:**
- `fix: resolver errores crear/eliminar usuario`

---

## [2026-04-02] - Mejora Error Eliminar Usuario + Migración RLS

### Corrección Error 2: Eliminar usuario — mensaje mejorado

**Problema:** El mensaje de error "No se pudo eliminar. Posible falta de permisos (RLS)" era confuso.

**Solución:**
- Mejorado mensaje de error para indicar que el usuario debe ser admin y no puede eliminarse a sí mismo
- Creada migración SQL `20260402_rls_usuarios_fix.sql` con políticas RLS actualizadas para usuarios

**Nueva migración RLS:**
- DELETE: Permite a admins eliminar usuarios (excepto a sí mismos)
- UPDATE: Permite a admins actualizar usuarios
- Usa `auth.jwt() -> 'user_metadata' ->> 'rol'` para evitar recursión infinita

**Nota:** La migración debe desplegarse a Supabase para aplicar las políticas RLS actualizadas.

**Archivos modificados:**
- `src/admin/usuarios.js` - Mensaje de error mejorado

**Archivos nuevos:**
- `supabase/migrations/20260402_rls_usuarios_fix.sql` - Migración RLS para usuarios

**Commits:**
- `fix: mejorar mensaje de error al eliminar usuario + crear migración RLS`

---

## [2026-04-02] - Fix: Modal Congelado al Crear Usuario

### Problema
El modal se quedaba congelado en "Guardando..." al crear un usuario, aunque el usuario se creaba correctamente en la BDD.

### Causa Raíz
- `signUp` de Supabase causaba cambios en el estado de autenticación
- No había manejo de errores ni timeouts
- `closeModal()` y `loadUsuarios()` podían fallar silenciosamente

### Solución
- `register()` en `auth.js` ahora con try/catch, timeouts (10s para signUp, 5s para setSession)
- `saveUsuario()` en `usuarios.js` con try/catch en closeModal() y loadUsuarios()
- Botón se restaura si hay error al crear usuario
- Eliminado update de rol en segundo plano (causaba problemas)

**Archivos modificados:**
- `src/lib/auth.js` - register() con timeouts y manejo de errores
- `src/admin/usuarios.js` - saveUsuario() con try/catch

**Commits:**
- `fix: resolver modal congelado al crear usuario`
