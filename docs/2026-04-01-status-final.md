# INFORME DE ARQUITECTURA - Gallos Los Indios
# Status Post-Plan de Mejoras (100% Completado)

**Fecha:** 1 de abril de 2026
**Analista:** Kilo (Senior Engineer Review)
**Checkpoints completados:** 16 de 16 (100%)
**Sesiones completadas:** 6 de 6
**Tiempo total:** ~24 horas

---

## 1. RESUMEN EJECUTIVO

Proyecto web SPA multi-página para un criadero de gallos de combate. Stack: **Vanilla JS (ES Modules) + Vite + Supabase + D3.js + Three.js**, desplegado en **Vercel**. Contempla un sitio público (8 páginas) y un panel admin (4 módulos). El BaaS Supabase provee autenticación, base de datos PostgreSQL, storage y edge functions.

**Estado actual:** El plan de mejoras de 16 fases ha sido completado al 100%. El proyecto fue modernizado integralmente: eliminación de código legacy y duplicado, migración a ES Modules, dependencias npm, manejo de errores centralizado, accesibilidad, lazy loading y PWA. El código fuente está limpio, modular y optimizado para producción.

---

## 2. ESTRUCTURA DE CARPETAS

```
Gallos-los-indios/
├── index.html                    # Página principal (landing)
├── package.json                  # 3 runtime deps (supabase, three, d3) + vite-plugin-pwa
├── vite.config.js                # Build multi-page + PWA + lazy loading
├── .env                          # Variables Supabase (NO commiteado)
├── .gitignore
│
├── pages/                        # HTML públicos (12 entry points)
│   ├── galeria.html
│   ├── linaje.html
│   ├── contacto.html
│   ├── servicios.html
│   ├── instalaciones.html
│   ├── login.html
│   ├── fin.html
│   └── admin/
│       ├── dashboard.html
│       ├── ejemplares.html
│       ├── consultas.html
│       └── usuarios.html
│
├── src/                          # JS fuente (ES Modules)
│   ├── lib/                      # Capa de utilidades (6 módulos)
│   │   ├── supabase.js           # Cliente Supabase + withTimeout + handleError
│   │   ├── api.js                # API REST CRUD con timeout centralizado
│   │   ├── auth.js               # Autenticación + RBAC
│   │   ├── three-scene.js        # Escena Three.js base + detección capacidades
│   │   ├── audio.js              # Sistema de audio unificado
│   │   └── effects.js            # Embers, toggleMenu, navbar scroll
│   ├── pages/                    # Páginas públicas (8 módulos)
│   │   ├── home.js               # Landing: Three.js lazy + extras
│   │   ├── gallery.js            # Galería paginada + flip cards touch
│   │   ├── linaje.js             # Árbol D3 responsive + tooltip
│   │   ├── contacto.js           # Formulario de contacto
│   │   ├── login.js              # Login admin (sin Three.js)
│   │   ├── instalaciones.js      # Tabs con ARIA
│   │   ├── servicios.js          # Init servicios
│   │   └── fin.js                # Init fin (sin Three.js)
│   └── admin/                    # Panel admin (4 módulos)
│       ├── dashboard.js          # Stats + consultas recientes
│       ├── ejemplares.js         # CRUD ejemplares + event delegation
│       ├── consultas.js          # Listado + gestión + event delegation
│       └── usuarios.js           # CRUD usuarios + event delegation
│
├── public/                       # Assets estáticos
│   ├── css/                      # 9 hojas de estilo
│   │   ├── base.css              # Variables + navbar + footer + breakpoints + a11y
│   │   ├── admin.css             # Panel admin (scoped con .admin-wrapper)
│   │   ├── galeria.css           # Galería + flip cards (sin duplicados)
│   │   └── ... (6 más)
│   ├── js/                       # VACÍO — todo migrado a src/
│   └── images/                   # Imágenes estáticas
│
├── supabase/                     # Config Supabase
│   ├── config.toml
│   ├── migrations/               # Migraciones SQL
│   │   └── 20260401_get_consultas_stats.sql
│   └── functions/send-contact-email/
│
├── docs/                         # Documentación
│   ├── informe-arquitectura.md   # Informe original (pre-mejoras)
│   ├── plan-mejoras.md           # Plan de 16 fases
│   ├── 2026-04-01-status.md      # Status incremental (sesiones 1-6)
│   └── 2026-04-01-status-final.md # Este informe (base para futuros trabajos)
└── dist/                         # Build output
    ├── sw.js                     # Service worker (Workbox)
    ├── manifest.webmanifest      # PWA manifest
    └── assets/                   # JS/CSS optimizados
```

