import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  base: '/',

  plugins: [
    react(),

    legacy({
      targets: ['chrome 50'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
  ],

  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://localhost:8000",
        changeOrigin: true,
      }
    }
  },

  build: {
    target: 'es2015',
    minify: false,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],
})
