import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5177,
    proxy: {
      '/api': {
<<<<<<< HEAD
        target: 'http://localhost:5001', //default target: 'http://localhost:5000'
=======
        target: 'http://localhost:5001/api', //default target: 'http://localhost:5000'
        changeOrigin: true
      },
      '/hmmbird': {
        target: 'http://localhost:5000', //
>>>>>>> 8109cc4 (stable build)
        changeOrigin: true
      }
    }
  }
})
