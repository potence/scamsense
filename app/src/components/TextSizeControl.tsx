import { useEffect, useRef, useState } from 'react';
import { applyTextSize, loadTextSize, TEXT_SIZES } from '../engine/textSize.ts';
import type { TextSize } from '../engine/textSize.ts';
import { playSound } from '../engine/sounds.ts';

export function TextSizeControl() {
  const [size, setSize] = useState<TextSize>(() => {
    const initial = loadTextSize();
    applyTextSize(initial);
    return initial;
  });
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Re-apply on mount and whenever size changes so #main and DOM elements receive zoom
  useEffect(() => {
    applyTextSize(size);
  }, [size]);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectSize = (newSize: TextSize) => {
    setSize(newSize);
    applyTextSize(newSize);
    setOpen(false);
    playSound('tap');
  };

  return (
    <div className="text-size-control" ref={containerRef}>
      <button
        type="button"
        className="text-size-btn"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Text size: ${size}`}
        onClick={() => setOpen(!open)}
      >
        <span className="text-size-glyph" aria-hidden="true">Aa</span>
        <span className="text-size-label">Size</span>
      </button>

      {open && (
        <div className="text-size-menu" role="menu" aria-label="Text size options">
          {TEXT_SIZES.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="menuitemradio"
              aria-checked={size === opt.id}
              className={`text-size-option${size === opt.id ? ' is-active' : ''}`}
              onClick={() => selectSize(opt.id)}
            >
              <span className="option-check" aria-hidden="true">
                {size === opt.id ? '✓' : ''}
              </span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
