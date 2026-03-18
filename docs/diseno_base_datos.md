# DISEÑO DE BASE DE DATOS - Gallos Los Indios

## 1. ESTRUCTURA DE TABLAS

### Tabla: `usuarios`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único del usuario |
| email | TEXT | Email único del usuario |
| nombre | TEXT | Nombre del usuario |
| rol | TEXT | 'admin' o 'soporte' |
| activo | BOOLEAN | Si el usuario está activo |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

### Tabla: `ejemplares`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único del ejemplar |
| placa | TEXT | **Número único de placa/chapa** (asignado al nacer) |
| marca | TEXT | **Tatuaje/Marca** - Mes de nacimiento (ej: "ENE", "FEB") |
| nombre | TEXT | Nombre del ejemplar |
| tipo | TEXT | **'macho' o 'hembra'** |
| fecha_nacimiento | DATE | Fecha de nacimiento |
| peso | DECIMAL | Peso en kg |
| plumaje | TEXT | **Tipo de plumaje**: Zambo, Marañon, Canaguey, Jabao, Pinto, Gallino, Blanco |
| otros_rasgos | TEXT | Otros rasgos distintivos |
| descripcion | TEXT | Descripción general |
| imagen_url | TEXT | URL de la imagen en Storage |
| precio | TEXT | Precio o "CONSULTAR" |
| estado | TEXT | 'disponible', 'vendido', 'reservado', 'fallecido' |
| destacado | BOOLEAN | Si aparece en homepage |
| orden | INTEGER | Orden de aparición en galería |
| creado_por | UUID | FK a usuarios.id |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de actualización |

### Tabla: `relaciones_familiares`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único de la relación |
| ejemplar_id | UUID | FK a ejemplares.id |
| parentesco | TEXT | 'padre', 'madre', 'abuelo_paterno', 'abuela_paterna', 'abuelo_materno', 'abuela_materna', 'hermano', 'tio', 'primo' |
| familiar_id | UUID | FK a ejemplares.id (el familiar) |

### Tabla: `consultas`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único de la consulta |
| nombre | TEXT | Nombre del cliente |
| email | TEXT | Email del cliente |
| telefono | TEXT | Teléfono del cliente |
| mensaje | TEXT | Mensaje del cliente |
| tema | TEXT | Tema de la consulta |
| leido | BOOLEAN | Si ha sido leída |
| respondida | BOOLEAN | Si ha sido respondida |
| created_at | TIMESTAMP | Fecha de creación |

---

## 2. POLÍTICAS DE SEGURIDAD (RLS)

### Tabla: `usuarios`
| Operación | ¿Quién puede? |
|-----------|----------------|
| SELECT | Solo el propio usuario (por email) |
| INSERT | Solo usuarios con rol 'admin' |
| UPDATE | Solo el propio usuario o 'admin' |
| DELETE | Solo usuarios con rol 'admin' |

### Tabla: `ejemplares`
| Operación | ¿Quién puede? |
|-----------|----------------|
| SELECT | Todos (público) |
| INSERT | 'admin' y 'soporte' |
| UPDATE | 'admin' y 'soporte' |
| DELETE | Solo 'admin' |

### Tabla: `consultas`
| Operación | ¿Quién puede? |
|-----------|----------------|
| SELECT | Solo 'admin' y 'soporte' |
| INSERT | Todos (público) |
| UPDATE | Solo 'admin' |
| DELETE | Solo 'admin' |

---

## 3. STORAGE (Imágenes)

### Bucket: `ejemplares`
- **Carpeta:** `/imagenes`
- **Acceso público:** Lectura (todos pueden ver imágenes)
- **Acceso privado:** Escritura solo 'admin' y 'soporte'

---

## 4. AUTHENTICACIÓN (Supabase Auth)

### Configuración
- **Proveedor:** Email/Password
- **Redirect URL:** (URL de tu proyecto en Vercel)
- **Usuario inicial a crear:**
  - Email: luiscolmenaresa.indio@gmail.com
  - Rol: admin

---

## 5. ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                 │
│                  (Vanilla JS + HTML)                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│   │   Pages    │  │    JS      │  │    CSS     │   │
│   │  (HTML)    │  │  (Lógica)  │  │ (Estilos)  │   │
│   └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────┐     │
│   │              API Client (supabase.js)       │     │
│   └─────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   SUPABASE (Backend)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐      │
│  │   Auth   │  │ Database │  │  Storage    │      │
│  │ (Users)  │  │ (Tables) │  │ (Imágenes)  │      │
│  └──────────┘  └──────────┘  └──────────────┘      │
│                                                         │
│  ┌──────────────────────────────────────────────┐     │
│  │         Row Level Security (RLS)            │     │
│  └──────────────────────────────────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 6. FLUJO DE USUARIOS

### Flujo: Usuario Público
```
1. Visita página web
2. Ve galería de ejemplares (SELECT público)
3. Llena formulario de contacto
4. Envía consulta → Se guarda en BDD + Email enviado
```

### Flujo: Usuario "soporte"
```
1. Login en página de admin
2. Dashboard con opciones limitadas
3. Puede: Crear / Actualizar ejemplares
4. Puede: Ver consultas
5. NO puede: Eliminar / Gestionar usuarios
```

### Flujo: Usuario "admin"
```
1. Login en página de admin
2. Dashboard completo
3. CRUD total de ejemplares
4. Gestionar usuarios (soporte)
5. Ver/responder consultas
```

---

## 7. ESTRUCTURA DE ARCHIVOS (Frontend)

```
proyecto/
├── index.html              # Homepage
├── galeria.html           # Galería pública
├── contacto.html          # Formulario contacto
├── login.html             # Login
├── admin/
│   ├── dashboard.html    # Dashboard admin
│   ├── ejemplares.html   # CRUD ejemplares
│   ├── consultas.html     # Ver consultas
│   └── usuarios.html     # Gestionar usuarios
├── js/
│   ├── app.js            # Inicialización
│   ├── auth.js           # Autenticación
│   ├── api.js            # Cliente API
│   ├── galeria.js        # Lógica galería
│   ├── contacto.js       # Formulario contacto
│   └── admin/
│       ├── dashboard.js
│       ├── ejemplares.js
│       ├── consultas.js
│       └── usuarios.js
├── css/
│   ├── base.css
│   ├── admin.css
│   └── ...
└── assets/
    └── images/
```

---

## 8. ENDPOINTS (Supabase Client)

```javascript
// Inicialización
const supabase = createClient(URL_SUPABASE, ANON_KEY)

// Auth
supabase.auth.signInWithPassword({ email, password })
supabase.auth.signOut()
supabase.auth.getUser()

// Ejemplares (público)
supabase.from('ejemplares').select('*').eq('estado', 'disponible')

// Ejemplares (admin/soporte)
supabase.from('ejemplares').insert(datos)
supabase.from('ejemplares').update(datos).eq('id', id)
supabase.from('ejemplares').delete().eq('id', id)

// Consultas
supabase.from('consultas').insert(datos)
supabase.from('consultas').select('*').order('created_at', { ascending: false })
```

---

## 9. VARIABLES DE ENTORNO (.env)

```
VITE_SUPABASE_URL=tu_proyecto_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

---

*Diseño creado el 17 de Marzo 2026*
