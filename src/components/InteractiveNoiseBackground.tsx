// InteractiveNoiseBackground — campo de noise interativo com cursor
//
// Reutilizável em qualquer seção com `position: relative; overflow: hidden`.
// O canvas se posiciona absolute inset-0, pointer-events: none.
// O conteúdo da seção precisa ter `relative z-10` para ficar acima.
//
// Props:
//   intensity  — "medium" (hero) | "soft" (CTA e seções secundárias)
//   className  — classes extras para o <canvas>
//
// Camadas (ordem de render):
//   1. Grid tecnológico quase invisível, brightens próximo ao cursor
//   2. Base grain — noise neutro, troca a 20fps (film grain)
//   3. Cursor field — haze verde + scanlines CRT no raio do cursor
//   4. Disruption grain — noise denso + verde, via offscreen canvas mascarado
//   5. Interferência atmosférica — scan lines horizontais raras
//   6. Ripples — anéis expandindo por velocidade de cursor
//
// Mobile / acessibilidade:
//   • pointer:coarse — efeitos de cursor desativados; mantém grain + interferência
//   • prefers-reduced-motion — desativa interferência + ripples; grain estático

import { useEffect, useRef } from "react";

// ─── ACCENT ──────────────────────────────────────────────────────────────────

const ACCENT = { r: 170, g: 255, b: 0 };

// ─── CONFIGURAÇÕES POR INTENSIDADE ───────────────────────────────────────────

type Intensity = "medium" | "soft";

interface NoiseConfig {
  // Grid
  gridBase:       number;  // alpha base das linhas
  gridBoost:      number;  // boost máximo ao cursor (gated por fieldAlpha)
  // Haze (glow ao redor do cursor)
  hazeCenter:     number;  // alpha no centro do campo
  hazeMid:        number;  // alpha a 22% do raio
  hazeOuter:      number;  // alpha a 60% do raio
  // Campo
  fieldRadius:    number;  // raio como fração de min(W,H)
  showFieldEdge:  boolean; // anel de borda do campo
  edgeAlpha:      number;  // alpha do anel de borda
  // Scanlines CRT dentro do campo
  scanlineMax:    number;  // alpha máximo das scanlines no centro
  // Grain base (film grain)
  grainBaseMaxA:  number;  // alpha máx do grain base (0-255)
  // Grain de disrupção (cursor zone)
  disruptMaxA:    number;  // alpha máx do grain de disrupção (0-255)
  // Ripples
  rippleAlpha:    number;  // alpha máx dos anéis de onda
  // Interferência atmosférica
  ifMinDelay:     number;  // ms mínimo entre scan lines atmosféricas
  ifMaxDelay:     number;  // ms máximo
}

const CONFIGS: Record<Intensity, NoiseConfig> = {
  // Hero — efeito completo, drama máximo permitido
  medium: {
    gridBase:      0.016,
    gridBoost:     0.052,
    hazeCenter:    0.068,
    hazeMid:       0.032,
    hazeOuter:     0.009,
    fieldRadius:   0.22,
    showFieldEdge: true,
    edgeAlpha:     0.040,
    scanlineMax:   0.030,
    grainBaseMaxA: 13,
    disruptMaxA:   26,
    rippleAlpha:   0.10,
    ifMinDelay:    7000,
    ifMaxDelay:    17000,
  },
  // CTA / seções secundárias — mais suave, legibilidade priorizada
  soft: {
    gridBase:      0.011,
    gridBoost:     0.026,
    hazeCenter:    0.038,
    hazeMid:       0.015,
    hazeOuter:     0.004,
    fieldRadius:   0.27,
    showFieldEdge: false,
    edgeAlpha:     0.018,
    scanlineMax:   0.016,
    grainBaseMaxA: 9,
    disruptMaxA:   14,
    rippleAlpha:   0.055,
    ifMinDelay:    10000,
    ifMaxDelay:    24000,
  },
};

// ─── GRAIN HELPERS ────────────────────────────────────────────────────────────

const PATCH_SIZE  = 256;
const PATCH_COUNT = 4;

