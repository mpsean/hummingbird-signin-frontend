import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    reporters: ['verbose', 'junit'],
    outputFile: {
      junit: 'test-results/junit.xml',
    },
  },
})
