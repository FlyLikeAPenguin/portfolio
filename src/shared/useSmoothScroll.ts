import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let active: Lenis | null = null

/** The Lenis instance for the currently mounted concept, if any. */
export const getLenis = () => active

/** Smoothly scroll to an element or offset; falls back to native scrolling. */
export function scrollTo(target: string | HTMLElement | number, offset = 0) {
  if (active) {
    active.scrollTo(target, { offset, duration: 1.6 })
    return
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (typeof el === 'number') window.scrollTo({ top: el + offset, behavior: 'smooth' })
  else if (el instanceof HTMLElement) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: 'smooth' })
}

/**
 * Lenis smooth scrolling wired into GSAP's ticker so ScrollTrigger stays in sync.
 * Disabled under prefers-reduced-motion. Call once at the root of each concept.
 */
export function useSmoothScroll(options: { lerp?: number; wheelMultiplier?: number } = {}) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (prefersReducedMotion()) return

    const lenis = new Lenis({ lerp: options.lerp ?? 0.09, wheelMultiplier: options.wheelMultiplier ?? 1 })
    lenisRef.current = lenis
    active = lenis
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      if (active === lenis) active = null
      lenisRef.current = null
    }
  }, [options.lerp, options.wheelMultiplier])

  return lenisRef
}
