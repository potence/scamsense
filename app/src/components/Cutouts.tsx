// Paper cutouts: small flat illustrations that look cut from paper and stuck on the page.
// Each piece is drawn twice: once as a thick white edge (roughened by a turbulence filter so the
// cut looks hand-made) and once on top in colour. CSS (.cutout) adds the tilt and soft shadow.
// They are decoration only (aria-hidden): every one sits next to words that say the same thing.
import { useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';

const NAVY = '#0A1A4A';
const COBALT = '#1B3FA0';
const SKY = '#BFDDF8';
const SKY_LIGHT = '#DCEBFA';
const SKY_DEEP = '#8FC1F0';
const WHITE = '#ffffff';

// The drawings, all on a 120 x 120 grid with room around them for the white edge.
const ART = {
  // A phone with a suspicious text bubble.
  phone: (
    <>
      <rect x="30" y="18" width="50" height="86" rx="10" fill={NAVY} />
      <rect x="35" y="27" width="40" height="66" rx="4" fill={SKY_LIGHT} />
      <rect x="49" y="97" width="12" height="3" rx="1.5" fill={SKY_DEEP} />
      <path d="M58 34h44a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H78l-10 9 2-9h-12a8 8 0 0 1-8-8V42a8 8 0 0 1 8-8z" fill={WHITE} />
      <rect x="60" y="44" width="36" height="5" rx="2.5" fill={COBALT} />
      <rect x="60" y="54" width="26" height="5" rx="2.5" fill={SKY_DEEP} />
      <circle cx="98" cy="56.5" r="4" fill={COBALT} />
    </>
  ),
  envelope: (
    <>
      <rect x="14" y="32" width="92" height="62" rx="6" fill={WHITE} />
      <path d="M14 38l46 30 46-30v-0a6 6 0 0 0-6-6H20a6 6 0 0 0-6 6z" fill={SKY} />
      <path d="M16 90l34-26M104 90L70 64" stroke={SKY_DEEP} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M14 38l46 30 46-30" stroke={COBALT} strokeWidth="4" strokeLinejoin="round" fill="none" />
      <circle cx="60" cy="68" r="7" fill={NAVY} />
    </>
  ),
  magnifier: (
    <>
      <path d="M74 74l26 26" stroke={NAVY} strokeWidth="14" strokeLinecap="round" />
      <circle cx="52" cy="52" r="34" fill={SKY_LIGHT} stroke={NAVY} strokeWidth="9" />
      <path d="M34 44a20 20 0 0 1 16-14" stroke={WHITE} strokeWidth="6" strokeLinecap="round" fill="none" />
    </>
  ),
  // An eight-sided sign with a bar across: "stop".
  stop: (
    <>
      <path d="M42 10h36l32 32v36l-32 32H42L10 78V42z" fill={COBALT} />
      <path d="M45 18h30l27 27v30l-27 27H45L18 75V45z" fill="none" stroke={WHITE} strokeWidth="4" />
      <rect x="32" y="52" width="56" height="16" rx="4" fill={WHITE} />
    </>
  ),
  // A handset with a "no" circle across it: "block".
  blocked: (
    <>
      <path d="M30 30c6-6 14-6 18 0l8 12c3 5 1 10-4 13l-5 3c4 10 10 16 20 20l3-5c3-5 8-7 13-4l12 8c6 4 6 12 0 18l-6 6c-8 8-30 2-48-16S16 44 24 36z" fill={NAVY} />
      <circle cx="60" cy="60" r="44" fill="none" stroke={COBALT} strokeWidth="9" />
      <path d="M29 29l62 62" stroke={COBALT} strokeWidth="9" strokeLinecap="round" />
    </>
  ),
  handset: (
    <>
      <path d="M30 26c6-6 14-6 18 0l9 13c3 5 1 10-4 13l-6 4c4 11 11 18 22 22l4-6c3-5 8-7 13-4l13 9c6 4 6 12 0 18l-7 7c-9 9-32 2-51-17S17 41 26 32z" fill={NAVY} />
      <path d="M72 18a30 30 0 0 1 30 30M72 32a16 16 0 0 1 16 16" stroke={COBALT} strokeWidth="6" strokeLinecap="round" fill="none" />
    </>
  ),
  browser: (
    <>
      <rect x="10" y="20" width="100" height="80" rx="8" fill={WHITE} />
      <path d="M10 28a8 8 0 0 1 8-8h84a8 8 0 0 1 8 8v12H10z" fill={COBALT} />
      <circle cx="21" cy="30" r="3" fill={SKY_LIGHT} />
      <circle cx="31" cy="30" r="3" fill={SKY_LIGHT} />
      <rect x="40" y="25" width="62" height="10" rx="5" fill={SKY_LIGHT} />
      <rect x="20" y="50" width="50" height="7" rx="3.5" fill={NAVY} />
      <rect x="20" y="64" width="80" height="5" rx="2.5" fill={SKY_DEEP} />
      <rect x="20" y="75" width="64" height="5" rx="2.5" fill={SKY_DEEP} />
      <rect x="20" y="86" width="30" height="7" rx="3.5" fill={COBALT} />
    </>
  ),
  qr: (
    <>
      <rect x="16" y="16" width="88" height="88" rx="8" fill={WHITE} />
      {[
        [24, 24],
        [72, 24],
        [24, 72],
      ].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <rect x={x} y={y} width="24" height="24" rx="3" fill={NAVY} />
          <rect x={x + 5} y={y + 5} width="14" height="14" rx="2" fill={WHITE} />
          <rect x={x + 8} y={y + 8} width="8" height="8" rx="1" fill={NAVY} />
        </g>
      ))}
      <path d="M54 24h8v8h-8zM54 40h8v8h-8zM62 56h8v8h-8zM78 56h8v8h-8zM54 64h8v8h-8zM70 72h8v8h-8zM86 80h8v8h-8zM54 88h8v8h-8zM70 88h8v8h-8zM24 56h8v8h-8zM40 56h8v8h-8z" fill={COBALT} />
    </>
  ),
  // A pop-up window with a warning triangle.
  popup: (
    <>
      <rect x="12" y="22" width="96" height="76" rx="8" fill={WHITE} />
      <path d="M12 30a8 8 0 0 1 8-8h80a8 8 0 0 1 8 8v8H12z" fill={NAVY} />
      <path d="M94 26l6 6M100 26l-6 6" stroke={SKY_LIGHT} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M60 46l20 34H40z" fill={SKY} stroke={COBALT} strokeWidth="5" strokeLinejoin="round" />
      <rect x="57.5" y="56" width="5" height="13" rx="2.5" fill={NAVY} />
      <circle cx="60" cy="74" r="3" fill={NAVY} />
    </>
  ),
  // A payment card with a chip and stripe.
  card: (
    <>
      <rect x="14" y="28" width="92" height="64" rx="8" fill={WHITE} />
      <rect x="14" y="40" width="92" height="14" fill={NAVY} />
      <rect x="24" y="62" width="22" height="18" rx="4" fill={SKY} stroke={COBALT} strokeWidth="3" />
      <rect x="54" y="68" width="38" height="6" rx="3" fill={SKY_DEEP} />
    </>
  ),
  // An official agency shield badge.
  shield: (
    <>
      <path d="M60 16l38 14v30c0 28-22 40-38 46-16-6-38-18-38-46V30z" fill={COBALT} />
      <path d="M60 26l28 10v22c0 20-16 30-28 35-12-5-28-15-28-35V36z" fill={WHITE} />
      <path d="M60 36l18 6v14c0 13-10 20-18 23-8-3-18-10-18-23V42z" fill={NAVY} />
      <circle cx="60" cy="56" r="6" fill={SKY_LIGHT} />
    </>
  ),
  // A prize gift box with ribbon.
  gift: (
    <>
      <rect x="20" y="44" width="80" height="56" rx="6" fill={WHITE} />
      <rect x="14" y="32" width="92" height="16" rx="4" fill={COBALT} />
      <rect x="52" y="32" width="16" height="68" fill={NAVY} />
      <path d="M42 22c-8-12-22-2-12 10l22 0M78 22c8-12 22-2 12 10l-22 0" fill="none" stroke={COBALT} strokeWidth="6" strokeLinecap="round" />
    </>
  ),
  // A shopping tote bag with handles.
  bag: (
    <>
      <rect x="22" y="38" width="76" height="66" rx="8" fill={WHITE} />
      <path d="M22 38h76v12H22z" fill={SKY} />
      <path d="M42 42V26a18 18 0 0 1 36 0v16" fill="none" stroke={NAVY} strokeWidth="7" strokeLinecap="round" />
      <circle cx="60" cy="68" r="12" fill={COBALT} />
      <circle cx="60" cy="68" r="6" fill={WHITE} />
    </>
  ),
  // A brass security key.
  key: (
    <>
      <circle cx="44" cy="48" r="24" fill={WHITE} stroke={NAVY} strokeWidth="8" />
      <circle cx="44" cy="48" r="10" fill={SKY_LIGHT} />
      <path d="M64 56l36 36M84 76l8-8M92 84l8-8" stroke={NAVY} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // Friendly conversation bubbles between strangers.
  chat: (
    <>
      <rect x="16" y="24" width="64" height="44" rx="8" fill={NAVY} />
      <path d="M30 68l-8 10v-10z" fill={NAVY} />
      <circle cx="34" cy="46" r="4" fill={SKY_LIGHT} />
      <circle cx="48" cy="46" r="4" fill={SKY_LIGHT} />
      <circle cx="62" cy="46" r="4" fill={SKY_LIGHT} />
      <rect x="44" y="48" width="60" height="42" rx="8" fill={WHITE} stroke={COBALT} strokeWidth="5" />
      <path d="M88 90l8 10v-10z" fill={COBALT} />
    </>
  ),
  // A first-aid life preserver ring.
  aid: (
    <>
      <circle cx="60" cy="60" r="46" fill={WHITE} stroke={NAVY} strokeWidth="8" />
      <circle cx="60" cy="60" r="22" fill={SKY_LIGHT} stroke={NAVY} strokeWidth="6" />
      <rect x="52" y="14" width="16" height="24" fill={COBALT} />
      <rect x="52" y="82" width="16" height="24" fill={COBALT} />
      <rect x="14" y="52" width="24" height="16" fill={COBALT} />
      <rect x="82" y="52" width="24" height="16" fill={COBALT} />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type CutoutName = keyof typeof ART;

interface CutoutProps {
  name: CutoutName;
  tilt?: number; // degrees, small: -6 to 6
  className?: string;
  style?: CSSProperties;
}

export function Cutout({ name, tilt = 0, className = '', style }: CutoutProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      className={`cutout ${className}`}
      viewBox="-8 -8 136 136"
      aria-hidden="true"
      focusable="false"
      style={{ '--tilt': `${tilt}deg`, ...style } as CSSProperties}
    >
      <defs>
        {/* Roughens the white edge a little, like scissors on paper. */}
        <filter id={`cut${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed={name.length} />
          <feDisplacementMap in="SourceGraphic" scale="6" />
        </filter>
      </defs>
      <g className="cut-edge" filter={`url(#cut${id})`}>
        {ART[name]}
      </g>
      <g>{ART[name]}</g>
    </svg>
  );
}
