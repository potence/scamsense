// Anonymous usage counts with GoatCounter (https://www.goatcounter.com): no cookies, no names, nothing typed.
// It counts screens (each route is a "page") and events such as "lesson-done/payment/3of3".
// Off until GOATCOUNTER_CODE is set, never on localhost, and if the script can't load (offline, blocked)
// the app works exactly the same.

// Your GoatCounter site code: for https://scamsense.goatcounter.com it is 'scamsense'.
export const GOATCOUNTER_CODE = '';

interface Hit {
  path: string;
  title: string;
  event?: boolean;
}
interface GoatCounter {
  count?: (hit: Hit) => void;
  no_onload?: boolean;
}
declare global {
  interface Window {
    goatcounter?: GoatCounter;
  }
}

// Counting only happens with a site code, in a browser, and not while developing.
export function shouldCount(hostname: string, code: string = GOATCOUNTER_CODE): boolean {
  return code !== '' && !/^(localhost|127\.|\[::1\]|0\.0\.0\.0)/.test(hostname);
}

const queue: Hit[] = []; // hits made before the script finished loading
let loading = false;

function send(hit: Hit): void {
  try {
    if (typeof window === 'undefined' || !shouldCount(window.location.hostname)) return;
    if (window.goatcounter?.count) {
      window.goatcounter.count(hit);
      return;
    }
    queue.push(hit);
    if (loading) return;
    loading = true;
    window.goatcounter = { no_onload: true }; // we count hash routes ourselves
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://gc.zgo.at/count.js';
    script.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
    script.onload = () => {
      for (const h of queue.splice(0)) window.goatcounter?.count?.(h);
    };
    document.head.appendChild(script);
  } catch {
    // analytics must never break the app
  }
}

// A screen, e.g. "/lesson/payment".
export function trackPage(route: string): void {
  send({ path: route || '/', title: typeof document === 'undefined' ? route : document.title });
}

// An event, e.g. "answer/payment-giftcard-01/right". Shown under "Events" in GoatCounter.
export function trackEvent(name: string): void {
  send({ path: name, title: name, event: true });
}

// Any element with data-track="name" counts as an event when clicked. Installed once by App.
export function trackClicks(): () => void {
  const onClick = (e: MouseEvent) => {
    const el = (e.target as Element | null)?.closest?.('[data-track]');
    const name = el?.getAttribute('data-track');
    if (name) trackEvent(name);
  };
  document.addEventListener('click', onClick, true);
  return () => document.removeEventListener('click', onClick, true);
}
