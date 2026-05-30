// Camada de glow verde — pura CSS/div, GPU composited via will-change.
// Dois gradientes radiais que "respiram" em ciclos lentos e desfasados,
// criando profundidade e a sensação de sistema vivo.

export function HeroGlowLayer() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Glow primário — canto superior direito, ciclo 9s */}
      <div
        className="hero-glow-primary absolute"
        style={{
          top: "-15%",
          right: "-8%",
          width: "75%",
          height: "90%",
          background:
            "radial-gradient(ellipse at 60% 40%, rgba(170,255,0,0.075) 0%, rgba(170,255,0,0.02) 45%, transparent 70%)",
          willChange: "transform, opacity",
        }}
      />
      {/* Glow secundário — centro esquerdo inferior, ciclo 13s desfasado */}
      <div
        className="hero-glow-secondary absolute"
        style={{
          bottom: "-10%",
          left: "5%",
          width: "55%",
          height: "65%",
          background:
            "radial-gradient(ellipse at 40% 60%, rgba(170,255,0,0.038) 0%, rgba(170,255,0,0.008) 50%, transparent 72%)",
          willChange: "transform, opacity",
        }}
      />
      {/* Glow de chão — faixa horizontal muito suave no centro */}
      <div
        className="hero-glow-floor absolute"
        style={{
          top: "35%",
          left: "0",
          right: "0",
          height: "30%",
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(170,255,0,0.022) 0%, transparent 65%)",
          willChange: "opacity",
        }}
      />
    </div>
  );
}
