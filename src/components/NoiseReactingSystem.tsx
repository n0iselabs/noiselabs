import { useEffect, useRef } from "react";

const ACCENT = { r: 170, g: 255, b: 0 };
const DPR_CAP = 2;

function noise2d(x: number, y: number, t: number): number {
  return (
    Math.sin(x * 0.8 + t) * 0.5 +
    Math.sin(y * 0.6 + t * 1.3) * 0.3 +
    Math.sin((x + y) * 0.4 + t * 0.7) * 0.2
  );
}

export function NoiseReactingSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    const GRID = isMobile ? 7 : 13;
    const WAVE_COUNT = isMobile ? 1 : 2;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let running = true;
    let startTime = performance.now();
    let mouse = { x: -999, y: -999 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onMouseMove(e: MouseEvent) {
      if (isMobile) return;
      const rect = canvas!.getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function draw(now: number) {
      if (!running) return;
      rafId = requestAnimationFrame(draw);

      const t = reducedMotion ? 0 : (now - startTime) / 1000;
      const W = canvas!.getBoundingClientRect().width;
      const H = canvas!.getBoundingClientRect().height;

      ctx!.clearRect(0, 0, W, H);

      const cellW = W / (GRID - 1);
      const cellH = H / (GRID - 1);

      // Wave lines
      for (let w = 0; w < WAVE_COUNT; w++) {
        const phaseOffset = w * Math.PI;
        ctx!.beginPath();
        for (let px = 0; px <= W; px += 2) {
          const nx = px / W;
          const amplitude = H * 0.08;
          const py =
            H * 0.5 +
            Math.sin(nx * Math.PI * 3 + t * 0.8 + phaseOffset) * amplitude +
            Math.sin(nx * Math.PI * 7 + t * 1.4 + phaseOffset) * amplitude * 0.4;
          px === 0 ? ctx!.moveTo(px, py) : ctx!.lineTo(px, py);
        }
        const wAlpha = w === 0 ? 0.18 : 0.09;
        ctx!.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${wAlpha})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      // Node grid
      for (let gy = 0; gy < GRID; gy++) {
        for (let gx = 0; gx < GRID; gx++) {
          const px = gx * cellW;
          const py = gy * cellH;
          const n = noise2d(gx * 0.5, gy * 0.5, t);

          // Cursor influence
          const dx = px - mouse.x;
          const dy = py - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.max(0, 1 - dist / (W * 0.35));

          const baseOpacity = 0.08 + n * 0.06;
          const opacity = Math.min(0.75, baseOpacity + influence * 0.55);
          const radius = 1 + influence * 2.5;

          ctx!.beginPath();
          ctx!.arc(px, py, radius, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${opacity})`;
          ctx!.fill();
        }
      }

      // Cursor hotspot
      if (!isMobile && mouse.x > 0) {
        const grad = ctx!.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, W * 0.25);
        grad.addColorStop(0, `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0.06)`);
        grad.addColorStop(1, `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0)`);
        ctx!.fillStyle = grad;
        ctx!.fillRect(0, 0, W, H);
      }
    }

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running) {
          startTime = performance.now() - startTime;
          rafId = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.1 }
    );
    io.observe(canvas);

    window.addEventListener("mousemove", onMouseMove);
    rafId = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
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
