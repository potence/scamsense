// One small set of line icons, drawn as inline SVG so they work offline.
// Icons are decoration only (aria-hidden): every icon sits next to words that say the same thing.

const PATHS = {
  book: ['M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z', 'M4 17a3 3 0 0 1 3-3h11'],
  target: ['M21 12a9 9 0 1 1-18 0a9 9 0 1 1 18 0', 'M17 12a5 5 0 1 1-10 0a5 5 0 1 1 10 0', 'M13 12a1 1 0 1 1-2 0a1 1 0 1 1 2 0'],
  people: ['M9 11a4 4 0 1 0 0-8a4 4 0 1 0 0 8z', 'M2 21v-1a6 6 0 0 1 12 0v1', 'M16 3.5a4 4 0 0 1 0 7.5', 'M22 21v-1a6 6 0 0 0-4-5.6'],
  message: ['M4 5h16v11H9l-5 4z'],
  mail: ['M3 6h18v12H3z', 'M3 7l9 6 9-6'],
  phone: ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z'],
  speakerOff: ['M4 9h4l5-4v14l-5-4H4z', 'M17 9l5 6', 'M22 9l-5 6'],
  qr: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M14 14h2v2h-2z', 'M18 18h2v2h-2z', 'M14 18h2', 'M18 14h2'],
  check: ['M21 12a9 9 0 1 1-18 0a9 9 0 1 1 18 0', 'M8 12l3 3 5-6'],
  tip: ['M9 18h6', 'M10 21h4', 'M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z'],
  alert: ['M12 3l10 18H2z', 'M12 10v5', 'M12 18h.01'],
  arrowRight: ['M5 12h14', 'M13 6l6 6-6 6'],
  chevronRight: ['M9 6l6 6-6 6'],
  arrowLeft: ['M19 12H5', 'M11 6l-6 6 6 6'],
  speaker: ['M4 9h4l5-4v14l-5-4H4z', 'M16 9a4 4 0 0 1 0 6', 'M19 6a8 8 0 0 1 0 12'],
  stop: ['M7 7h10v10H7z'],
  play: ['M8 5l11 7-11 7z'],
  lock: ['M5 11h14v10H5z', 'M8 11V7a4 4 0 0 1 8 0v4'],
  spark: ['M12 3v18', 'M3 12h18', 'M5.6 5.6l12.8 12.8', 'M5.6 18.4L18.4 5.6'],
  flame: ['M12 2c-.5 2.5-2.5 4.5-4 7-2 3.33-1.5 7.5 1 10.5a8 8 0 0 0 11.5-.5c2-2.5 2-6.5-.5-9.5-2-2.5-4.5-4-5-8-.5 1-1.5 1.5-3 1z'],
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <svg className={`icon ${className}`.trim()} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
