import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Astro + React, salida estática lista para Vercel
export default defineConfig({
  integrations: [react()],
  output: 'static'
});

