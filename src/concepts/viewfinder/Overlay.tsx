import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../../shared/useSmoothScroll'
import { meter, useVf } from './store'
import { sectionSpeed, speedLabel } from './sections'
import { clamp, pad } from './util'

/**
 * The finder: always there, never loud. Corner brackets, a split-prism spot with a
 * microprism collar, the OM-1's match-needle meter on the right edge, and a readout strip.
 * The needle swings with scroll velocity on an underdamped spring.
 */
export default function Overlay() {
  const needle = useRef<SVGGElement>(null)
  const prismTop = useRef<SVGLineElement>(null)
  const prismBot = useRef<SVGLineElement>(null)
  const ev = useRef<HTMLElement>(null)
  const frame = useVf((s) => s.frame)
  const aperture = useVf((s) => s.aperture)
  const section = useVf((s) => s.section)

  useEffect(() => {
    if (prefersReducedMotion()) return
    let lastY = window.scrollY
    let lastT = performance.now()
    let v = 0 // smoothed px/s
    let ang = 0
    let vel = 0
    let shownEv = ''
    let resting = false
    const tick = () => {
      const now = performance.now()
      const dt = Math.min(0.05, Math.max(0.001, (now - lastT) / 1000))
      lastT = now
      const y = window.scrollY
      const inst = (y - lastY) / dt
      lastY = y
      v += (inst - v) * Math.min(1, dt * 14)
      // scrolling down = more light through the finder: needle swings toward +
      const target = clamp(v / 2400, -1, 1) * 38
      const acc = 170 * (target - ang) - 11 * vel
      vel += acc * dt
      ang += vel * dt
      const still = Math.abs(ang) < 0.02 && Math.abs(vel) < 0.02 && Math.abs(target) < 0.02
      if (still && resting) return
      resting = still
      needle.current?.setAttribute('transform', `rotate(${ang.toFixed(2)} 118 100)`)
      // the split-prism image of a vertical line breaks apart with the needle
      const off = clamp(ang / 38, -1, 1) * 7
      prismTop.current?.setAttribute('transform', `translate(${off.toFixed(2)} 0)`)
      prismBot.current?.setAttribute('transform', `translate(${(-off).toFixed(2)} 0)`)
      const e = clamp(ang / 19, -2, 2)
      meter.set(e)
      const label = `${e >= 0.05 ? '+' : e <= -0.05 ? '−' : '±'}${Math.abs(e).toFixed(1)}`
      if (label !== shownEv && ev.current) {
        shownEv = label
        ev.current.textContent = label
      }
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  const speed = sectionSpeed(section)

  return (
    <div className="vf-ov" aria-hidden="true">
      <div className="vf-ov__screen" />
      <span className="vf-ov__br vf-ov__br--tl" />
      <span className="vf-ov__br vf-ov__br--tr" />
      <span className="vf-ov__br vf-ov__br--bl" />
      <span className="vf-ov__br vf-ov__br--br" />

      <svg className="vf-ov__prism" viewBox="-60 -60 120 120">
        <defs>
          <pattern id="vf-micro" width="3.2" height="2.77" patternUnits="userSpaceOnUse">
            <circle cx="0.8" cy="0.7" r="0.42" fill="#ecebe6" />
            <circle cx="2.4" cy="2.08" r="0.42" fill="#ecebe6" />
          </pattern>
          <mask id="vf-collar">
            <circle r="34" fill="#fff" />
            <circle r="21" fill="#000" />
          </mask>
        </defs>
        <circle r="34" fill="url(#vf-micro)" mask="url(#vf-collar)" opacity="0.36" />
        <circle r="34" fill="none" stroke="#ecebe6" strokeWidth="0.6" opacity="0.6" />
        <circle r="21" fill="none" stroke="#ecebe6" strokeWidth="0.6" opacity="0.9" />
        <line x1="-21" y1="0" x2="21" y2="0" stroke="#ecebe6" strokeWidth="0.5" opacity="0.7" />
        <line ref={prismTop} x1="0" y1="-14" x2="0" y2="-0.6" stroke="#ecebe6" strokeWidth="0.8" opacity="0.8" />
        <line ref={prismBot} x1="0" y1="0.6" x2="0" y2="14" stroke="#ecebe6" strokeWidth="0.8" opacity="0.8" />
      </svg>

      <svg className="vf-ov__meter" viewBox="0 0 40 200">
        <defs>
          <clipPath id="vf-meter-win">
            <rect x="12" y="22" width="12" height="156" rx="1" />
          </clipPath>
        </defs>
        <text x="18" y="13" textAnchor="middle" className="vf-ov__meterpm">+</text>
        <text x="18" y="196" textAnchor="middle" className="vf-ov__meterpm">−</text>
        <rect x="12" y="22" width="12" height="156" rx="1" fill="rgba(12,12,12,.35)" stroke="#ecebe6" strokeOpacity="0.4" strokeWidth="0.75" />
        {Array.from({ length: 11 }, (_, i) => {
          const y = 30 + i * 14
          const major = i === 5
          return <line key={i} x1={major ? 4 : 7} y1={y} x2="11" y2={y} stroke="#ecebe6" strokeOpacity={major ? 0.85 : 0.35} strokeWidth="0.75" />
        })}
        <circle cx="30" cy="100" r="1.8" fill="none" stroke="#ecebe6" strokeOpacity="0.7" strokeWidth="0.75" />
        <g clipPath="url(#vf-meter-win)">
          <g ref={needle}>
            <line x1="0" y1="100" x2="118" y2="100" stroke="#ff5a1f" strokeWidth="1.6" />
          </g>
        </g>
      </svg>

      <div className="vf-ov__read">
        <span>
          <em className="vf-engr">Shutter</em>
          <b className="vf-mono">{speedLabel(speed)}</b>
        </span>
        <span>
          <em className="vf-engr">Aperture</em>
          <b className="vf-mono">f/{aperture}</b>
        </span>
        <span className="vf-ov__ev">
          <em className="vf-engr">EV</em>
          <b className="vf-mono" ref={ev}>
            ±0.0
          </b>
        </span>
        <span>
          <em className="vf-engr">Frame</em>
          <b className="vf-mono vf-ov__frame">▸ {pad(frame)}</b>
        </span>
      </div>
    </div>
  )
}
