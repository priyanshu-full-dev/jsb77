// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
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
