import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// SPA mode para deploy no Vercel — sem Cloudflare Workers.
//
// `pages` lista as rotas que ganham HTML estático próprio (com título/OG/
// Twitter corretos para crawlers) no build, além da shell SPA em "/". O
// prerender por padrão só descobre rotas seguindo <a href> a partir da
// home (crawlLinks) — rotas privadas de cliente (labs/*) não são linkadas
// em lugar nenhum de propósito, então precisam ser listadas aqui à mão.
// Cada nova auditoria de cliente entra como uma linha nova nesta lista.
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    pages: [{ path: "/" }, { path: "/labs/planettel", sitemap: { exclude: true } }],
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/index",
      },
    },
  },
});
