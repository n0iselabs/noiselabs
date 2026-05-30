// HeroAtmosphereCanvas — v2: cursor interference field
// Backup da v1 em: backup/hero-original-noise-labs/HeroAtmosphereCanvas-v1.tsx
//
// Camadas renderizadas em ordem no mesmo loop RAF:
//   1. GRID TECNOLÓGICO   — linhas quase invisíveis, reagem ao cursor
//   2. BASE GRAIN         — noise orgânico, troca a cada 3 frames
//   3. CURSOR FIELD       — haze verde + scanlines CRT no raio do cursor
//   4. DISRUPTION GRAIN   — noise denso mascarado ao campo do cursor (offscreen canvas)
//   5. INTERFERÊNCIA      — scan lines horizontais raras, atmosféricas
//   6. RIPPLES            — anéis de onda expandindo por velocidade de mouse
//
// Performance:
//   • grain: padrões pré-renderizados (4 patches × 256px², troca a 20fps)
//   • disruption: 6 patches com tint verde, troca a 30fps, offscreen canvas
//   • grid: O(N linhas) por frame, custo ~0.1ms
//   • todos os efeitos de cursor são gated por fieldAlpha (0 = sem custo extra)
//   • IntersectionObserver pausa o loop quando fora da viewport
//   • prefers-reduced-motion e pointer:coarse respeitados

import { useEffect, useRef } from "react";

const ACCENT = { r: 170, g: 255, b: 0 };

// ─── BASE GRAIN ───────────────────────────────────────────────────────────────
// Noise neutro luminoso, sparse (72% transparente). Troca lenta = film grain.

const PATCH_SIZE  = 256;
const PATCH_COUNT = 4;

function buildGrainPatterns(ctx: CanvasRenderingContext2D): (CanvasPattern | null)[] {
  return Array.from({ length: PATCH_COUNT }, () => {
    const pc = document.createElement("canvas");
    pc.width = pc.height = PATCH_SIZE;
    const pctx = pc.getContext("2d")!;
    const img   = pctx.createImageData(PATCH_SIZE, PATCH_SIZE);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(190 + Math.random() * 65);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      const r = Math.random();
      img.data[i + 3] = r < 0.72 ? 0 : Math.floor(((r - 0.72) / 0.28) * 13);
    }
    pctx.putImageData(img, 0, 0);
    return ctx.createPattern(pc, "repeat");
  });
}

// ─── DISRUPTION GRAIN ─────────────────────────────────────────────────────────
// Noise verde-tintado, 2× mais denso. Troca rápida (30fps) → "sinal corrompido".

const DISRUPT_COUNT = 6;
const DISRUPT_MAX_A = 26; // ~2× base grain

function buildDisruptPatterns(ctx: CanvasRenderingContext2D): (CanvasPattern | null)[] {
  return Array.from({ length: DISRUPT_COUNT }, () => {
    const pc = document.createElement("canvas");
    pc.width = pc.height = PATCH_SIZE;
    const pctx = pc.getContext("2d")!;
    const img   = pctx.createImageData(PATCH_SIZE, PATCH_SIZE);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(165 + Math.random() * 90);
      img.data[i]     = Math.floor(v * 0.80);      // R — reduzido
      img.data[i + 1] = Math.min(255, v + 22);      // G — boosted (tint verde)
      img.data[i + 2] = Math.floor(v * 0.72);      // B — reduzido
      const r = Math.random();
      img.data[i + 3] = r < 0.56 ? 0 : Math.floor(((r - 0.56) / 0.44) * DISRUPT_MAX_A);
    }
    pctx.putImageData(img, 0, 0);
    return ctx.createPattern(pc, "repeat");
  });
}

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface ScanLine {
  y: number; x: number; width: number; alpha: number;
  elapsed: number; fadeInEnd: number; holdEnd: number; totalDuration: number;
}

interface Ripple {
  x: number; y: number;
  radius: number; maxRadius: number;
  born: number; duration: number;
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export function HeroAtmosphereCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile      = window.matchMedia("(pointer: coarse)").matches;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Padrões de grain ──────────────────────────────────────────────────────
    const grainPatterns   = buildGrainPatterns(ctx);
    const disruptPatterns = isMobile ? [] : buildDisruptPatterns(ctx);

