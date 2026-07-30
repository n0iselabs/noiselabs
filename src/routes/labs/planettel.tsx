import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import planettelCss from "./planettel.css?url";

// Apresentação privada de auditoria/proposta para a PlanetTel.
// Rota isolada, fora do menu principal, noindex — acessível só por link direto.
export const Route = createFileRoute("/labs/planettel")({
  head: () => ({
    meta: [
      { title: "PlanetTel · Auditoria + Novo Site — Noise Labs" },
      {
        name: "description",
        content: "Apresentação privada de auditoria digital e proposta para a PlanetTel — Noise Labs.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "PlanetTel · Auditoria + Novo Site — Noise Labs" },
      {
        property: "og:description",
        content: "Apresentação privada de auditoria digital e proposta para a PlanetTel — Noise Labs.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://noiselabs.com.br/labs/planettel" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "PlanetTel · Auditoria + Novo Site — Noise Labs" },
      {
        name: "twitter:description",
        content: "Apresentação privada de auditoria digital e proposta para a PlanetTel — Noise Labs.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://noiselabs.com.br/labs/planettel" },
      { rel: "stylesheet", href: planettelCss },
    ],
  }),
  component: PlanetTelAuditoria,
});

const CHAIN: Array<[string, string, string, boolean]> = [
  ["01", "Panorama", "panorama", false],
  ["02", "O que encontramos", "encontramos", false],
  ["03", "Competitivo", "competitivo", false],
  ["04", "Oportunidade", "oportunidade", false],
  ["05", "Site no ar", "construimos", true],
  ["06", "Próximo passo", "proximo", false],
];

function PlanetTelAuditoria() {
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const chainRef = useRef<HTMLDivElement>(null);
  const tblRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Tema (persistido em localStorage), independente do resto do site —
  // usa data-theme no <html>, que o site não usa em nenhum outro lugar.
  useEffect(() => {
    const root = document.documentElement;
    const setT = (t: string) => {
      root.setAttribute("data-theme", t);
      try {
        localStorage.setItem("pt-theme", t);
      } catch {
        /* ignore */
      }
    };
    try {
      const s = localStorage.getItem("pt-theme");
      if (s) setT(s);
    } catch {
      /* ignore */
    }
    const btn = toggleRef.current;
    const onClick = () => {
      let cur = root.getAttribute("data-theme");
      if (!cur) cur = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setT(cur === "dark" ? "light" : "dark");
    };
    btn?.addEventListener("click", onClick);
    return () => {
      btn?.removeEventListener("click", onClick);
      root.removeAttribute("data-theme");
    };
  }, []);

  // Reveal on scroll + esmaecimento da timeline/tabela + carrossel
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const page = pageRef.current;
    if (!page) return;

    const rev = page.querySelectorAll(".reveal");
    let io: IntersectionObserver | undefined;
    if (reduce || !("IntersectionObserver" in window)) {
      rev.forEach((e) => e.classList.add("in"));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((x) => {
            if (x.isIntersecting) {
              x.target.classList.add("in");
              io?.unobserve(x.target);
            }
          });
        },
        { threshold: 0.12 },
      );
      rev.forEach((e) => io?.observe(e));
    }

    const chainEl = chainRef.current;
    const updateChainFade = () => {
      if (!chainEl) return;
      const atEnd = chainEl.scrollLeft + chainEl.clientWidth >= chainEl.scrollWidth - 4;
      chainEl.classList.toggle("at-end", atEnd);
    };
    chainEl?.addEventListener("scroll", updateChainFade, { passive: true });
    window.addEventListener("resize", updateChainFade);
    updateChainFade();

    const tblEl = tblRef.current;
    const updateTblFade = () => {
      if (!tblEl) return;
      const atEnd = tblEl.scrollLeft + tblEl.clientWidth >= tblEl.scrollWidth - 4;
      tblEl.classList.toggle("at-end", atEnd);
    };
    tblEl?.addEventListener("scroll", updateTblFade, { passive: true });
    window.addEventListener("resize", updateTblFade);
    updateTblFade();

    return () => {
      io?.disconnect();
      chainEl?.removeEventListener("scroll", updateChainFade);
      window.removeEventListener("resize", updateChainFade);
      tblEl?.removeEventListener("scroll", updateTblFade);
      window.removeEventListener("resize", updateTblFade);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  // Onda "sinal sobre ruído" no canvas do hero
  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext ? cv.getContext("2d") : null;
    if (!cv || !ctx) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0,
      H = 0,
      t = 0,
      midY = 0,
      raf = 0,
      visible = true;

    const css = (v: string) => getComputedStyle(pageRef.current ?? document.documentElement).getPropertyValue(v).trim();

    const sigY = (x: number, ph = 0) => {
      const edge = Math.min(1, Math.min(x, W - x) / 120);
      const right = 0.35 + 0.65 * (x / W);
      const amp = (20 + 36 * right) * edge;
      return midY + Math.sin(x * 0.016 + t + ph) * amp + Math.sin(x * 0.006 - t * 0.6) * 10 * edge;
    };

    const drawWave = () => {
      if (!W) return;
      ctx.clearRect(0, 0, W, H);
      const sig = css("--pt-signal") || "#AAFF00";
      const noiseCol = css("--pt-line") || "#242b1b";
      midY = H * 0.54;

      ctx.strokeStyle = noiseCol;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 3) {
        const nz =
          midY +
          Math.sin(x * 0.045 + t * 1.6) * 7 +
          Math.sin(x * 0.11 - t * 1.1) * 4 +
          Math.sin(x * 0.19 + t * 0.7) * 2.5 +
          Math.sin(x * 0.31 - t * 2.3) * 1.5;
        if (x === 0) ctx.moveTo(x, nz);
        else ctx.lineTo(x, nz);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = sig;
      ctx.globalAlpha = 0.15;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let xe = 0; xe <= W; xe += 3) {
        const ye = sigY(xe, 0.9);
        if (xe === 0) ctx.moveTo(xe, ye);
        else ctx.lineTo(xe, ye);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "rgba(170,255,0,0)");
      grad.addColorStop(0.12, sig);
      grad.addColorStop(0.9, sig);
      grad.addColorStop(1, "rgba(170,255,0,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.25;
      ctx.shadowColor = sig;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      for (let x2 = 0; x2 <= W; x2 += 2) {
        const y = sigY(x2, 0);
        if (x2 === 0) ctx.moveTo(x2, y);
        else ctx.lineTo(x2, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      const px = W * 0.66;
      const py = sigY(px, 0);
      ctx.fillStyle = sig;
      ctx.shadowColor = sig;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(px, py, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      W = r.width;
      H = r.height;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawWave();
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    };
    window.addEventListener("resize", onResize);

    function loop() {
      t += 0.03;
      drawWave();
      raf = requestAnimationFrame(loop);
    }
    function play() {
      if (!reduce && !raf && visible) raf = requestAnimationFrame(loop);
    }
    function stop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    resize();
    let io: IntersectionObserver | undefined;
    if (reduce) {
      drawWave();
    } else {
      play();
      const heroEl = cv.closest(".hero");
      if (heroEl) {
        io = new IntersectionObserver((entries) => {
          visible = entries[0].isIntersecting;
          if (visible) play();
          else stop();
        });
        io.observe(heroEl);
      }
    }

    return () => {
      stop();
      io?.disconnect();
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <div className="pt-page" ref={pageRef}>
      <header className="top">
        <div className="wrap">
          <a className="brand" href="#top">
            <span className="mark" aria-hidden="true">
              <svg width="20" height="16" viewBox="0 0 92 72" aria-hidden="true">
                <rect x="4" y="0" width="4" height="18" fill="#AAFF00" />
                <rect x="84" y="0" width="4" height="18" fill="#AAFF00" />
                <rect x="1" y="18" width="10" height="16" rx="4" fill="#AAFF00" />
                <rect x="81" y="18" width="10" height="16" rx="4" fill="#AAFF00" />
                <rect x="10" y="10" width="72" height="53" rx="16" fill="#AAFF00" />
                <circle cx="30" cy="33" r="11" fill="#0A0A0A" />
                <circle cx="62" cy="33" r="11" fill="#0A0A0A" />
              </svg>
            </span>
            <span className="wordmark">
              Noise<b>Labs</b>
            </span>
          </a>
          <span className="top-tag">/ auditoria · planettel</span>
          <span className="spacer" />
          <button ref={toggleRef} className="toggle" aria-label="Alternar tema" type="button">
            tema
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <canvas ref={canvasRef} aria-hidden="true" />
        <div className="wrap">
          <div className="hero-box">
            <p className="eyebrow">
              <span className="dot" /> Auditoria digital + novo site · Noise Labs
            </p>
            <h1 className="title">
              A PlanetTel já vende.
              <br />
              Falta o digital <em>vender junto</em>.
            </h1>
            <p className="lead">
              Olhamos sua operação de fora — reputação, concorrência e conversão — e já{" "}
              <b>construímos o novo site</b> a partir do que encontramos. Provedor de fibra em Rio Grande da
              Serra, Ribeirão Pires e Mauá.
            </p>
            <div className="stats">
              <span className="stat">
                <b>214</b> avaliações
              </span>
              <span className="stat">
                <b className="star">4,8★</b> no Google
              </span>
              <span className="stat">
                <b>3</b> cidades
              </span>
              <span className="stat">
                <b>4</b> planos · R$&nbsp;79,90+
              </span>
            </div>
            <div className="hero-cta">
              <a className="btn btn-primary" href="https://planettel.vercel.app" target="_blank" rel="noopener">
                Ver o novo site no ar ↗
              </a>
              <a className="btn btn-ghost" href="#oportunidade">
                Ver a oportunidade
              </a>
            </div>
            <p className="hero-note">// prévia de apresentação · endereço temporário, fora dos buscadores</p>
          </div>
        </div>
        <div className="wrap chain-wrap">
          <p className="chain-label">// da auditoria ao site no ar — a cadeia de sinal · clique para navegar</p>
          <div className="chain" ref={chainRef}>
            {CHAIN.map(([n, label, target, hi], i) => (
              <div className="node" key={target}>
                <button
                  type="button"
                  className={"chip" + (hi ? " hi" : "")}
                  style={{ animationDelay: `${i * 0.6}s` }}
                  onClick={() => scrollToSection(target)}
                >
                  <span className="k">{n}</span>
                  {label}
                </button>
                {i < CHAIN.length - 1 && <span className="link" />}
              </div>
            ))}
          </div>
          <div className="scrollhint" aria-hidden="true">
            role para ler a auditoria <span className="arw">↓</span>
          </div>
        </div>
      </section>

      <main>
        {/* 01 PANORAMA */}
        <section className="sec reveal" id="panorama">
          <div className="wrap">
            <p className="label">
              <span className="n">01</span> Panorama
            </p>
            <h2>O produto é forte. A vitrine, não.</h2>
            <p className="lede">
              A PlanetTel tem os fundamentos certos: fibra 100%, preços competitivos, streaming incluso e
              atendimento em três cidades do Grande ABC. O que ainda não acontece é transformar esse produto em{" "}
              <strong>confiança</strong> e em <strong>contato qualificado</strong> no digital.
            </p>
            <div className="kpis">
              <div className="kpi hi">
                <span className="k">Planos</span>
                <span className="v">4</span>
                <span className="s">300 a 700 Mega</span>
              </div>
              <div className="kpi">
                <span className="k">Entrada</span>
                <span className="v">R$ 79,90</span>
                <span className="s">300 Mega / mês</span>
              </div>
              <div className="kpi">
                <span className="k">Cidades</span>
                <span className="v">3</span>
                <span className="s">cobertura regional</span>
              </div>
              <div className="kpi">
                <span className="k">Streaming</span>
                <span className="v">Incluso</span>
                <span className="s">Max · Disney+</span>
              </div>
            </div>
            <div className="tbl" ref={tblRef}>
              <table>
                <thead>
                  <tr>
                    <th>Plano</th>
                    <th className="num">Velocidade</th>
                    <th className="num">Valor/mês</th>
                    <th>Inclui</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pl">300 Mega</td>
                    <td className="num">300 Mbps</td>
                    <td className="num">R$ 79,90</td>
                    <td>Roteador Wi-Fi</td>
                  </tr>
                  <tr className="hi">
                    <td className="pl">400 Mega</td>
                    <td className="num">400 Mbps</td>
                    <td className="num">R$ 89,90</td>
                    <td>Wi-Fi · “mais escolhido”</td>
                  </tr>
                  <tr>
                    <td className="pl">600 Mega</td>
                    <td className="num">600 Mbps</td>
                    <td className="num">R$ 99,90</td>
                    <td>Roteador Wi-Fi</td>
                  </tr>
                  <tr>
                    <td className="pl">700 Mega</td>
                    <td className="num">700 Mbps</td>
                    <td className="num">R$ 109,90</td>
                    <td>Wi-Fi 6 + Max ou Disney+</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 02 O QUE ENCONTRAMOS */}
        <section className="sec reveal" id="encontramos">
          <div className="wrap">
            <p className="label">
              <span className="n">02</span> O que encontramos
            </p>
            <h2>Onde a PlanetTel perde cliente hoje</h2>
            <p className="lede">
              Seis pontos observados nas fontes públicas. Nenhum é grave sozinho — juntos, explicam por que um
              bom produto não vira contato.
            </p>
            <div className="find">
              <div className="item hi">
                <h3>
                  Prova social forte — só que fora do site{" "}
                  <span className="m">214 avaliações · 4,8★ no Google</span>
                </h3>
                <p>
                  A reputação existe e é robusta, com elogios recorrentes ao atendimento humanizado e à
                  estabilidade. O problema é que ela vive só no Google — o site não exibe uma única avaliação. A
                  alavanca deixou de ser <em>criar</em> prova social e passou a ser <em>expor</em> a que já
                  existe.
                </p>
              </div>
              <div className="item">
                <h3>
                  Instagram ativo, mas sem função de conversão{" "}
                  <span className="m">109 posts · 1.114 seguidores</span>
                </h3>
                <p>
                  Audiência real para um provedor regional — não é um problema de alcance. O feed está só
                  incorporado ao site como conteúdo passivo, sem CTA, verificador de cobertura ou captação de lead.
                </p>
              </div>
              <div className="item">
                <h3>
                  Sem verificação de cobertura <span className="m">fricção nº 1 de ISP</span>
                </h3>
                <p>
                  A primeira dúvida de todo cliente — “vocês atendem meu endereço?” — não é respondida. O site
                  joga direto no WhatsApp, sem qualificar nem capturar o lead.
                </p>
              </div>
              <div className="item">
                <h3>
                  Streaming enterrado <span className="m">só no plano de R$ 109,90</span>
                </h3>
                <p>
                  O topo do site promete “os melhores streamings”, mas Max e Disney+ só existem no plano mais
                  caro. O maior diferencial de venda fica escondido.
                </p>
              </div>
              <div className="item">
                <h3>
                  Invisível na busca local <span className="m">fora da 1ª página</span>
                </h3>
                <p>
                  Nas buscas por internet na região, quem aparece são players nacionais e sites de comparação.
                  Sendo o provedor daqui, a PlanetTel deveria ganhar essa disputa — e não aparece.
                </p>
              </div>
              <div className="item">
                <h3>
                  Sem área do cliente <span className="m">retenção e suporte</span>
                </h3>
                <p>
                  Não há portal de autosserviço (2ª via, suporte). Isso sobrecarrega o atendimento e enfraquece a
                  retenção ao longo do tempo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 03 CENÁRIO COMPETITIVO */}
        <section className="sec reveal" id="competitivo">
          <div className="wrap">
            <p className="label">
              <span className="n">03</span> Cenário competitivo
            </p>
            <h2>O trunfo local não está sendo usado</h2>
            <p className="lede">
              Na busca por “internet em Rio Grande da Serra”, dominam a <strong>Giga+ Fibra</strong> — nacional,
              com páginas locais dedicadas e SEO forte — e agregadores de comparação. O trunfo da PlanetTel é ser
              daqui: atendimento próximo, três cidades, relação de bairro. Hoje esse trunfo não aparece onde o
              cliente decide.
            </p>
            <div className="callout">
              <span className="lbl">Leitura</span>
              Contra um player nacional você não ganha no volume de mídia. Ganha em{" "}
              <strong>confiança local + prova social + facilidade de contratar</strong> — exatamente o que hoje
              está fraco e é 100% corrigível.
            </div>
          </div>
        </section>

        {/* 04 A OPORTUNIDADE */}
        <section className="sec reveal" id="oportunidade">
          <div className="wrap">
            <p className="label">
              <span className="n">04</span> A oportunidade
            </p>
            <h2>De vitrine de planos a máquina de assinantes</h2>
            <div className="cards">
              <div className="card">
                <h3>
                  <span className="cdot" />
                  Prova social ativa
                </h3>
                <p>
                  Trazer as 214 avaliações (4,8★) e depoimentos reais para dentro do site. É a alavanca de
                  confiança mais rápida — e a de menor esforço, porque o ativo já existe: só falta expô-lo.
                </p>
              </div>
              <div className="card">
                <h3>
                  <span className="cdot" />
                  Verificador de cobertura
                </h3>
                <p>
                  O cliente confere o endereço e vira lead qualificado antes de chegar no WhatsApp. Menos
                  fricção, contato melhor.
                </p>
              </div>
              <div className="card">
                <h3>
                  <span className="cdot" />
                  Streaming como argumento
                </h3>
                <p>
                  Deixar claro, por plano, o que está incluso. Transformar o diferencial escondido em motivo de
                  escolha.
                </p>
              </div>
              <div className="card">
                <h3>
                  <span className="cdot" />
                  Site e SEO local
                </h3>
                <p>
                  Ganhar as buscas das três cidades e converter em contato — um site feito para vender, não só
                  para mostrar.
                </p>
              </div>
            </div>
            <div className="callout">
              <span className="lbl">O objetivo</span>
              Não é “um site novo”. É transformar a presença digital em um sistema que gera assinantes de forma{" "}
              <strong>previsível</strong> — e sustentar isso mês a mês.
            </div>
          </div>
        </section>

        {/* 05 O QUE JÁ CONSTRUÍMOS */}
        <section className="sec reveal" id="construimos">
          <div className="wrap">
            <p className="label">
              <span className="n">05</span> O que já construímos
            </p>
            <h2>Não paramos no diagnóstico. O site já está no ar.</h2>
            <p className="lede">
              A partir desta auditoria, construímos o novo site da PlanetTel — cada oportunidade acima virou
              algo concreto, pronto para você navegar agora do seu celular.
            </p>
            <div className="cards">
              <div className="card">
                <h3>
                  <span className="cdot" />
                  Prova social dentro do site
                </h3>
                <p>
                  As 214 avaliações (4,8★) e depoimentos reais de clientes da região — muitos de 3 a 6 anos de
                  casa. A confiança que vivia só no Google agora aparece para quem visita.
                </p>
              </div>
              <div className="card">
                <h3>
                  <span className="cdot" />
                  Verificador de cobertura
                </h3>
                <p>
                  O visitante informa o endereço e chega ao WhatsApp já contextualizado — a fricção nº 1 de ISP,
                  resolvida logo na primeira dobra.
                </p>
              </div>
              <div className="card">
                <h3>
                  <span className="cdot" />
                  Streaming como argumento
                </h3>
                <p>
                  Uma seção dedicada ao combo fibra + streaming do plano 700 Mega — o diferencial que estava
                  escondido, agora em destaque.
                </p>
              </div>
              <div className="card">
                <h3>
                  <span className="cdot" />
                  Rápido e encontrável
                </h3>
                <p>
                  Site em fibra de verdade: leve no celular e preparado para o Google das três cidades — SEO
                  local, dados estruturados e bom preview no WhatsApp.
                </p>
              </div>
            </div>
            <div className="livebox">
              <div>
                <p className="lt">Veja no ar</p>
                <p>
                  O novo site já está publicado e funcionando. Abra do celular — é assim que o{" "}
                  <b>seu cliente vai encontrar a PlanetTel</b>.
                </p>
              </div>
              <a className="btn btn-primary" href="https://planettel.vercel.app" target="_blank" rel="noopener">
                planettel.vercel.app ↗
              </a>
            </div>
            <p className="note">
              A área do cliente / portal (2ª via, PIX, status da rede) acompanha como demonstração do próximo
              módulo, com dados fictícios — ainda não é um sistema em produção.
            </p>
          </div>
        </section>

        {/* 06 PRÓXIMO PASSO */}
        <section className="sec reveal" id="proximo">
          <div className="wrap">
            <p className="label">
              <span className="n">06</span> Próximo passo
            </p>
            <h2>Publicar e colocar para vender</h2>
            <p className="lede">
              Esta auditoria virou um site real. Para publicá-lo no ar e evoluí-lo com dados de verdade,
              precisamos alinhar quatro pontos que só vocês sabem responder:
            </p>
            <ol className="steps">
              <li>
                Qual plano ou segmento é o <strong>mais lucrativo</strong> hoje — e qual vocês querem crescer?
              </li>
              <li>
                Existe interesse em <strong>planos empresariais</strong> (B2B)?
              </li>
              <li>
                Entre as <strong>214 avaliações</strong>, quais histórias podemos destacar como depoimentos — e
                há clientes dispostos a um relato em vídeo?
              </li>
              <li>
                Qual a <strong>cobertura real</strong>, por bairro, para o verificador e o SEO local?
              </li>
            </ol>
            <div className="final">
              <p className="big">
                Seu novo site está pronto.
                <br />
                Vamos colocá-lo para <b>vender</b>.
              </p>
              <p>Próximo passo: alinhar os quatro pontos acima e publicar o site para começar a gerar contato.</p>
              <div className="hero-cta">
                <a
                  className="btn btn-primary"
                  href="https://planettel.vercel.app"
                  target="_blank"
                  rel="noopener"
                >
                  Abrir o site no ar ↗
                </a>
              </div>
            </div>
            <p className="note">
              Auditoria baseada em fontes públicas (site oficial, Google, Solutudo, Reclame Aqui) em 23/07/2026
              · revisada em 30/07/2026. O volume de avaliações (214 · 4,8★) foi informado pela PlanetTel; demais
              dados internos serão confirmados na etapa seguinte. Planos e valores conforme observados nas
              fontes. Diagnóstico externo, não uma afirmação sobre a operação interna da PlanetTel.
            </p>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="fbrand">
            <svg width="18" height="14" viewBox="0 0 92 72" aria-hidden="true">
              <rect x="4" y="0" width="4" height="18" fill="#AAFF00" />
              <rect x="84" y="0" width="4" height="18" fill="#AAFF00" />
              <rect x="1" y="18" width="10" height="16" rx="4" fill="#AAFF00" />
              <rect x="81" y="18" width="10" height="16" rx="4" fill="#AAFF00" />
              <rect x="10" y="10" width="72" height="53" rx="16" fill="#AAFF00" />
              <circle cx="30" cy="33" r="11" fill="#0A0A0A" />
              <circle cx="62" cy="33" r="11" fill="#0A0A0A" />
            </svg>
            <span>
              <b>NOISE LABS</b> · Clareza antes da execução
            </span>
          </div>
          <span className="fnote">Documento confidencial · Sinal, não ruído</span>
        </div>
      </footer>
    </div>
  );
}
