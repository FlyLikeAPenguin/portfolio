import { ScrollTrigger } from 'gsap/ScrollTrigger'

/*
 * The frame counter. Before the roll it reads S; inside the film-advance pin it reads the frame
 * at the gate; after that it keeps counting toward 36 with the rest of the page.
 */
type Listener = (v: number) => void

let value = 0
let stripFrame = 1
const listeners = new Set<Listener>()

export const ROLL_ID = 'cs-roll'
export const ROLL_LENGTH = 36

export const frameCounter = {
  get: () => value,
  subscribe(fn: Listener) {
    listeners.add(fn)
    fn(value)
    return () => {
      listeners.delete(fn)
    }
  },
  setStripFrame(n: number, total: number) {
    stripFrame = Math.max(1, Math.min(total, n))
    this.compute(total)
  },
  compute(total = 10) {
    const st = ScrollTrigger.getById(ROLL_ID)
    const y = window.scrollY
    let next = 0
    if (!st) {
      const max = ScrollTrigger.maxScroll(window) || 1
      next = Math.round((y / max) * ROLL_LENGTH)
    } else if (y < st.start - 2) {
      next = 0
    } else if (y <= st.end + 2) {
      next = stripFrame
    } else {
      const max = ScrollTrigger.maxScroll(window)
      const rest = Math.max(1, max - st.end)
      next = total + Math.ceil(((y - st.end) / rest) * (ROLL_LENGTH - total))
    }
    next = Math.max(0, Math.min(ROLL_LENGTH, next))
    if (next !== value) {
      value = next
      listeners.forEach((fn) => fn(value))
    }
  },
  reset() {
    value = 0
    stripFrame = 1
  },
}
