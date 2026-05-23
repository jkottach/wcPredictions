import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Always load `.env*` from `frontend/`, not the shell cwd. */
const frontendRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  envDir: frontendRoot,
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
