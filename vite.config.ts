import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// SPA mode para deploy no Vercel — sem Cloudflare Workers.
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/index",
      },
    },
  },
});
