import { useRef, type CSSProperties, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../fx'
import { S } from '../store'

const LINES = 1024
const fmt = (n: number) => {
  const s = String(Math.min(9999, n)).padStart(4, '0')
  return `${s[0]},${s.slice(1)}`
}

/** Irregular packet bursts: a stepped, monotone schedule unique to each frame. */
function schedule(seed: number, bands: number) {
  let s = seed * 9301 + 49297
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  const inc = Array.from({ length: bands }, () => 0.4 + rnd() * 1.6)
  const total = inc.reduce((a, b) => a + b, 0)
  let acc = 0
  return inc.map((d) => (acc += d / total))
}

type Props = {
  src: string
  alt: string
  frame: string
  name: string
  w?: number
  h?: number
  /** Aspect ratio of the frame (width / height). Defaults to the image's. */
  ratio?: number
  position?: string
  className?: string
  style?: CSSProperties
  seed?: number
  children?: ReactNode
  eager?: boolean
  /** Optional magnification about `position`, for detail crops. */
  zoom?: number
}

/**
 * An image that is received rather than faded in: horizontal bands arrive top to bottom with a
 * scan head, colour channels start misregistered and settle, and a line counter ticks to 1,024.
 */
export default function Downlink({ src, alt, frame, name, w, h, ratio, position, className = '', style, seed = 1, children, eager, zoom }: Props) {
  const ref = useRef<HTMLElement>(null)
  const ar = ratio ?? (w && h ? w / h : 16 / 9)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      if (S.reduced) {
        el.dataset.state = 'done'
        return
      }
      const view = el.querySelector<HTMLElement>('.gs-dl__view')!
      const img = el.querySelector<HTMLImageElement>('.gs-dl__img')!
      const rx = el.querySelector<HTMLElement>('.gs-dl__rx b')
      const chans = el.querySelectorAll<HTMLElement>('.gs-dl__ch img')
      const steps = schedule(seed, 22)
      const zs = zoom ? ` scale(${zoom})` : ''
      let tween: gsap.core.Tween | null = null
      let started = false

      const run = () => {
        if (started) return
        started = true
        el.dataset.state = 'rx'
        const o = { p: 0 }
        tween = gsap.to(o, {
          p: 1,
          duration: 1.05,
          ease: 'none',
          onUpdate: () => {
            const i = Math.min(steps.length - 1, Math.floor(o.p * steps.length))
            const q = o.p >= 1 ? 1 : i === 0 ? 0 : steps[i - 1]
            view.style.setProperty('--rx', q.toFixed(4))
            const off = Math.pow(1 - q, 1.5) * 10 + (i % 3 === 0 ? 1.5 : 0) * (1 - q)
            if (chans[0]) chans[0].style.transform = `translate3d(${(-off).toFixed(2)}px,0,0)${zs}`
            if (chans[2]) chans[2].style.transform = `translate3d(${off.toFixed(2)}px,0,0)${zs}`
            if (rx) rx.textContent = fmt(Math.round(q * LINES))
          },
          onComplete: () => {
            view.style.setProperty('--rx', '1')
            el.dataset.state = 'done'
            if (rx) rx.textContent = fmt(LINES)
          },
        })
      }

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          el.dataset.state = 'acq'
          const ready = img.complete && img.naturalWidth > 0 ? Promise.resolve() : img.decode().catch(() => undefined)
          ready.then(() => gsap.delayedCall(0.12 + (seed % 4) * 0.08, run))
        },
      })
      return () => {
        st.kill()
        tween?.kill()
      }
    },
    { scope: ref },
  )

  const imgStyle: CSSProperties = {
    ...(position ? { objectPosition: position } : {}),
    ...(zoom ? { transform: `scale(${zoom})`, transformOrigin: position ?? '50% 50%' } : {}),
  }
  return (
    <figure ref={ref} className={`gs-dl ${className}`} data-state="wait" style={{ ...style, ['--ar' as string]: String(ar) }}>
      <div className="gs-dl__head" aria-hidden="true">
        <span>{frame}</span>
        <span className="gs-dl__name">{name}</span>
        {w && h ? (
          <span className="gs-dl__dim">
            {w}×{h}
          </span>
        ) : null}
      </div>
      <div className="gs-dl__view">
        <img className="gs-dl__img" src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" style={imgStyle} />
        <div className="gs-dl__ch" aria-hidden="true">
          <img src={src} alt="" loading="lazy" decoding="async" style={imgStyle} />
          <img src={src} alt="" loading="lazy" decoding="async" style={imgStyle} />
          <img src={src} alt="" loading="lazy" decoding="async" style={imgStyle} />
        </div>
        <div className="gs-dl__pending" aria-hidden="true">
          <span>Awaiting downlink</span>
        </div>
        <div className="gs-dl__scan" aria-hidden="true" />
        <span className="gs-dl__corner" aria-hidden="true" />
        {children}
      </div>
      <figcaption className="gs-dl__foot">
        <span className="gs-dl__rx" aria-hidden="true">
          RX <b>0,000</b> / 1,024 lines
        </span>
        <span className="gs-dl__ok" aria-hidden="true" />
        <span className="gs-sr">{alt}</span>
      </figcaption>
    </figure>
  )
}
