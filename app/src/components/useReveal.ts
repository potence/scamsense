// Scroll reveal: elements with data-reveal fade and rise in once they scroll into view.
// The hidden starting state only exists in CSS under prefers-reduced-motion: no-preference,
// and only after this hook marks the page ready, so nothing stays hidden without JavaScript.
import { useEffect } from 'react';

export function useReveal() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    document.documentElement.classList.add('reveal-ready');
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