**Total JS:** 19 archivos, ~2,300 líneas en `src/`

---

## 3. ARQUITECTURA DE CAPAS

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                    │
│  HTML + CSS (public/) + JS ES Modules (src/)            │
│  Cada HTML → UN <script type="module"> como entry point │
│  Three.js: dynamic import() (lazy loading)              │
│  Service Worker: precache + runtime caching             │
├─────────────────────────────────────────────────────────┤
│                CAPA DE UTILIDADES (src/lib/)             │
│  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ supabase │ │  auth  │ │  api.js  │ │ three-scene  │  │
│  │   .js    │ │  .js   │ │ +timeout │ │  +fallback   │  │
│  └──────────┘ └────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────┐ ┌────────┐                                │
│  │  audio   │ │effects │                                │
│  │   .js    │ │  .js   │                                │
│  └──────────┘ └────────┘                                │
├─────────────────────────────────────────────────────────┤
│          PÁGINAS (src/pages/) + ADMIN (src/admin/)       │
│  home, gallery, linaje, contacto, login, servicios...    │
│  dashboard, ejemplares, consultas, usuarios              │
│  → Event delegation, zero onclick inline                │
│  → Imports explícitos, zero loadSharedJS                │
├─────────────────────────────────────────────────────────┤
│              BaaS - SUPABASE                             │
│  Auth (JWT) | DB (PostgreSQL) | Storage (S3)             │
│  Edge Functions (Deno) | RPC (get_consultas_stats)       │
├─────────────────────────────────────────────────────────┤
│           DEPLOYMENT - VERCEL                            │
│  Static hosting + Serverless + PWA                      │
└─────────────────────────────────────────────────────────┘
```

---

## 4. STACK COMPLETO

| Capa | Tecnología | Versión | Nota |
|---|---|---|---|
| Build | Vite | ^5.0.0 | Multi-page + PWA + code splitting |
| Runtime | @supabase/supabase-js | ^2.39.0 | Auth + DB + Storage + RPC |
| Runtime | three | ^0.160.1 | Lazy loaded (666KB chunk async) |
| Runtime | d3 | ^7.9.0 | Árbol genealógico |
| Dev | vite-plugin-pwa | ^0.21.1 | Service worker + manifest |
| Dev | supabase CLI | ^2.82.0 | Migraciones + edge functions |
| Dev | vercel CLI | ^50.34.0 | Deploy |
| CDN | Font Awesome | 6.4.0 | Iconos |
| CDN | Google Fonts | - | Cinzel + Outfit |
| BaaS | Supabase | PostgreSQL 17 | Auth + DB + Storage + Edge |
| Deploy | Vercel | - | Static + Serverless + PWA |

---

## 5. FORTALEZAS

### 5.1 Arquitectura ES Modules limpia
- `src/lib/` contiene 6 módulos de utilidades bien aislados
- Cada página tiene un único `<script type="module">` como entry point
- Zero scripts legacy, zero carga dinámica de scripts, zero onclick inline
- Build Vite genera chunks optimizados con tree-shaking efectivo

### 5.2 Código DRY y centralizado
- Audio: un solo módulo `audio.js` (antes duplicado en 2 archivos)
- Three.js: un solo módulo `three-scene.js` con detección de capacidades
- API: timeout + manejo de errores centralizado en `withTimeout()`
- CSS: breakpoints como custom properties en todos los CSS

### 5.3 Performance optimizada
- Three.js (666KB) se carga de forma asíncrona bajo demanda (lazy loading)
- Login, fin y admin no cargan Three.js (tree-shaking efectivo)
- `effects.js` separado en chunk propio de 0.74KB
- PWA con service worker: precache de 110 entradas + runtime caching
- RPC `get_consultas_stats()` ejecuta COUNT en PostgreSQL (no en cliente)

### 5.4 Accesibilidad (a11y)
- Skip-to-content link en todas las páginas públicas
- `role="dialog"` + `aria-modal` en 4 modales
- `role="tablist"`/`tab`/`tabpanel` con `aria-selected` dinámico
- Flip cards accesibles por teclado (tabindex + Enter/Space)
- Fallback CSS cuando Three.js no está disponible (reduced-motion, sin WebGL)

### 5.5 Autenticación y autorización
- RBAC con 3 roles: admin, soporte, usuario
- Guards declarativos: `requireAuth()`, `requireRole()`, `isAdmin()`
- Sesión expirada → redirect automático a login (detección 401/JWT)
- Gestión reactiva con `onAuthStateChange`

### 5.6 Código limpio
- Zero variables globales innecesarias (solo 4 de compatibilidad en lib/)
- Zero onclick inline en HTMLs
- Event delegation en todos los CRUD (ejemplares, consultas, usuarios)
- CSS sin conflictos de especificidad (scoping contextual)

---

## 6. DEBILIDADES RESTANTES

Ninguna debilidad crítica restante. Las debilidades P0, P1 y P2 fueron resueltas en el plan de 16 fases.

### 6.1 BAJO: CDN de Font Awesome
- Font Awesome 6.4.0 se carga desde CDN (200KB+)
- No tiene impacto funcional pero podría optimizarse con tree-shaking de iconos específicos

### 6.2 BAJO: Imagen fundador1.png
- 4.76MB sin optimizar
- Podría comprimirse o servirse en formatos modernos (WebP/AVIF)

---

## 7. PLAN DE MEJORAS — COMPLETADO

| Sesión | Fase | Descripción | Tiempo | Prioridad | Estado |
|---|---|---|---|---|---|
| **1** | **1** | Limpieza de seguridad | 30 min | P0 | ✅ |
| | **2** | Flip cards en touch | 1 h | P0 | ✅ |
| | **3** | Extracción sistema audio | 1.5 h | P0 | ✅ |
| **2** | **4** | Extracción escena Three.js | 1.5 h | P0 | ✅ |
| | **5** | Three.js + D3.js a npm | 2 h | P1 | ✅ |
| **3** | **6** | Migrar legacy a ES Modules | 2 h | P1 | ✅ |
| | **7** | Centralizar CSS / resolver conflictos | 1.5 h | P1 | ✅ |
| **4** | **8** | Refactorizar API: errores global | 2 h | P1 | ✅ |
| | **9** | Eliminar variables globales | 1.5 h | P1 | ✅ |
| | **10** | Responsive árbol D3 | 1.5 h | P1 | ✅ |
| **5** | **11** | Three.js: capacidades + reduced motion | 1 h | P2 | ✅ |
| | **12** | Accesibilidad base (ARIA) | 2 h | P2 | ✅ |
| | **13** | Optimizar stats Supabase | 1 h | P2 | ✅ |
| **6** | **14** | Quitar Three.js de login/fin | 1 h | P2 | ✅ |
| | **15** | Lazy loading Three.js | 1 h | P2 | ✅ |
| | **16** | PWA básica | 2.5 h | P2 | ✅ |

**Total:** 16 fases completadas en ~24 horas estimadas.

---

## 8. RESUMEN DE MEJORAS POR CATEGORÍA

### Seguridad
- Eliminado botón seed y exports de credenciales Supabase
- Detección automática de JWT expirado → redirect a login

### Performance
- Three.js lazy loaded (666KB async, no bloqueante)
- Login/fin/admin no cargan Three.js
- RPC `get_consultas_stats()` en PostgreSQL (vs N filas al cliente)
- PWA con service worker (precache + runtime caching)

### Arquitectura
- Zero scripts legacy (public/js/ vacío)
- ES Modules unificados (un entry point por página)
- Código duplicado eliminado (~500 líneas netas)
- Dependencias npm (sin CDN de Three.js ni D3.js)

### UX/UI
- Flip cards funcionales en touch (click handler)
- Árbol D3 responsive (3 breakpoints dinámicos)
- Botones CRUD sin onclick inline (event delegation)

### CSS
- Breakpoints estandarizados (custom properties)
- Conflictos de especificidad resueltos
- Definiciones obsoletas eliminadas

### Accesibilidad
- Skip-to-content link
- ARIA roles en modales y tabs
- Flip cards accesibles por teclado
- Fallback para reduced-motion y hardware limitado

---

## 9. CHECKPOINTS GIT

```
checkpoint/fase-1  → security: eliminar botón seed y restringir exports
checkpoint/fase-2  → feat: flip cards funcionales en touch devices
checkpoint/fase-3  → refactor: extraer sistema de audio
checkpoint/fase-4  → refactor: extraer escena Three.js
checkpoint/fase-5  → build: migrar Three.js y D3.js a npm
checkpoint/fase-6  → refactor: migrar scripts legacy a ES Modules
checkpoint/fase-7  → css: centralizar breakpoints y resolver conflictos
checkpoint/fase-8  → refactor: centralizar manejo de errores y timeout en API
checkpoint/fase-9  → refactor: eliminar variables globales window.* y onclick inline
checkpoint/fase-10 → feat: hacer árbol D3 responsive con dimensiones dinámicas
checkpoint/fase-11 → feat: detección de capacidades Three.js con fallback estático
checkpoint/fase-12 → feat: accesibilidad base (ARIA, skip-to-content, teclado)
checkpoint/fase-13 → perf: optimizar consultas.getStats() con RPC Supabase
checkpoint/fase-14 → perf: eliminar Three.js de login y fin (tree-shaking efectivo)
checkpoint/fase-15 → perf: lazy loading Three.js con dynamic import()
checkpoint/fase-16 → feat: PWA básica con vite-plugin-pwa
```

**Rollback:** `git reset --hard checkpoint/fase-N` para revertir a cualquier punto.

---

*Informe base para futuros trabajos. Generado automáticamente por Kilo el 1 de abril de 2026.*

---

## 10. CAMBIOS POST-PLAN DE MEJORAS (1 de abril 2026)

### Instalaciones - Grillas 3 columnas
- Grid de instalaciones y reconocimientos cambiado de `auto-fill` a `repeat(3, 1fr)`
- Gap reducido de `--space-md` a `--space-sm`
- Responsive: 2 columnas en tablet/mobile

### Instalaciones - Info-banner scoped
- `info-banner` movido de fuera de los grids a dentro de `#facilities`
- Solo se muestra cuando el tab "Instalaciones" está activo
- `setupTabs()` toggle `display: grid` / `display: none` según tab seleccionado

### Instalaciones - Reconocimientos mismo tamaño
- `aspect-ratio` de `.recognition-item` cambiado de `3/4` a `4/3` (igual que instalaciones)

### Contacto - Fix email "Invalid Date"
- Edge function `send-contact-email`: `new Date(fecha)` reemplazado por `new Date()` directo
- Fecha formateada con `toLocaleString('es-ES', timeZone: 'America/Caracas')`
- Desplegado a Supabase Edge Functions

### Contacto - Campo "Selecciona un tema" eliminado
- `<select>` removido del formulario de contacto.html
- Referencias a `tema` eliminadas de contacto.js

### Contacto - Layout reorganizado
- Formulario compactado (no ocupa todo el viewport height)
- Columna izquierda: Formulario + Horarios
- Columna derecha: Dirección + Contacto Directo + Visitas
- Márgenes explícitos entre todos los elementos (`margin-bottom` en cada card)

---

*Informe actualizado el 1 de abril de 2026 a las 15:45.*
