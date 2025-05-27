import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      process: "process/browser", // Alias process for browser compatibility
    },
  },
  define: {
    "process.env": {}, // Define process.env globally
  },
});