    // ── Offscreen canvas — grain de disrupção mascarado ───────────────────────
    // Usamos destination-in aqui para criar máscara radial suave sem afetar
    // o canvas principal.
    const offCanvas = document.createElement("canvas");
    const offCtx    = offCanvas.getContext("2d");

    // ── Dimensões CSS do canvas ───────────────────────────────────────────────
    let cW = 0, cH = 0;

    // ── Estado do loop ────────────────────────────────────────────────────────
    let rafId    = 0;
    let running  = true;
    let frame    = 0;
    let lastTime = performance.now();

    // ── Índices de grain ──────────────────────────────────────────────────────
    let grainIdx   = 0;
    let disruptIdx = 0;

    // ── Estado do campo de cursor ─────────────────────────────────────────────
    // targetMouse: posição bruta do mouse
    // smoothMouse: posição interpolada (lerp 10%) → suavidade natural
    // fieldAlpha:  0→1, fade suave ao entrar/sair do hero
    let targetMouse  = { x: -1, y: -1 };
    let smoothMouse  = { x: -1, y: -1 };
    let prevSmooth   = { x: -1, y: -1 };
    let mouseInHero  = false;
    let fieldAlpha   = 0;

    // ── Ripples ───────────────────────────────────────────────────────────────
    const ripples: Ripple[] = [];
    let lastRippleTime = 0;

    // ── Interferência atmosférica ─────────────────────────────────────────────
    const scanLines: ScanLine[] = [];
    let nextScanIn = reducedMotion ? Infinity : (Math.random() * 7 + 6) * 1000;

    function spawnScanLine() {
      const total = 1400 + Math.random() * 1800;
      scanLines.push({
        y: cH * (0.08 + Math.random() * 0.84),
        x: cW * (Math.random() * 0.15),
        width: cW * (0.28 + Math.random() * 0.52),
        alpha: 0, elapsed: 0,
        fadeInEnd: total * 0.28,
        holdEnd:   total * 0.72,
        totalDuration: total,
      });
    }

    // ── Resize ────────────────────────────────────────────────────────────────
    function resize() {
      const dpr  = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      cW = rect.width;
      cH = rect.height;
      canvas!.width  = cW * dpr;
      canvas!.height = cH * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Offscreen em CSS pixels — grain não precisa de nitidez retina
      offCanvas.width  = Math.ceil(cW);
      offCanvas.height = Math.ceil(cH);
    }

    // ── Handlers de mouse ─────────────────────────────────────────────────────
    function onMouseMove(e: MouseEvent) {
      if (isMobile) return;
      const rect   = canvas!.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      targetMouse  = { x, y };
      // Mouse "no hero" apenas quando dentro dos limites da section
      mouseInHero  = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
    }

    function onDocMouseLeave() {
      // Cursor saiu da janela do navegador
      mouseInHero = false;
    }

