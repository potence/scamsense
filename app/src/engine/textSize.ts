// Text size scaling: Standard (1x), Large (1.15x), Extra large (1.3x).
// Persisted in localStorage ('scamsense-textsize-v1') and applied via --text-scale and data-text-size.

export type TextSize = 'standard' | 'large' | 'xlarge';

export interface TextSizeOption {
  id: TextSize;
  label: string;
  scale: number;
}

export const TEXT_SIZES: TextSizeOption[] = [
  { id: 'standard', label: 'Standard (1×)', scale: 1 },
  { id: 'large', label: 'Large (1.15×)', scale: 1.15 },
  { id: 'xlarge', label: 'Extra large (1.3×)', scale: 1.3 },
];

const STORAGE_KEY = 'scamsense-textsize-v1';

export type SimpleStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function getStore(): SimpleStore | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function loadTextSize(store: SimpleStore | null = getStore()): TextSize {
  try {
    const saved = store?.getItem(STORAGE_KEY);
    if (saved === 'standard' || saved === 'large' || saved === 'xlarge') {
      return saved;
    }
  } catch {
    // Storage unavailable
  }
  return 'standard';
}

export function applyTextSize(size: TextSize, store: SimpleStore | null = getStore()): void {
  const opt = TEXT_SIZES.find((s) => s.id === size) ?? TEXT_SIZES[0];
  try {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-text-size', opt.id);
      document.documentElement.style.setProperty('--text-scale', String(opt.scale));
      const main = document.getElementById('main');
      if (main) {
        main.style.zoom = String(opt.scale);
      }
      const footer = document.querySelector('.site-footer') as HTMLElement | null;
      if (footer) {
        footer.style.zoom = String(opt.scale);
      }
    }
    store?.setItem(STORAGE_KEY, opt.id);
  } catch {
    // Safely ignore if DOM or storage is restricted
  }
}
