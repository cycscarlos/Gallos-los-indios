import { defineConfig } from 'vite'
import { resolve } from 'path'

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

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Página principal (raíz)
        main: resolve(__dirname, 'index.html'),
        // Páginas públicas
        instalaciones: resolve(__dirname, 'pages/instalaciones.html'),
        servicios: resolve(__dirname, 'pages/servicios.html'),
        galeria: resolve(__dirname, 'pages/galeria.html'),
        contacto: resolve(__dirname, 'pages/contacto.html'),
        fin: resolve(__dirname, 'pages/fin.html'),
        login: resolve(__dirname, 'pages/login.html'),
        // Panel de administración
        dashboard: resolve(__dirname, 'pages/admin/dashboard.html'),
        ejemplares: resolve(__dirname, 'pages/admin/ejemplares.html'),
        consultas: resolve(__dirname, 'pages/admin/consultas.html'),
        usuarios: resolve(__dirname, 'pages/admin/usuarios.html'),
      }
    }
  }
})