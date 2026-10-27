// The answer panel after a question. When it appears it scrolls just enough to come into view,
// so nobody has to hunt for the explanation (no scroll at all if it is already well in view).
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // If the panel starts in the lower part of the screen, bring it up to about a third of the way down,
    // keeping the message just answered in view above it.
    const top = el.getBoundingClientRect().top;
    if (top > window.innerHeight * 0.55) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollBy({ top: top - window.innerHeight * 0.33, behavior: reduced ? 'auto' : 'smooth' });
    }
  }, []);
  return (
    <div ref={ref} className="reveal">
      {children}
    </div>
  );
}
