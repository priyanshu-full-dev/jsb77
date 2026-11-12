// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import viteImagemin from 'vite-plugin-imagemin';
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),

    // ✅ Deterministic image optimization
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80, progressive: true }, // stable JPEGs
      pngquant: { quality: [0.8, 0.8], speed: 1, strip: true, dithering: 0 }, // 🔒 deterministic PNG
      svgo: { plugins: [{ name: 'removeViewBox' }, { name: 'cleanupIDs' }] },
      webp: { quality: 75 },
      avif: { quality: 60 },
    }),

    // ✅ Deterministic compression
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      deleteOriginFile: false,
      compressionOptions: { quality: 11 }, // stable brotli
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false,
      compressionOptions: { level: 9, timestamp: false }, // stable gzip (no timestamp)
    }),
  ],

  server: {
    port: 5177,
    host: true,
  },

  resolve: {
    alias: {
      react: "react",
      "react-dom": "react-dom",
      lodash: "lodash-es", // ✅ replace lodash with lodash-es
    },
  },

  optimizeDeps: {
    include: ["react", "react-dom", "lodash-es"],
    // ❌ removed force:true → avoids unnecessary re-bundling
  },

  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`,

        // ✅ Stable, predictable chunk splitting
        manualChunks: {
          react: ["react", "react-dom"],
          lodash: ["lodash-es"],
        },
      },
    },
  },
});
