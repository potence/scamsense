import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { narrationFiles } from './scripts/read-content.ts';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // "@/..." means "src/..." (used by the shadcn components in src/components/ui).
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // GitHub Pages serves the site at https://potence.github.io/scamsense/. For a custom domain at the root
  // (scamsense.io), build with BASE_PATH=/ (see docs/DEPLOY.md).
  base: process.env.BASE_PATH ?? '/scamsense/',
  // Which narration recordings exist, known at build time, so "Read aloud" shows at once (no waiting on the file).
  define: { __NARRATION_FILES__: JSON.stringify(narrationFiles()) },
});
