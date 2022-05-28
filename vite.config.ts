/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { AngularVitePlugin } from './vite-plugin';

export default defineConfig(({ mode }) => ({
  root: 'src',
  
  /* The plugin bring support for templateUrl and styleUrls. You can run Vite without but you have 
   * to write inline template and styles. */
  plugins: [
    AngularVitePlugin()
  ],
  
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
