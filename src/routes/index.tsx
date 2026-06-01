import { createFileRoute } from "@tanstack/react-router";
import NoiseLabsLanding from "@/components/NoiseLabsLanding";

export const Route = createFileRoute("/")({
  component: NoiseLabsLanding,
  head: () => ({
    meta: [
      { title: "Noise Labs — Marketing Digital que Gera Clientes" },
      {
        name: "description",
        content:
          "A Noise Labs cria sites, landing pages e estratégias digitais para empresas locais que querem gerar mais clientes. Presença digital que converte.",
      },
      { property: "og:title", content: "Noise Labs — Marketing Digital que Gera Clientes" },
      {
        property: "og:description",
        content:
          "Transformamos empresas locais em marcas que geram clientes reais. Sites, tráfego pago, estratégia digital.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://noiselabs.com.br/" },
      { property: "og:site_name", content: "Noise Labs" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Space+Grotesk:wght@500;700&family=Space+Mono&display=swap",
      },
      { rel: "canonical", href: "https://noiselabs.com.br/" },
    ],
  }),
});
