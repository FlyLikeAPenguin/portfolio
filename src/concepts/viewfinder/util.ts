export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
/** easeInOutCubic */
export const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
/** easeOutBack: the only overshoot we allow, reserved for detents. */
export const outBack = (t: number, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2)

/**
 * Stepped progress for click-stops: x in [0, n] → plateaus at integers with a quick
 * mechanical move in between. `hold` is the fraction of each step spent resting.
 */
export const stair = (x: number, hold = 0.3, ease: (t: number) => number = inOut) => {
  const i = Math.floor(x)
  const f = x - i
  const h = hold / 2
  if (f <= h) return i
  if (f >= 1 - h) return i + 1
  return i + ease((f - h) / (1 - hold))
}

export const pad = (n: number, l = 2) => String(n).padStart(l, '0')

/** "Live · private beta" → "LIVE · PRIVATE BETA" etc. Content stays exact, only case changes in CSS. */
export const shortRole = (role: string) => role.split(':')[0].trim()

export const titleFromFile = (path: string) => {
  const base = path.split('/').pop() ?? path
  const name = base.replace(/\.[a-z]+$/i, '').replace(/^(shot|hero|poster)-/, '').replace(/-/g, ' ')
  return name.charAt(0).toUpperCase() + name.slice(1)
}
