import { fileURLToPath, URL } from 'node:url'
// `vitest/config` re-exports Vite's defineConfig and adds types for the `test` block.
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // `@` -> `/src`. Used everywhere in imports so paths don't turn into ../../../ soup.
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Helps you SEE code-splitting working: each lazily-imported route becomes its own chunk.
    // Run `npm run build` and look at the dist/assets output.
    sourcemap: true,
  },
  test: {
    // Vitest reads this block (via the Vite config) so we don't need a separate vitest.config.js.
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,vue}'],
    },
  },
})