function buildGrainPatterns(
  ctx: CanvasRenderingContext2D,
  maxA: number,
): (CanvasPattern | null)[] {
  return Array.from({ length: PATCH_COUNT }, () => {
    const pc = document.createElement("canvas");
    pc.width = pc.height = PATCH_SIZE;
    const pctx = pc.getContext("2d")!;
    const img   = pctx.createImageData(PATCH_SIZE, PATCH_SIZE);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(190 + Math.random() * 65);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      const r = Math.random();
      img.data[i + 3] = r < 0.72 ? 0 : Math.floor(((r - 0.72) / 0.28) * maxA);
    }
    pctx.putImageData(img, 0, 0);
    return ctx.createPattern(pc, "repeat");
  });
}

const DISRUPT_COUNT = 6;

function buildDisruptPatterns(
  ctx: CanvasRenderingContext2D,
  maxA: number,
): (CanvasPattern | null)[] {
  return Array.from({ length: DISRUPT_COUNT }, () => {
    const pc = document.createElement("canvas");
    pc.width = pc.height = PATCH_SIZE;
    const pctx = pc.getContext("2d")!;
    const img   = pctx.createImageData(PATCH_SIZE, PATCH_SIZE);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(165 + Math.random() * 90);
      img.data[i]     = Math.floor(v * 0.80);
      img.data[i + 1] = Math.min(255, v + 22); // tint verde — sinal corrompido
      img.data[i + 2] = Math.floor(v * 0.72);
      const r = Math.random();
      img.data[i + 3] = r < 0.56 ? 0 : Math.floor(((r - 0.56) / 0.44) * maxA);
    }
    pctx.putImageData(img, 0, 0);
    return ctx.createPattern(pc, "repeat");
  });
}

// ─── TIPOS INTERNOS ───────────────────────────────────────────────────────────

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

interface Props {
  intensity?: Intensity;
  className?: string;
}

