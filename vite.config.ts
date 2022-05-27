/// <reference types="vitest" />

// If you want to support "styleUrls" and "templateUrl" you have to use the following plugin.
// But note that Vitest fails for unknown reason if you declare it, so keep it unused.
import { ViteAngularPlugin } from '@nxext/angular-vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  root: 'src',

  // Uncomment to support "styleUrls" and "templateUrl":
  //
  // plugins: [
  //   ViteAngularPlugin({
  //     target: 'es2020',
  //   }),
  // ],
  
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['test-setup.ts'],
    includeSource: ['**/*.{js,ts}'],
  },
  resolve: {
    /* It is very important to only allow "module".
     * Otherwise, some libraries might use fesm2020 and others module
     * ending up with different references to the same symbol
     * and errors like TestComponentRender !== TestComponentRender. */
    mainFields: ['module'],
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
