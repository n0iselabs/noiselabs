// Signal — mascote canônico frontal da Noise Labs
// Paleta: #AAFF00 corpo · #FFFFFF olhos e onda · fundo externo #0A0A0A
// Geometria: retângulos + triângulos — zero curvas orgânicas

interface SignalMascotProps {
  size?: number;
  className?: string;
}

export function SignalMascot({ size = 140, className = "" }: SignalMascotProps) {
  return (
    <svg
      viewBox="0 0 140 192"
      width={size}
      height={Math.round(size * (192 / 140))}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Onda senoidal — 2 ciclos emanando da ponta da antena para a direita */}
      <path
        d="M 70 12 C 73 4,77 4,80 12 C 83 20,87 20,90 12 C 93 4,97 4,100 12 C 103 20,107 20,110 12"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
      />

      {/* Antena — haste vertical */}
      <rect x="68.5" y="12" width="3" height="28" fill="#AAFF00" />

      {/* Cabeça — levemente mais alta que larga */}
      <rect x="48" y="40" width="44" height="50" fill="#AAFF00" />

      {/* Olhos — dois retângulos brancos horizontais */}
      <rect x="56" y="53" width="12" height="7" fill="#FFFFFF" />
      <rect x="72" y="53" width="12" height="7" fill="#FFFFFF" />

      {/* Pescoço — 2px de gap do bloco da cabeça */}
      <rect x="64" y="92" width="12" height="8" fill="#AAFF00" />

      {/* Corpo */}
      <rect x="44" y="102" width="52" height="44" fill="#AAFF00" />

      {/* Braço esquerdo — forma em L angular */}
      <rect x="18" y="105" width="26" height="10" fill="#AAFF00" />
      <rect x="18" y="115" width="10" height="24" fill="#AAFF00" />

      {/* Braço direito — forma em L angular */}
      <rect x="96" y="105" width="26" height="10" fill="#AAFF00" />
      <rect x="112" y="115" width="10" height="24" fill="#AAFF00" />

      {/* Perna esquerda */}
      <rect x="54" y="148" width="14" height="38" fill="#AAFF00" />

      {/* Perna direita */}
      <rect x="72" y="148" width="14" height="38" fill="#AAFF00" />
    </svg>
  );
}
