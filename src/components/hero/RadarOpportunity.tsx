import { useEffect, useRef, useState } from "react";

// Pin no radar: 315° a partir da direita, raio ~70% do container
const DOT_L    = "74.75%";  // (200 + 140*cos315°) / 400
const DOT_T    = "25.25%";  // (200 + 140*sin315°) / 400
const PIN_ANGLE = 315;       // graus no sistema CSS (horário, a partir do topo)
// — nota: o feixe aponta para 90° (direita) no frame 0,
//   logo 315° é o equivalente a 225° de rotação + 90° de offset
// Em termos de rAF: o ângulo acumulado cruza PIN_ANGLE quando
//   (totalAngle % 360) ultrapassa 315.

const BEAM_MS = 3000; // 1 volta completa

function PulseRing({ delay = 0 }: { delay?: number }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setActive(true), delay + 30);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: 8, height: 8,
        left: DOT_L, top: DOT_T,
        border: "1.5px solid #AAFF00",
        transform: `translate(-50%, -50%) scale(${active ? 9 : 1})`,
        opacity: active ? 0 : 0.65,
        transition: "transform 1.1s ease-out, opacity 1.1s ease-out",
      }}
    />
  );
}

export function RadarOpportunity() {
  const beamRef        = useRef<HTMLDivElement>(null);
  const t0Ref          = useRef<number | null>(null);
  const prevTotalRef   = useRef(0);
  const hasDetectedRef = useRef(false);

  const [hasDetected, setHasDetected] = useState(false);
  const [pulseKey,    setPulseKey]    = useState(0);
  const [pinFlash,    setPinFlash]    = useState(false);

  // ── rAF: rotação + detecção por ângulo ─────────────────────────────────────
  // A cada frame, calcula o ângulo acumulado (não modular) e detecta
  // cruzamentos de PIN_ANGLE. Garante sincronismo perfeito entre linha e eventos.
  useEffect(() => {
    let rafId: number;
    let flashTimer: ReturnType<typeof setTimeout>;

    function tick(ts: number) {
      if (t0Ref.current === null) t0Ref.current = ts;

      const total    = ((ts - t0Ref.current) / BEAM_MS) * 360; // ângulo total acumulado
      const prevTotal = prevTotalRef.current;

      // Cruzamento: quantas vezes o ângulo acumulado passou por PIN_ANGLE
      const prevCross = Math.floor((prevTotal  - PIN_ANGLE) / 360);
      const currCross = Math.floor((total      - PIN_ANGLE) / 360);

      if (currCross > prevCross) {
        // Linha acabou de passar pelo pin
        setPulseKey(k => k + 1);

        if (!hasDetectedRef.current) {
          // Primeira detecção — pin e badge aparecem e ficam permanentes
          hasDetectedRef.current = true;
          setHasDetected(true);
        } else {
          // Passagens seguintes — pin pulsa brevemente
          setPinFlash(true);
          clearTimeout(flashTimer);
          flashTimer = setTimeout(() => setPinFlash(false), 380);
        }
      }

      prevTotalRef.current = total;
      if (beamRef.current) {
        beamRef.current.style.transform = `rotate(${total % 360}deg)`;
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(flashTimer);
    };
  }, []);

  // Pulso do pin na primeira detecção
  useEffect(() => {
    if (!hasDetected) return;
    setPinFlash(true);
    const t = setTimeout(() => setPinFlash(false), 380);
    return () => clearTimeout(t);
  }, [hasDetected]);

  return (
    <div
      aria-hidden="true"
      className="relative w-full max-w-[420px] mx-auto select-none pointer-events-none overflow-hidden rounded-full"
      style={{ aspectRatio: "1 / 1" }}
    >
      {/* Grid sutil */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      {/* Glow central */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% 50%, rgba(170,255,0,0.05) 0%, transparent 60%)",
      }} />

      {/* Anéis concêntricos */}
      {[21, 42, 63, 84].map(pct => (
        <div key={pct} className="absolute rounded-full" style={{
          width: `${pct}%`, height: `${pct}%`,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          border: "0.8px solid rgba(170,255,0,0.065)",
        }} />
      ))}

      {/* Anel externo tracejado */}
      <div className="absolute rounded-full" style={{
        width: "84%", height: "84%",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        border: "1px dashed rgba(170,255,0,0.10)",
      }} />

      {/* Crosshairs */}
      <div className="absolute" style={{ top: "50%", left: "8%", right: "8%", height: 1, background: "rgba(170,255,0,0.03)", transform: "translateY(-50%)" }} />
      <div className="absolute" style={{ left: "50%", top: "8%", bottom: "8%", width: 1, background: "rgba(170,255,0,0.03)", transform: "translateX(-50%)" }} />

      {/* Centro */}
      <div className="absolute rounded-full bg-[#AAFF00]" style={{ width: 4, height: 4, top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.4 }} />

      {/* ── FEIXE: rastro cônico + linha num único wrapper rotativo ────────── */}
      <div
        ref={beamRef}
        className="absolute inset-0"
        style={{ transformOrigin: "center center" }}
      >
        {/* Rastro: brilha de 68° até 90° (justo atrás da linha em 90°) */}
        <div className="absolute inset-0" style={{
          background: "conic-gradient(from 68deg at 50% 50%, transparent 0deg, rgba(170,255,0,0.055) 22deg)",
        }} />
        {/* Linha de varredura */}
        <div className="absolute" style={{
          top: "50%", left: "50%",
          width: "50%", height: "1.5px",
          transform: "translateY(-50%)",
          background: "linear-gradient(to right, rgba(170,255,0,0.88) 0%, rgba(170,255,0,0.08) 100%)",
          boxShadow: "0 0 4px rgba(170,255,0,0.28)",
        }} />
        {/* Ponta */}
        <div className="absolute rounded-full bg-[#AAFF00]" style={{
          width: 5, height: 5,
          top: "50%", left: "calc(100% - 2.5px)",
          transform: "translateY(-50%)",
          opacity: 0.48,
        }} />
      </div>
      {/* ─────────────────────────────────────────────────────────────────── */}

      {/* Dot (discreto antes da detecção, some depois) */}
      <div className="absolute rounded-full bg-[#AAFF00]" style={{
        width: 6, height: 6,
        left: DOT_L, top: DOT_T,
        transform: "translate(-50%, -50%)",
        opacity: hasDetected ? 0 : 0.18,
        transition: "opacity 0.3s ease",
      }} />

      {/* Anéis de pulso — remontados a cada cruzamento */}
      {pulseKey > 0 && <PulseRing key={`a${pulseKey}`} />}
      {pulseKey > 0 && <PulseRing key={`b${pulseKey}`} delay={380} />}

      {/* Pin — permanente após primeira detecção, pulsa a cada passagem */}
      <div
        className="absolute flex flex-col items-center"
        style={{
          left: DOT_L, top: DOT_T,
          transform: "translate(-50%, -100%)",
          paddingBottom: 2,
          opacity: hasDetected ? 1 : 0,
          transition: "opacity 0.45s ease",
        }}
      >
        <div
          className="w-5 h-5 rounded-full bg-[#AAFF00] flex items-center justify-center"
          style={{
            transform: `scale(${pinFlash ? 1.28 : 1})`,
            boxShadow: pinFlash
              ? "0 0 16px rgba(170,255,0,0.70)"
              : "0 0 8px rgba(170,255,0,0.40)",
            transition: "transform 0.18s ease, box-shadow 0.18s ease",
          }}
        >
          <div className="w-2 h-2 rounded-full bg-[#0A0A0A]" />
        </div>
        <div style={{
          width: 0, height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "9px solid #AAFF00",
          marginTop: -2,
        }} />
      </div>

      {/* Badge — aparece na primeira detecção e fica permanente */}
      <div
        className="absolute"
        style={{
          left: "12%", top: "63%",
          opacity: hasDetected ? 1 : 0,
          transform: `translateY(${hasDetected ? 0 : 6}px)`,
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <div style={{
          background: "rgba(8,8,8,0.93)",
          border: "1px solid rgba(170,255,0,0.18)",
          borderRadius: "5px",
          padding: "9px 13px",
          whiteSpace: "nowrap",
        }}>
          <div style={{
            fontSize: "10px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "#AAFF00",
            marginBottom: "5px",
          }}>
            Oportunidade localizada
          </div>
          <div style={{
            fontSize: "9px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            color: "#9CA3AF",
            lineHeight: 1.4,
          }}>
            Negócio local pronto para crescer
          </div>
        </div>
      </div>
    </div>
  );
}
