import fs from 'fs';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

/** GitHub Pages SPA fallback: 404.html redirects to index.html so React Router works */
function ghPagesSPAFallback() {
  return {
    name: 'gh-pages-spa-fallback',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist');
      const indexPath = path.join(outDir, 'index.html');
      const fallbackPath = path.join(outDir, '404.html');
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, fallbackPath);
      }
    },
  };
}

export default defineConfig(({mode}) => {
  const isProd = mode === 'production';
  return {
    base: isProd ? '/inbound-to-shipping-cost-calculator/' : '/',
    plugins: [react(), tailwindcss(), ghPagesSPAFallback()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