    // ── DRAW 1: Grid tecnológico ──────────────────────────────────────────────
    // Base quase invisível (0.016). O campo do cursor amplifica linhas próximas
    // com boost gated por fieldAlpha — sem cursor o boost é zero.
    function drawGrid() {
      const CELL   = 52;
      const radius = Math.max(cW, cH) * 0.26;
      const BASE   = 0.016;
      const BOOST  = isMobile ? 0 : 0.052 * fieldAlpha;

      ctx!.lineWidth = 0.5;

      for (let x = 0; x <= cW + CELL; x += CELL) {
        const dist  = smoothMouse.x >= 0 ? Math.abs(x - smoothMouse.x) : radius + 1;
        const alpha = BASE + BOOST * Math.max(0, 1 - dist / radius);
        ctx!.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${alpha.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, cH);
        ctx!.stroke();
      }

      for (let y = 0; y <= cH + CELL; y += CELL) {
        const dist  = smoothMouse.y >= 0 ? Math.abs(y - smoothMouse.y) : radius + 1;
        const alpha = BASE + BOOST * Math.max(0, 1 - dist / radius);
        ctx!.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${alpha.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(cW, y);
        ctx!.stroke();
      }
    }

    // ── DRAW 2: Base grain ────────────────────────────────────────────────────
    function drawGrain() {
      const pat = grainPatterns[grainIdx];
      if (!pat) return;
      ctx!.save();
      ctx!.fillStyle = pat;
      ctx!.fillRect(0, 0, cW, cH);
      ctx!.restore();
    }

    // ── DRAW 3: Campo do cursor — haze de energia + scanlines CRT ────────────
    // O haze cria a sensação de "campo de energia" ao redor do ponteiro.
    // As scanlines horizontais dão o toque de monitor CRT/industrial.
    function drawCursorField(now: number) {
      if (fieldAlpha <= 0 || smoothMouse.x < 0) return;

      const mx      = smoothMouse.x;
      const my      = smoothMouse.y;
      const FIELD_R = Math.min(cW, cH) * 0.22;
      const fa      = fieldAlpha;

      // Haze radial — glow difuso centrado no cursor
      const haze = ctx!.createRadialGradient(mx, my, 0, mx, my, FIELD_R);
      haze.addColorStop(0,    `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${(0.068 * fa).toFixed(3)})`);
      haze.addColorStop(0.22, `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${(0.032 * fa).toFixed(3)})`);
      haze.addColorStop(0.60, `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${(0.009 * fa).toFixed(3)})`);
      haze.addColorStop(1,    `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0)`);
      ctx!.save();
      ctx!.fillStyle = haze;
      ctx!.fillRect(0, 0, cW, cH);
      ctx!.restore();

      // Scanlines CRT — linhas horizontais com drift lento para baixo
      // Cada linha tem alpha proporcional à sua distância do centro do campo.
      const SPACING = 4;
      const drift   = (now * 0.038) % SPACING; // ~2.3px/s de descida
      const yStart  = Math.max(0,  my - FIELD_R);
      const yEnd    = Math.min(cH, my + FIELD_R);
      // Alinhar ao grid de scanlines com drift aplicado
      const yFirst  = yStart - ((yStart - drift) % SPACING + SPACING) % SPACING + SPACING;

      ctx!.save();
      ctx!.lineWidth = 0.5;
      for (let y = yFirst; y <= yEnd; y += SPACING) {
        const dy = Math.abs(y - my);
        if (dy >= FIELD_R) continue;
        // Largura do "acorde" da circunferência nessa altura
        const chord = Math.sqrt(FIELD_R * FIELD_R - dy * dy);
        const a     = fa * 0.030 * (1 - dy / FIELD_R) * (1 - dy / FIELD_R); // quadrático → centro mais vivo
        if (a < 0.002) continue;
        ctx!.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${a.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.moveTo(Math.max(0, mx - chord), y);
        ctx!.lineTo(Math.min(cW, mx + chord), y);
        ctx!.stroke();
      }
      ctx!.restore();

      // Anel de borda do campo — círculo muito fino marcando o limite
      const edgeAlpha = fa * 0.04;
      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(mx, my, FIELD_R, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${edgeAlpha.toFixed(3)})`;
      ctx!.lineWidth = 0.5;
      ctx!.stroke();
      ctx!.restore();
    }

    // ── DRAW 4: Disruption grain (offscreen canvas com máscara radial) ────────
    // Desenha grain denso e verde no offscreen canvas, aplica máscara radial
    // suave (destination-in) e composita no main canvas com fieldAlpha.
    // Resultado: zona de "sinal corrompido" de bordas macias ao redor do cursor.
    function drawCursorGrain() {
      if (!offCtx || fieldAlpha <= 0 || smoothMouse.x < 0 || disruptPatterns.length === 0) return;

      const mx      = smoothMouse.x;
      const my      = smoothMouse.y;
      const FIELD_R = Math.min(cW, cH) * 0.22;

      // Passo 1 — grain denso no offscreen
      offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
      const pat = disruptPatterns[disruptIdx];
      if (pat) {
        offCtx.fillStyle = pat;
        offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);
      }

      // Passo 2 — máscara radial: mantém apenas a área do campo do cursor.
      // destination-in preserva os pixels do destino onde o source é opaco.
      offCtx.globalCompositeOperation = "destination-in";
      const mask = offCtx.createRadialGradient(mx, my, 0, mx, my, FIELD_R);
      mask.addColorStop(0,    "rgba(0,0,0,1)");
      mask.addColorStop(0.40, "rgba(0,0,0,0.95)");
      mask.addColorStop(0.72, "rgba(0,0,0,0.50)");
      mask.addColorStop(0.90, "rgba(0,0,0,0.12)");
      mask.addColorStop(1,    "rgba(0,0,0,0)");
      offCtx.fillStyle = mask;
      offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);
      offCtx.globalCompositeOperation = "source-over";

      // Passo 3 — compositar no main canvas com fieldAlpha
      ctx!.save();
      ctx!.globalAlpha = fieldAlpha * 0.9; // levemente subunit para não saturar
      ctx!.drawImage(offCanvas, 0, 0, cW, cH);
      ctx!.restore();
    }

    // ── DRAW 5: Interferência atmosférica ─────────────────────────────────────
    // Scan lines horizontais raras que aparecem e somem. Independentes do cursor.
    function drawInterference(dt: number) {
      nextScanIn -= dt;
      if (nextScanIn <= 0 && scanLines.length < 2) {
        spawnScanLine();
        nextScanIn = (Math.random() * 10 + 7) * 1000;
      }

      for (let i = scanLines.length - 1; i >= 0; i--) {
        const sl = scanLines[i];
        sl.elapsed += dt;
        if (sl.elapsed >= sl.totalDuration) { scanLines.splice(i, 1); continue; }

        const MAX_A = 0.082;
        if (sl.elapsed < sl.fadeInEnd) {
          sl.alpha = (sl.elapsed / sl.fadeInEnd) * MAX_A;
        } else if (sl.elapsed < sl.holdEnd) {
          const t = (sl.elapsed - sl.fadeInEnd) / (sl.holdEnd - sl.fadeInEnd);
          sl.alpha = MAX_A * (1 + Math.sin(t * Math.PI * 5) * 0.18);
        } else {
          const t = (sl.elapsed - sl.holdEnd) / (sl.totalDuration - sl.holdEnd);
          sl.alpha = MAX_A * (1 - t);
        }
        if (sl.alpha <= 0.001) continue;

        const g = ctx!.createLinearGradient(sl.x, sl.y, sl.x + sl.width, sl.y);
        g.addColorStop(0,    `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0)`);
        g.addColorStop(0.10, `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${sl.alpha.toFixed(3)})`);
        g.addColorStop(0.78, `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${(sl.alpha * 0.55).toFixed(3)})`);
        g.addColorStop(1,    `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0)`);

        ctx!.save();
        ctx!.fillStyle = g;
        ctx!.fillRect(sl.x, sl.y - 0.5, sl.width, 1);

        if (sl.alpha > 0.035) {
          const ha = sl.alpha * 0.14;
          const hg = ctx!.createLinearGradient(sl.x, sl.y, sl.x + sl.width, sl.y);
          hg.addColorStop(0,    `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0)`);
          hg.addColorStop(0.12, `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${ha.toFixed(3)})`);
          hg.addColorStop(0.88, `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${(ha * 0.6).toFixed(3)})`);
          hg.addColorStop(1,    `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0)`);
          ctx!.fillStyle = hg;
          ctx!.fillRect(sl.x, sl.y - 5, sl.width, 10);
        }
        ctx!.restore();
      }
    }

    // ── DRAW 6: Ripples — ondas de pulso por velocidade do cursor ─────────────
    // Quando o cursor move rápido, um anel se expande a partir da posição
    // suavizada (não raw) — dá sensação de onda/perturbação no campo.
    function updateAndDrawRipples(now: number) {
      // Spawn: velocidade do smoothMouse acima do limiar → gera anel
      if (smoothMouse.x >= 0 && prevSmooth.x >= 0 && fieldAlpha > 0.12 && ripples.length < 5) {
        const vx  = smoothMouse.x - prevSmooth.x;
        const vy  = smoothMouse.y - prevSmooth.y;
        const vel = Math.sqrt(vx * vx + vy * vy);
        if (vel > 3.5 && (now - lastRippleTime) > 160) {
          const R = Math.min(cW, cH) * 0.22;
          ripples.push({
            x: smoothMouse.x, y: smoothMouse.y,
            radius: 0, maxRadius: R * 0.62,
            born: now, duration: 850,
          });
          lastRippleTime = now;
        }
      }

      // Draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r        = ripples[i];
        const progress = (now - r.born) / r.duration;
        if (progress >= 1) { ripples.splice(i, 1); continue; }

        // Expansão com ease-out; alpha quadrático → devanece rápido no final
        r.radius = r.maxRadius * Math.pow(progress, 0.52);
        const a  = fieldAlpha * 0.10 * (1 - progress) * (1 - progress);
        if (a < 0.003) continue;

        ctx!.save();
        ctx!.beginPath();
        ctx!.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${a.toFixed(3)})`;
        ctx!.lineWidth = 0.8;
        ctx!.stroke();
        ctx!.restore();
      }
    }

    // ── Loop principal ────────────────────────────────────────────────────────
    function draw(now: number) {
      if (!running) return;
      rafId = requestAnimationFrame(draw);
      frame++;

      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      // ── Atualizar smooth mouse e fieldAlpha ────────────────────────────────
      if (mouseInHero && targetMouse.x >= 0) {
        const LERP = 0.10; // 10% por frame → lag suave, sem delay percebível
        if (smoothMouse.x < 0) {
          // Primeira entrada: snap para não ter "arrasto" do canto
          smoothMouse = { ...targetMouse };
          prevSmooth  = { ...targetMouse };
        } else {
          prevSmooth  = { ...smoothMouse };
          smoothMouse.x += (targetMouse.x - smoothMouse.x) * LERP;
          smoothMouse.y += (targetMouse.y - smoothMouse.y) * LERP;
        }
        // Fade-in: ~300ms para fieldAlpha atingir 1.0
        fieldAlpha = Math.min(1, fieldAlpha + dt * 0.0033);
      } else {
        prevSmooth = { x: -1, y: -1 };
        // Fade-out mais lento: ~600ms — efeito "ressoa" depois que o cursor sai
        fieldAlpha = Math.max(0, fieldAlpha - dt * 0.0017);
        if (fieldAlpha <= 0) smoothMouse = { x: -1, y: -1 };
      }

      // ── Avançar índices de grain ───────────────────────────────────────────
      if (frame % 3 === 0) grainIdx   = (grainIdx   + 1) % PATCH_COUNT;
      if (frame % 2 === 0) disruptIdx = (disruptIdx + 1) % DISRUPT_COUNT;

      // ── Renderizar camadas ─────────────────────────────────────────────────
      ctx!.clearRect(0, 0, cW, cH);

      // 1. Grid
      drawGrid();

      // 2. Base grain (mobile: frequência reduzida para economizar battery)
      const grainFreq = isMobile ? 6 : 1;
      if (frame % grainFreq === 0) drawGrain();

      if (!isMobile) {
        // 3. Haze + scanlines CRT do campo de cursor
        drawCursorField(now);

        // 4. Disruption grain (a cada 2 frames — rápido o suficiente para "frantic")
        if (frame % 2 === 0) drawCursorGrain();
      }

      // 5. Interferência atmosférica
      if (!reducedMotion) drawInterference(dt);

      // 6. Ripples de onda
      if (!isMobile && !reducedMotion) updateAndDrawRipples(now);
    }

    // ── Bootstrap ─────────────────────────────────────────────────────────────
    resize();
    window.addEventListener("resize",     resize);
    window.addEventListener("mousemove",  onMouseMove);
    document.addEventListener("mouseleave", onDocMouseLeave);

    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running) {
          lastTime = performance.now();
          rafId = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    rafId = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize",     resize);
      window.removeEventListener("mousemove",  onMouseMove);
      document.removeEventListener("mouseleave", onDocMouseLeave);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}
