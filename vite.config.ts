import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@frontend': path.resolve(import.meta.dirname, './src/frontend'),
      '@backend': path.resolve(import.meta.dirname, './src/backend'),
      '@database': path.resolve(import.meta.dirname, './src/database'),
    }
  },
  server: {
    port: 3000,
    open: false
  }
});
