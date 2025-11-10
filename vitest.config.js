import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  plugins: [
    enhancedImages(),
    sveltekit(),
    Icons({
      compiler: 'svelte'
    })
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    setupFiles: ['src/test-setup.js'],
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test-setup.js',
        '**/*.test.js',
        '**/*.spec.js',
        'src/routes/+*.js', // SvelteKit route files
        'src/hooks.*.js' // SvelteKit hooks
      ]
    },
    env: {
      NODE_ENV: 'test'
    }
  },
  define: {
    'import.meta.env.DEV': false,
    'import.meta.env.PROD': true,
    'import.meta.env.SSR': false,
    'import.meta.glob': 'globalThis.__importMetaGlob'
  },
  assetsInclude: ['**/*.json'],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "/src/variables" as *;`
      }
    }
  }
});
