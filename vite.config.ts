import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001/api', //default target: 'http://localhost:5000'
        changeOrigin: true
      },
      '/hmmbird': {
        target: 'http://localhost:5000', //
        changeOrigin: true
      }
    }
  }
})