export function InteractiveNoiseBackground({
  intensity = "medium",
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cfg          = CONFIGS[intensity];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile      = window.matchMedia("(pointer: coarse)").matches;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Grain patterns ────────────────────────────────────────────────────────
    const grainPatterns   = buildGrainPatterns(ctx, cfg.grainBaseMaxA);
    const disruptPatterns = isMobile ? [] : buildDisruptPatterns(ctx, cfg.disruptMaxA);

    // ── Offscreen canvas para disruption grain mascarado ──────────────────────
    const offCanvas = document.createElement("canvas");
    const offCtx    = offCanvas.getContext("2d");

    // ── Dimensões CSS ─────────────────────────────────────────────────────────
    let cW = 0, cH = 0;

    // ── Loop state ────────────────────────────────────────────────────────────
    let rafId    = 0;
    let running  = true;
    let frame    = 0;
    let lastTime = performance.now();

    // ── Grain cycling ─────────────────────────────────────────────────────────
    let grainIdx   = 0;
    let disruptIdx = 0;

    // ── Campo de cursor ───────────────────────────────────────────────────────
    let targetMouse = { x: -1, y: -1 };
    let smoothMouse = { x: -1, y: -1 };
    let prevSmooth  = { x: -1, y: -1 };
    let mouseInSection = false;
    let fieldAlpha     = 0;

    // ── Ripples ───────────────────────────────────────────────────────────────
    const ripples: Ripple[] = [];
    let lastRippleTime = 0;

    // ── Interferência atmosférica ─────────────────────────────────────────────
    const scanLines: ScanLine[] = [];
    let nextScanIn = reducedMotion
      ? Infinity
      : cfg.ifMinDelay + Math.random() * (cfg.ifMaxDelay - cfg.ifMinDelay);

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
      offCanvas.width  = Math.ceil(cW);
      offCanvas.height = Math.ceil(cH);
    }

    // ── Mouse handlers ────────────────────────────────────────────────────────
    function onMouseMove(e: MouseEvent) {
      if (isMobile) return;
      const rect = canvas!.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      targetMouse    = { x, y };
      mouseInSection = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
    }

    function onDocMouseLeave() {
      mouseInSection = false;
    }

    // ── DRAW 1: Grid ──────────────────────────────────────────────────────────
    function drawGrid() {
      const CELL   = 52;
      const radius = Math.max(cW, cH) * 0.26;
      const boost  = isMobile ? 0 : cfg.gridBoost * fieldAlpha;

      ctx!.lineWidth = 0.5;

      for (let x = 0; x <= cW + CELL; x += CELL) {
        const dist  = smoothMouse.x >= 0 ? Math.abs(x - smoothMouse.x) : radius + 1;
        const alpha = cfg.gridBase + boost * Math.max(0, 1 - dist / radius);
        ctx!.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${alpha.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, cH);
        ctx!.stroke();
      }

      for (let y = 0; y <= cH + CELL; y += CELL) {
        const dist  = smoothMouse.y >= 0 ? Math.abs(y - smoothMouse.y) : radius + 1;
        const alpha = cfg.gridBase + boost * Math.max(0, 1 - dist / radius);
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

    // ── DRAW 3: Cursor field — haze + scanlines CRT ───────────────────────────
    function drawCursorField(now: number) {
      if (fieldAlpha <= 0 || smoothMouse.x < 0) return;
      const mx = smoothMouse.x, my = smoothMouse.y;
      const R  = Math.min(cW, cH) * cfg.fieldRadius;
      const fa = fieldAlpha;

      // Haze radial
      const haze = ctx!.createRadialGradient(mx, my, 0, mx, my, R);
      haze.addColorStop(0,    `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${(cfg.hazeCenter * fa).toFixed(3)})`);
      haze.addColorStop(0.22, `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${(cfg.hazeMid    * fa).toFixed(3)})`);
      haze.addColorStop(0.60, `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${(cfg.hazeOuter  * fa).toFixed(3)})`);
      haze.addColorStop(1,    `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0)`);
      ctx!.save();
      ctx!.fillStyle = haze;
      ctx!.fillRect(0, 0, cW, cH);
      ctx!.restore();

      // Scanlines CRT com drift lento para baixo
      const SPACING = 4;
      const drift   = (now * 0.038) % SPACING;
      const yStart  = Math.max(0,  my - R);
      const yEnd    = Math.min(cH, my + R);
      const yFirst  = yStart - ((yStart - drift) % SPACING + SPACING) % SPACING + SPACING;

      ctx!.save();
      ctx!.lineWidth = 0.5;
      for (let y = yFirst; y <= yEnd; y += SPACING) {
        const dy = Math.abs(y - my);
        if (dy >= R) continue;
        const chord = Math.sqrt(R * R - dy * dy);
        const a     = fa * cfg.scanlineMax * (1 - dy / R) * (1 - dy / R);
        if (a < 0.002) continue;
        ctx!.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${a.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.moveTo(Math.max(0, mx - chord), y);
        ctx!.lineTo(Math.min(cW, mx + chord), y);
        ctx!.stroke();
      }
      ctx!.restore();

      // Anel de borda (opcional por intensidade)
      if (cfg.showFieldEdge) {
        ctx!.save();
        ctx!.beginPath();
        ctx!.arc(mx, my, R, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${(cfg.edgeAlpha * fa).toFixed(3)})`;
        ctx!.lineWidth = 0.5;
        ctx!.stroke();
        ctx!.restore();
      }
    }

    // ── DRAW 4: Disruption grain (offscreen, mascarado) ───────────────────────
    function drawCursorGrain() {
      if (!offCtx || fieldAlpha <= 0 || smoothMouse.x < 0 || disruptPatterns.length === 0) return;

      const mx = smoothMouse.x, my = smoothMouse.y;
      const R  = Math.min(cW, cH) * cfg.fieldRadius;

      offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
      const pat = disruptPatterns[disruptIdx];
      if (pat) {
        offCtx.fillStyle = pat;
        offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);
      }

      // Máscara radial suave: mantém apenas a área do campo
      offCtx.globalCompositeOperation = "destination-in";
      const mask = offCtx.createRadialGradient(mx, my, 0, mx, my, R);
      mask.addColorStop(0,    "rgba(0,0,0,1)");
      mask.addColorStop(0.40, "rgba(0,0,0,0.95)");
      mask.addColorStop(0.72, "rgba(0,0,0,0.50)");
      mask.addColorStop(0.90, "rgba(0,0,0,0.12)");
      mask.addColorStop(1,    "rgba(0,0,0,0)");
      offCtx.fillStyle = mask;
      offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);
      offCtx.globalCompositeOperation = "source-over";

      ctx!.save();
      ctx!.globalAlpha = fieldAlpha * 0.9;
      ctx!.drawImage(offCanvas, 0, 0, cW, cH);
      ctx!.restore();
    }

    // ── DRAW 5: Interferência atmosférica ─────────────────────────────────────
    function drawInterference(dt: number) {
      nextScanIn -= dt;
      if (nextScanIn <= 0 && scanLines.length < 2) {
        spawnScanLine();
        nextScanIn = cfg.ifMinDelay + Math.random() * (cfg.ifMaxDelay - cfg.ifMinDelay);
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

    // ── DRAW 6: Ripples ───────────────────────────────────────────────────────
    function updateAndDrawRipples(now: number) {
      if (smoothMouse.x >= 0 && prevSmooth.x >= 0 && fieldAlpha > 0.12 && ripples.length < 5) {
        const vx  = smoothMouse.x - prevSmooth.x;
        const vy  = smoothMouse.y - prevSmooth.y;
        const vel = Math.sqrt(vx * vx + vy * vy);
        if (vel > 3.5 && now - lastRippleTime > 160) {
          const R = Math.min(cW, cH) * cfg.fieldRadius;
          ripples.push({
            x: smoothMouse.x, y: smoothMouse.y,
            radius: 0, maxRadius: R * 0.62,
            born: now, duration: 850,
          });
          lastRippleTime = now;
        }
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r        = ripples[i];
        const progress = (now - r.born) / r.duration;
        if (progress >= 1) { ripples.splice(i, 1); continue; }

        r.radius = r.maxRadius * Math.pow(progress, 0.52);
        const a  = fieldAlpha * cfg.rippleAlpha * (1 - progress) * (1 - progress);
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

      // Atualizar smooth mouse e fieldAlpha
      if (mouseInSection && targetMouse.x >= 0) {
        const LERP = 0.10;
        if (smoothMouse.x < 0) {
          smoothMouse = { ...targetMouse };
          prevSmooth  = { ...targetMouse };
        } else {
          prevSmooth  = { ...smoothMouse };
          smoothMouse.x += (targetMouse.x - smoothMouse.x) * LERP;
          smoothMouse.y += (targetMouse.y - smoothMouse.y) * LERP;
        }
        fieldAlpha = Math.min(1, fieldAlpha + dt * 0.0033); // fade-in ~300ms
      } else {
        prevSmooth = { x: -1, y: -1 };
        fieldAlpha = Math.max(0, fieldAlpha - dt * 0.0017); // fade-out ~600ms
        if (fieldAlpha <= 0) smoothMouse = { x: -1, y: -1 };
      }

      // Avançar grain
      if (frame % 3 === 0) grainIdx   = (grainIdx   + 1) % PATCH_COUNT;
      if (frame % 2 === 0) disruptIdx = (disruptIdx + 1) % DISRUPT_COUNT;

      ctx!.clearRect(0, 0, cW, cH);

      // 1. Grid
      drawGrid();

      // 2. Base grain
      const grainFreq = isMobile ? 6 : 1;
      if (frame % grainFreq === 0) drawGrain();

      if (!isMobile) {
        // 3. Haze + scanlines do cursor
        drawCursorField(now);
        // 4. Disruption grain (offscreen, a cada 2 frames)
        if (frame % 2 === 0) drawCursorGrain();
      }

      // 5. Interferência atmosférica
      if (!reducedMotion) drawInterference(dt);

      // 6. Ripples
      if (!isMobile && !reducedMotion) updateAndDrawRipples(now);
    }

    // ── Bootstrap ─────────────────────────────────────────────────────────────
    resize();
    window.addEventListener("resize",      resize);
    window.addEventListener("mousemove",   onMouseMove);
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
      window.removeEventListener("resize",      resize);
      window.removeEventListener("mousemove",   onMouseMove);
      document.removeEventListener("mouseleave", onDocMouseLeave);
      io.disconnect();
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}
