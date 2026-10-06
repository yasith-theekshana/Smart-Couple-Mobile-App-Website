import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Reuse the shared HTML shell with a dedicated mobile entry point.
export default defineConfig({
  base: process.env.MOBILE_BASE_PATH || '/',
  plugins: [
    {
      name: 'mobile-entry',
      transformIndexHtml: {
        order: 'pre',
        handler: (html) => html
          .replace('/src/main.tsx', '/src/main-mobile.tsx')
          .replace('<title>My Google AI Studio App</title>', '<title>SmartCouple Mobile Test</title>'),
      },
    },
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist-mobile',
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
