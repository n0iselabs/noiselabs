import { createFileRoute } from "@tanstack/react-router";
import NoiseLabsLanding from "@/components/NoiseLabsLanding";
import spaceGroteskBoldUrl from "@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2?url";

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
      {
        rel: "preload",
        href: spaceGroteskBoldUrl,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "canonical", href: "https://noiselabs.com.br/" },
    ],
  }),
});
