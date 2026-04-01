import { defineConfig } from 'vite'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  root: '.',
  publicDir: 'public',

  server: {
    port: 5173,
    open: '/'
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['images/**/*', 'css/**/*'],
      manifest: {
        name: 'Gallos Los Indios',
        short_name: 'Los Indios',
        description: 'Criadero de gallos de combate de alta calidad',
        theme_color: '#050505',
        background_color: '#050505',
        display: 'standalone',
        icons: [
          {
            src: '/images/favicon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/images/favicon.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/images/favicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,ico,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      }
    })
  ],

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        instalaciones: resolve(__dirname, 'pages/instalaciones.html'),
        servicios: resolve(__dirname, 'pages/servicios.html'),
        galeria: resolve(__dirname, 'pages/galeria.html'),
        contacto: resolve(__dirname, 'pages/contacto.html'),
        fin: resolve(__dirname, 'pages/fin.html'),
        login: resolve(__dirname, 'pages/login.html'),
        linaje: resolve(__dirname, 'pages/linaje.html'),
        dashboard: resolve(__dirname, 'pages/admin/dashboard.html'),
        ejemplares: resolve(__dirname, 'pages/admin/ejemplares.html'),
        consultas: resolve(__dirname, 'pages/admin/consultas.html'),
        usuarios: resolve(__dirname, 'pages/admin/usuarios.html'),
      }
    }
  }
})
