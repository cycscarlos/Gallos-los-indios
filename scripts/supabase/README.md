# Scripts Supabase - Gallos Los Indios

## Orden de ejecución

Ejecutar los scripts en este orden en el **SQL Editor de Supabase**:

| # | Script | Descripción |
|---|--------|-------------|
| 01 | `01_crear_tablas.sql` | Crea las 3 tablas + habilita RLS |
| 02 | `02_politicas_rls.sql` | Define políticas de acceso |
| 03 | `03_trigger_auth.sql` | Sincroniza Auth con tabla usuarios |
| 04 | `04_datos_ejemplo.sql` | (Opcional) Datos de prueba |
| 05 | `05_storage.sql` | Configuración de Storage (referencia) |

## Post-requisitos

Después de ejecutar los scripts:

1. **Crear bucket de Storage:**
   - Ir a Storage > New bucket
   - Nombre: `ejemplos`
   - Public bucket: YES

2. **Crear usuario admin:**
   - Ir a Authentication > Users
   - Invitar usuario: `luiscolmenaresa.indio@gmail.com`
   - Luego ejecutar:
     ```sql
     UPDATE usuarios SET rol = 'admin' WHERE email = 'luiscolmenaresa.indio@gmail.com';
     ```

3. **Configurar Email (opcional):**
   - Ir a Authentication > Providers > Email
   - Habilitar "Confirm email" si deseas verificación

## Estructura de tablas

```
usuarios     → Admin/soporte del sistema
ejemplares   → Catálogo de gallos
consultas    → Mensajes del formulario contacto
```
