import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Todos os /clientes/* vão direto para o Micronaut (porta 8082)
      '/clientes': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/automoveis': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/pedidos': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/contratos': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/usuarios': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1600, // Silencia avisos inofensivos para a lib pesada de 3D
  },
})
