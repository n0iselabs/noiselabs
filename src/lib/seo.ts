const SITE_URL = "https://noiselabs.com.br";
const SITE_NAME = "Noise Labs";

export interface AuditSeoConfig {
  /** Caminho da rota, ex: "/labs/planettel". */
  path: string;
  title: string;
  description: string;
  /** Título para OG/Twitter — pode ser mais chamativo que o title da aba. Default: title. */
  ogTitle?: string;
  /** Descrição para OG/Twitter — pode despertar mais curiosidade que a meta description. Default: description. */
  ogDescription?: string;
  /** Caminho da imagem OG 1200x630, ex: "/og/planettel.jpg". */
  image: string;
  imageAlt: string;
  /** Default: "noindex, nofollow" — toda auditoria de cliente é privada por padrão. */
  robots?: string;
}

/**
 * Gera o head() (meta + links) padrão de uma rota de auditoria privada de
 * cliente (`/labs/<cliente>`): título, descrição, robots, Open Graph e
 * Twitter Card completos, com imagem e canonical próprios — nunca herda os
 * metadados do site principal. Usar em toda nova rota de auditoria.
 */
export function buildAuditHead(config: AuditSeoConfig) {
  const url = `${SITE_URL}${config.path}`;
  const image = `${SITE_URL}${config.image}`;
  const ogTitle = config.ogTitle ?? config.title;
  const ogDescription = config.ogDescription ?? config.description;
  const robots = config.robots ?? "noindex, nofollow";

  return {
    meta: [
      { title: config.title },
      { name: "description", content: config.description },
      { name: "robots", content: robots },
      { property: "og:title", content: ogTitle },
      { property: "og:description", content: ogDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: config.imageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: ogTitle },
      { name: "twitter:description", content: ogDescription },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: config.imageAlt },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
