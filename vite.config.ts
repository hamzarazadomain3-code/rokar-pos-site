import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import rokarSeo from './build/seo-plugin';

export default defineConfig({
  plugins: [react(), rokarSeo()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        // NOTE: three.js is deliberately NOT listed here.
        //
        // Forcing `three: ['three', '@react-three/*']` into its own manual chunk
        // looks tidier, but it backfires: Rollup hoists the modules shared between
        // the entry and the lazy hero into that chunk, and the entry then
        // `import`s a couple of bindings from it -- which forces the browser to
        // download the whole ~1 MB chunk during the initial page load, before the
        // download button is even painted.
        //
        // Left alone, three lands entirely inside the lazily-imported Hero3D chunk
        // and is fetched only on devices that `useCanRender3D()` approves
        // (desktop, WebGL, not save-data, not reduced-motion).
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
});