import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        404: "./404.html",
        500: "./500.html",
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
  },
});
