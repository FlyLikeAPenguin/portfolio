/**
 * Tiny mutable store shared between the scroll triggers (writers) and the sky renderer (reader).
 * Deliberately not React state: it changes every frame while scrolling.
 */
export const sky = {
  /** 0 → 1 over the whole page. Drives trail length and the exposure clock. */
  progress: 0,
  /** 0 → 1 from the career log to the end of the page: night → blue hour → dawn. */
  dawn: 0,
  /** Scroll progress through each satellite pass window (0 → 1). */
  sats: [0, 0, 0],
  /** performance.now() when the meteor fired, or 0 when armed / not yet seen. */
  meteorAt: 0,
  /** True once the meteor threshold has been passed (persists a faint trace in the exposure). */
  meteorSeen: false,
  /** Static sky for prefers-reduced-motion. */
  still: false,
}

export const SUNRISE = '05:42'
/** Total exposure represented by the full page, in seconds (21:42 → 05:42). */
export const EXPOSURE_SECONDS = 8 * 3600
