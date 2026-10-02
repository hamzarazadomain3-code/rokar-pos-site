import { useEffect, useState } from 'react';

/**
 * Decides whether the WebGL hero is worth loading.
 *
 * The 3D scene pulls in three.js, which is ~1 MB (290 KB gzipped) and then
 * animates at 60fps. The audience is retail shop owners in Pakistan, so a large
 * share of visits come from mid-range phones on mobile data, where that cost is
 * real: a slow hero delays the download button above the fold.
 *
 * So the scene only loads when the device plausibly handles it. Everywhere else
 * a static poster is shown instead -- same layout, no weight.
 *
 * The decision is made once on mount and never revisited, so it cannot flip
 * mid-session.
 */
export function useCanRender3D(): boolean {
  const [can, setCan] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setCan(false);
      return;
    }

    // Phones and tablets, including large ones. The scene needs a real GPU.
    const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches;
    const narrow = window.innerWidth < 900;

    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;
    const saveData = nav.connection?.saveData === true;

    // A very rough WebGL support probe; cheaper than loading three.js to find out.
    let webgl = false;
    try {
      const canvas = document.createElement('canvas');
      webgl = Boolean(
        canvas.getContext('webgl2') ??
          canvas.getContext('webgl') ??
          canvas.getContext('experimental-webgl'),
      );
    } catch {
      webgl = false;
    }

    setCan(webgl && !coarsePointer && !narrow && !lowMemory && !saveData);
  }, []);

  return can === true;
}

export default useCanRender3D;