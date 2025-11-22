import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Development server configuration
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build configuration
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["react-bootstrap", "bootstrap"],
          utils: ["axios"],
        },
      },
    },
  },

  // Resolve configuration
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@styles": resolve(__dirname, "./src/styles"),
      "@context": resolve(__dirname, "./src/context"),
    },
  },

  // CSS configuration - FIXED: Remove the problematic import
  css: {
    preprocessorOptions: {
      scss: {
        // No additional data needed since we import variables in custom.scss
      },
    },
  },

  // Environment variables
  define: {
    "process.env": {},
  },
});
