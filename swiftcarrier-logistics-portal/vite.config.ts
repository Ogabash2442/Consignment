import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import fs from 'fs';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'copy-carrier-assets',
        closeBundle() {
          try {
            const srcDir = path.resolve(__dirname, 'src/assets/images');
            const destDir = path.resolve(__dirname, 'dist/src/assets/images');
            if (fs.existsSync(srcDir)) {
              fs.mkdirSync(destDir, { recursive: true });
              const files = fs.readdirSync(srcDir);
              for (const file of files) {
                fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
              }
              console.log('Successfully bundled carrier images to final distribution path.');
            }
          } catch (e) {
            console.error('Failed to copy bundled images', e);
          }
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
