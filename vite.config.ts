import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
    },
    // Refresh Vite's dependency cache after package changes. This prevents
    // stale optimized deep imports from returning 504 in the dev browser.
    optimizeDeps: {
      force: true,
    },
  };
});
