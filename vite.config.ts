import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  base: mode === 'sharepoint' ? './' : '/',
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        creator: 'creator.html',
      },
    },
  },
}));
