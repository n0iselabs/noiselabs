// Signal — cabeça fiel ao mascote de referência, cores trocadas para identidade Noise Labs
// Modelo original: robô com dois bumps de antena, cabeça arredondada, olhos circulares
// Adaptação: #AAFF00 no lugar do preto, olhos #0A0A0A no lugar do branco

import type { CSSProperties } from "react";

interface SignalHeadProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
  headFill?: string;
  eyeFill?: string;
  antennaFill?: string;
}

export function SignalHead({
  size = 44,
  className = "",
  style,
  headFill = "#AAFF00",
  eyeFill = "#0A0A0A",
  antennaFill = "#AAFF00",
}: SignalHeadProps) {
  return (
    <svg
      viewBox="0 0 92 72"
      width={size}
      height={Math.round(size * (72 / 92))}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/* Antenas — palitos finos acima dos bumps laterais */}
      <rect x="4"  y="0" width="4" height="18" fill={antennaFill} />
      <rect x="84" y="0" width="4" height="18" fill={antennaFill} />

      {/* Bumps laterais (orelhas) */}
      <rect x="1"  y="18" width="10" height="16" rx="4" fill={antennaFill} />
      <rect x="81" y="18" width="10" height="16" rx="4" fill={antennaFill} />

      {/* Cabeça — retangular, levemente mais alta */}
      <rect x="10" y="10" width="72" height="53" rx="16" fill={headFill} />

      {/* Animação de piscar */}
      <style>{`
        .signal-eye {
          transform-box: fill-box;
          transform-origin: center;
          animation: signal-blink 3.5s ease-in-out infinite;
        }
        @keyframes signal-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          94%           { transform: scaleY(0.08); }
        }
      `}</style>

      {/* Olhos circulares com animação */}
      <circle className="signal-eye" cx="30" cy="33" r="11" fill={eyeFill} />
      <circle className="signal-eye" cx="62" cy="33" r="11" fill={eyeFill} />
    </svg>
  );
}
