/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// @ts-expect-error - Vite and Vitest types mismatch due to multiple versions in the tree
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Vite가 해당 패키지들을 미리 번들링하여 브라우저 호환성을 확보하도록 강제합니다.
    include: [
      '@opentelemetry/api',
      '@opentelemetry/sdk-trace-web',
      '@opentelemetry/resources',
      '@opentelemetry/semantic-conventions'
    ]
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/__tests__/setup.ts',
        pool: 'threads',
        poolOptions: {
            threads: {
                isolate: true, // Isolation for high-quality M4 performance
            },
        },
        reporters: ['default', 'html'],
        coverage: {
            provider: 'v8', // For Vitest 2.x
            reporter: ['text', 'json', 'html'],
        },
    },
})



