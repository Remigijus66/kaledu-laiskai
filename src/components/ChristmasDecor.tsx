import { useMemo, type CSSProperties } from 'react'

// Kalėdinės dekoracijos laiško puslapiui. Viskas tik vaizdinė (aria-hidden) ir nereaguoja į pelę.

/** Krentantis sniegas. Atsitiktinės reikšmės parenkamos vieną kartą, kad perpiešiant sniegas nešokinėtų. */
export function Snow({ count = 36 }: { count?: number }) {
  const flakes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        size: 8 + Math.random() * 14,
        duration: 9 + Math.random() * 11,
        delay: -Math.random() * 20, // neigiama, kad sniegas iškart būtų visame ekrane
        sway: 12 + Math.random() * 28,
        glyph: i % 4 === 0 ? '❄' : '•',
      })),
    [count],
  )

  return (
    <div className="snow" aria-hidden="true">
      {flakes.map((f, i) => (
        <span
          key={i}
          className="flake"
          style={
            {
              left: `${f.left}%`,
              fontSize: `${f.size}px`,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
              '--sway': `${f.sway}px`,
            } as CSSProperties
          }
        >
          {f.glyph}
        </span>
      ))}
    </div>
  )
}

const BULB_COLORS = ['#e53935', '#ffd54f', '#43a047', '#fff8e1']

/** Girlianda su mirksinčiomis lemputėmis puslapio viršuje. */
export function Garland() {
  return (
    <div className="garland" aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => (
        <span key={i} className="garland-seg">
          <span
            className="garland-bulb"
            style={{ '--c': BULB_COLORS[i % BULB_COLORS.length], '--d': `${(i * 0.43) % 2.4}s` } as CSSProperties}
          />
        </span>
      ))}
    </div>
  )
}

/** Bruknės (holly) šakelė su uogomis; dešinė pusė gaunama atspindint CSS. */
export function Holly({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 140 100" aria-hidden="true">
      <defs>
        <path
          id="holly-leaf"
          d="M70 58 C 58 40 40 38 30 44 C 26 36 14 34 6 40 C 10 46 6 54 2 58 C 10 62 8 72 6 80
             C 18 78 26 82 30 90 C 40 82 50 80 58 82 C 64 74 68 66 70 58 Z"
        />
      </defs>
      <g fill="#1b7a4f" stroke="#0a3a28" strokeWidth="2" strokeLinejoin="round">
        <use href="#holly-leaf" />
        <use href="#holly-leaf" transform="translate(140 0) scale(-1 1)" />
      </g>
      <g stroke="#0a3a28" strokeWidth="1.5" fill="none" strokeLinecap="round">
        <path d="M70 58 C 52 56 32 58 14 62" />
        <path d="M70 58 C 88 56 108 58 126 62" />
      </g>
      <g fill="#d32f2f" stroke="#7f1313" strokeWidth="1.5">
        <circle cx="62" cy="56" r="8" />
        <circle cx="78" cy="58" r="8" />
        <circle cx="70" cy="68" r="8" />
      </g>
      <g fill="#fff" opacity="0.75">
        <circle cx="59" cy="53" r="2" />
        <circle cx="75" cy="55" r="2" />
        <circle cx="67" cy="65" r="2" />
      </g>
    </svg>
  )
}
