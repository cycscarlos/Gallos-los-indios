# CHECKPOINT #1 - Gallos Los Indios Website
**Fecha:** 17 de Marzo 2026
**Estado:** Proyecto frontend completo, 100% responsive + Diseño backend completo

---

## 📁 ESTRUCTURA DEL PROYECTO

```
3D/
├── index.html              # Página de inicio (Hero + Legado + Features)
├── instalaciones.html    # Instalaciones + Reconocimientos (tabs)
├── servicios.html       # Servicios + Proceso + Why Choose Us
├── galeria.html         # Galería 14 imágenes + Modal pedigree
├── contacto.html       # Formulario + Info contacto
├── fin.html            # Página de gracias
├── login.html          # Login de admin (PENDIENTE)
├── admin/              # Dashboard admin (PENDIENTE)
│   ├── dashboard.html
│   ├── ejemplares.html
│   ├── consultas.html
│   └── usuarios.html
├── css/
│   ├── base.css        # Estilos globales + variables dinámicas
│   ├── index.css
│   ├── instalaciones.css
│   ├── servicios.css
│   ├── galeria.css
│   ├── contacto.css
│   ├── fin.css
│   └── admin.css      # (PENDIENTE)
├── js/
│   ├── index.js        # Three.js home
│   ├── shared.js
│   ├── gallery.js
│   ├── instalaciones.js
│   ├── auth.js        # Autenticación (PENDIENTE)
│   ├── api.js         # Cliente Supabase (PENDIENTE)
│   └── admin/
│       ├── dashboard.js
│       ├── ejemplares.js
│       ├── consultas.js
│       └── usuarios.js
├── docs/
│   ├── checkpoint_001.md
│   ├── prompt.txt      # Prompt original guardado
│   └── diseno_base_datos.md  # Diseño BDD
└── images/
```

---

## 🎨 DISEÑO ACTUAL (Frontend)

### Colores (CSS Variables)
- `--black-deep: #0a0a0a` (fondo)
- `--gold-primary: #d4af37` (dorado principal)
- `--gold-light: #f4d03f` (dorado claro)
- `--gold-dark: #b8860b` (dorado oscuro)
- `--white: #ffffff`

### Fuentes
- **Cinzel** - Títulos (serif, elegante)
- **Oswald** - Body (sans-serif, moderna)

### Características UI/UX
- Three.js con partículas doradas y brasas
- Efectos de luz (light rays)
- Animaciones suaves al hover
- Sonido ambiente (Web Audio API)
- Modal con árbol genealógico completo

---

## 📱 RESPONSIVE (100%)

### Variables dinámicas
```css
--space-xs a --space-3xl (spacings fluidos)
--text-xs a --text-5xl (tipografía fluida)
```

---

## 🗄️ DISEÑO DE BASE DE DATOS (Supabase)

### Tablas

#### 1. `usuarios`
| Campo | Tipo |
|-------|------|
| id | UUID |
| email | TEXT |
| nombre | TEXT |
| rol | TEXT ('admin' / 'soporte') |
| activo | BOOLEAN |
| created_at | TIMESTAMP |

#### 2. `ejemplares`
| Campo | Tipo |
|-------|------|
| id | UUID |
| nombre | TEXT |
| categoria | TEXT |
| tipo | TEXT |
| peso | DECIMAL |
| edad | INTEGER |
| pedigree_resumido | TEXT |
| pedigree_completo | JSONB |
| imagen_url | TEXT |
| precio | TEXT |
| descripcion | TEXT |
| estado | TEXT |
| destacado | BOOLEAN |
| orden | INTEGER |
| creado_por | UUID |
| created_at | TIMESTAMP |

#### 3. `consultas`
| Campo | Tipo |
|-------|------|
| id | UUID |
| nombre | TEXT |
| email | TEXT |
| telefono | TEXT |
| mensaje | TEXT |
| tema | TEXT |
| leido | BOOLEAN |
| respondida | BOOLEAN |
| created_at | TIMESTAMP |

---

## 🔐 ROLS Y PERMISOS

| Usuario | Ejemplares | Consultas | Usuarios |
|--------|-------------|-----------|----------|
| **Público** | READ | CREATE | - |
| **soporte** | CREATE, READ, UPDATE | READ | READ |
| **admin** | FULL CRUD | FULL CRUD | FULL CRUD |

---

## 📧 FUNCIONALIDADES PENDIENTES

### 1. Contacto / Consultas (PRIORIDAD ALTA)
- Formulario que guarda en BDD
- Envío de email a: luiscolmenaresa.indio@gmail.com

### 2. Autenticación (PRIORIDAD ALTA)
- Login con Supabase Auth
- 2 niveles: admin, soporte

### 3. Dashboard Admin (PRIORIDAD MEDIA)
- Panel de control
- CRUD ejemplares
- Ver consultas

### 4. Galería Dinámica (MEDIA)
- Cargar desde Supabase
- Filtrar por categoría/tipo

### 5. Usuario Cliente (BAJA - FUTURO)
- Solo lectura de ejemplares
- Carrito de compras (por confirmar)

---

## 🔧 STACK TECNOLÓGICO

- **Frontend:** Vanilla JS, HTML, CSS
- **Backend:** Supabase (Auth, Database, Storage)
- **Hosting:** Vercel
- **Imágenes:** Supabase Storage

---

## 📝 NOTAS PARA CONTINUAR

1. **Imágenes locales** están en carpeta `images/`
2. **Sonido** se activa con primer click
3. **Navegación:** Inicio → Instalaciones → Servicios → Galería → Contacto
4. **Backend:** Usar el diseño en `docs/diseno_base_datos.md`
5. **Usuario inicial:** luiscolmenaresa.indio@gmail.com (crear en Supabase con rol admin)

---

## 🆕 PARA PRÓXIMO CHECKPOINT

1. Implementar Supabase Client en JS
2. Crear tablas en Supabase
3. Configurar políticas RLS
4. Crear sistema de login
5. Conectar formulario de contacto

---

*Checkpoint actualizado - 17 Marzo 2026*
