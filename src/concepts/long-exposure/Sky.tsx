import { useEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import Horizon from './Horizon'
import { buildField, drawTrails, lerp, makeSprite, mixHex, smoothstep, NBINS, type Field } from './skyEngine'
import { createGLTrails } from './glTrails'
import { sky, EXPOSURE_SECONDS } from './store'

/** Radians of sky rotation over the whole page (~300°). */
const MAX_SWEEP = (300 / 180) * Math.PI
/** A few degrees already recorded when the shutter opens, so trails read as trails at first glance. */
const OPEN_SWEEP = 0.045
/** Fixed sweep for prefers-reduced-motion. */
const STILL_SWEEP = 1.9

type Pass = { a: [number, number]; b: [number, number]; label: boolean }
const PASSES: Pass[] = [
  { a: [-0.04, 0.74], b: [1.06, 0.3], label: true },
  // Later passes fade into Earth's shadow mid-sky, as real ones do.
  { a: [1.05, 0.12], b: [0.3, 0.5], label: false },
  { a: [0.12, -0.05], b: [0.5, 0.6], label: false },
]
const METEOR = { a: [0.12, 0.1] as const, b: [0.43, 0.43] as const, dur: 720 }

const RIDGES = {
  far: ['#0b1027', '#5b4060'],
  mid: ['#080b19', '#2c2036'],
  near: ['#020308', '#120b14'],
} as const

const pad2 = (n: number) => String(n).padStart(2, '0')
export const formatExposure = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds))
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`
}

type Props = {
  readoutRef: RefObject<HTMLSpanElement | null>
  meterRef: RefObject<HTMLSpanElement | null>
  /** The fixed top bar: its scrim lightens as dawn comes up. */
  topRef: RefObject<HTMLElement | null>
}

export default function Sky({ readoutRef, meterRef, topRef }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const trailsRef = useRef<HTMLCanvasElement>(null)
  const glintsRef = useRef<HTMLCanvasElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const poleRef = useRef<HTMLDivElement>(null)
  const venusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current!
    const trails = trailsRef.current!
    const glints = glintsRef.current!
    const label = labelRef.current!
    const pole = poleRef.current!
    const venus = venusRef.current!
    const poleLabel = pole.querySelector<HTMLElement>('.le-pole-label')!
    // GPU path first (constant cost at any trail length); Canvas2D arcs as the fallback.
    const gpu = createGLTrails(trails)
    const tctx = gpu ? null : trails.getContext('2d')
    const fades = new Float32Array(NBINS)
    const gctx = glints.getContext('2d')!

    let field: Field | null = null
    let labelW = 0
    let lastGlint = 0
    let lastGlintSweep = -1
    let lastSatKey = -1
    let lastMeteorSeen = false
    let glintsBlank = false
    let W = 0
    let H = 0
    let dpr = 1
    let dirty = true
    const sprites = new Map<string, HTMLCanvasElement>()
    const spriteFor = (rgb: [number, number, number]) => {
      const k = rgb.join(',')
      let s = sprites.get(k)
      if (!s) sprites.set(k, (s = makeSprite(rgb)))
      return s
    }
    const white = spriteFor([236, 242, 255])
    const meteorSprite = spriteFor([210, 255, 225])

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const mobile = w <= 768
      // Mobile URL bars resize the viewport while scrolling: keep the tallest height for this width.
      if (field && w === W && mobile && h <= H) return
      W = w
      H = mobile && field && w === field.W ? Math.max(h, H) : h
      dpr = mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.75)
      field = buildField(W, H, mobile ? 860 : 1900, mobile)
      for (const c of [trails, glints]) {
        c.width = Math.round(W * dpr)
        c.height = Math.round(H * dpr)
        c.style.width = `${W}px`
        c.style.height = `${H}px`
      }
      gpu?.setField(field)
      pole.style.transform = `translate3d(${field.cx}px, ${field.cy}px, 0)`
      labelW = 0
      lastGlintSweep = -1
      glintsBlank = false
      dirty = true
    }
    resize()
    window.addEventListener('resize', resize)

    const t0 = performance.now()
    let lastSweep = -1
    let lastFade = -1
    let lastDawnCss = -1
    let lastP = -1
    let lastReadout = ''
    let lastPole = -1
    let lastPoleLabel = -1

    // Dawn washes out the faint stars first; deep into the night the densest trails calm down a touch.
    const fadeFor = (bin: number, d: number, intro: number) =>
      intro *
      (1 - 0.2 * smoothstep(0.2, 0.9, sky.progress) * (1 - bin / NBINS)) *
      (1 - smoothstep(0.3 + (0.36 * bin) / (NBINS - 1), 0.74 + (0.24 * bin) / (NBINS - 1), d))

    const tick = () => {
      if (!field) return
      const f = field
      const now = performance.now()
      const still = sky.still
      const introT = still ? 1 : Math.min(1, (now - t0) / 2200)
      const intro = 1 - (1 - introT) ** 3
      const openT = still ? 1 : Math.min(1, Math.max(0, (now - t0 - 300) / 2600))
      const open = openT === 1 ? 1 : 1 - 2 ** (-10 * openT)
      const p = sky.progress
      const d = sky.dawn
      const sweep = still ? STILL_SWEEP : OPEN_SWEEP * open + (MAX_SWEEP - OPEN_SWEEP) * p

      // --- Trails: analytic redraw only when something that affects them changed.
      const fadeKey = fadeFor(0, d, intro) + fadeFor(NBINS - 1, d, intro) * 3.1
      if (dirty || Math.abs(sweep - lastSweep) > 2e-5 || Math.abs(fadeKey - lastFade) > 1e-4) {
        if (gpu) {
          for (let b = 0; b < NBINS; b++) fades[b] = fadeFor(b, d, intro)
          gpu.draw(sweep, dpr, fades)
        } else if (tctx) {
          drawTrails(tctx, f, dpr, sweep, (bin) => fadeFor(bin, d, intro))
        }
        lastSweep = sweep
        lastFade = fadeKey
        dirty = false
      }

      // --- Glints (twinkle), satellites, meteor. Throttled to ~30fps unless something is moving.
      const satKey = sky.sats[0] + sky.sats[1] * 3 + sky.sats[2] * 7
      const meteorLive = sky.meteorAt > 0 && now - sky.meteorAt < METEOR.dur + 1300
      const glintsDue = sweep !== lastGlintSweep || satKey !== lastSatKey || meteorLive || sky.meteorSeen !== lastMeteorSeen || (!still && now - lastGlint > 40)
      const nothingLit = fadeFor(NBINS - 1, d, intro) < 0.003 && !meteorLive
      if (glintsDue && !(nothingLit && glintsBlank)) {
        lastGlint = now
        lastGlintSweep = sweep
        lastSatKey = satKey
        lastMeteorSeen = sky.meteorSeen
        glintsBlank = nothingLit
        gctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        gctx.clearRect(0, 0, W, H)
        gctx.globalCompositeOperation = 'lighter'
        const tw = still ? 0 : now / 1000
        const brightFade = fadeFor(NBINS - 1, d, intro)
        if (brightFade > 0.003) {
          for (const g of f.glints) {
            const h = g.a - sweep
            const x = f.cx + g.r * Math.cos(h)
            const y = f.cy + g.r * Math.sin(h)
            if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue
            const twinkle = still ? 1 : 0.8 + 0.13 * Math.sin(tw * g.w1 + g.p1) + 0.07 * Math.sin(tw * g.w2 + g.p2)
            gctx.globalAlpha = Math.min(1, g.base * twinkle * brightFade)
            const s = g.size
            gctx.drawImage(spriteFor(g.rgb), x - s / 2, y - s / 2, s, s)
          }
        }

        const nightFade = intro * (1 - smoothstep(0.45, 0.9, d))
        let labelOpacity = 0
        let lx = 0
        let ly = 0
        if (!still && nightFade > 0.003) {
          PASSES.forEach((pass, i) => {
            const u = sky.sats[i]
            if (u <= 0) return
            const ax = pass.a[0] * W
            const ay = pass.a[1] * H
            const bx = pass.b[0] * W
            const by = pass.b[1] * H
            const hx = lerp(ax, bx, u)
            const hy = lerp(ay, by, u)
            const grad = gctx.createLinearGradient(ax, ay, bx, by)
            grad.addColorStop(0, 'rgba(236,242,255,0)')
            grad.addColorStop(0.1, 'rgba(236,242,255,0.62)')
            grad.addColorStop(0.48, 'rgba(236,242,255,0.7)')
            grad.addColorStop(0.53, 'rgba(255,255,255,1)')
            grad.addColorStop(0.58, 'rgba(236,242,255,0.66)')
            grad.addColorStop(0.84, 'rgba(236,242,255,0.6)')
            grad.addColorStop(0.95, 'rgba(236,242,255,0)')
            gctx.globalAlpha = nightFade * (1 - 0.62 * smoothstep(0.9, 1, u))
            gctx.strokeStyle = grad
            gctx.lineWidth = 1.1
            gctx.lineCap = 'round'
            gctx.beginPath()
            gctx.moveTo(ax, ay)
            gctx.lineTo(hx, hy)
            gctx.stroke()
            if (u > 0.06 && u < 0.92) {
              gctx.globalAlpha = 0.85 * nightFade
              gctx.drawImage(white, hx - 9, hy - 9, 18, 18)
            }
            if (pass.label) {
              labelOpacity = smoothstep(0.14, 0.24, u) * (1 - smoothstep(0.66, 0.78, u)) * nightFade
              lx = hx
              ly = hy
            }
          })
        }

        // Meteor: a brief bright streak, leaving a faint trace in the exposure.
        if (!still && sky.meteorSeen) {
          const ax = METEOR.a[0] * W
          const ay = METEOR.a[1] * H
          const bx = METEOR.b[0] * W
          const by = METEOR.b[1] * H
          const dt = sky.meteorAt ? now - sky.meteorAt : 1e9
          const flight = Math.min(1, dt / METEOR.dur)
          const u = 1 - (1 - flight) ** 3
          const glow = dt < METEOR.dur ? 1 : Math.max(0, 1 - (dt - METEOR.dur) / 1100)
          gctx.lineCap = 'round'
          // residual trace
          const trace = gctx.createLinearGradient(ax, ay, bx, by)
          trace.addColorStop(0, 'rgba(220,255,232,0)')
          trace.addColorStop(0.55, 'rgba(230,255,238,0.5)')
          trace.addColorStop(0.9, 'rgba(255,255,255,0.75)')
          trace.addColorStop(1, 'rgba(255,255,255,0)')
          gctx.globalAlpha = 0.22 * nightFade * (1 - glow * 0.6)
          gctx.strokeStyle = trace
          gctx.lineWidth = 1
          gctx.beginPath()
          gctx.moveTo(ax, ay)
          gctx.lineTo(lerp(ax, bx, u), lerp(ay, by, u))
          gctx.stroke()
          if (glow > 0) {
            const hx = lerp(ax, bx, u)
            const hy = lerp(ay, by, u)
            const tu = Math.max(0, u - 0.4)
            const tx = lerp(ax, bx, tu)
            const ty = lerp(ay, by, tu)
            const g = gctx.createLinearGradient(tx, ty, hx, hy)
            g.addColorStop(0, 'rgba(160,255,200,0)')
            g.addColorStop(0.6, 'rgba(200,255,220,0.55)')
            g.addColorStop(1, 'rgba(255,255,255,1)')
            gctx.globalAlpha = glow * nightFade
            gctx.strokeStyle = g
            gctx.lineWidth = 2
            gctx.beginPath()
            gctx.moveTo(tx, ty)
            gctx.lineTo(hx, hy)
            gctx.stroke()
            if (dt < METEOR.dur) {
              gctx.globalAlpha = nightFade
              gctx.drawImage(meteorSprite, hx - 22, hy - 22, 44, 44)
            }
          }
        }
        gctx.globalAlpha = 1
        gctx.globalCompositeOperation = 'source-over'

        // Satellite label rides alongside the streak.
        label.style.opacity = labelOpacity.toFixed(3)
        if (labelOpacity > 0) {
          if (!labelW) labelW = label.offsetWidth
          const x = Math.min(lx + 14, W - labelW - 16)
          label.style.transform = `translate3d(${x.toFixed(1)}px, ${(ly + 12).toFixed(1)}px, 0)`
        }

      }

      // --- Sky colour, horizon warmth, ridge parallax: CSS variables on the sky only.
      if (Math.abs(d - lastDawnCss) > 1e-4 || Math.abs(p - lastP) > 1e-4) {
        const bh = smoothstep(0, 0.45, d)
        const dn = smoothstep(0.32, 0.96, d)
        const sun = smoothstep(0.68, 1, d)
        const sink = smoothstep(0.015, 0.07, p) * (1 - smoothstep(0.35, 0.85, d))
        const st = wrap.style
        st.setProperty('--bh', bh.toFixed(4))
        st.setProperty('--dn', dn.toFixed(4))
        st.setProperty('--sun', sun.toFixed(4))
        st.setProperty('--p', p.toFixed(4))
        st.setProperty('--sink', sink.toFixed(4))
        st.setProperty('--r-far', mixHex(RIDGES.far[0], RIDGES.far[1], dn))
        st.setProperty('--r-mid', mixHex(RIDGES.mid[0], RIDGES.mid[1], dn))
        st.setProperty('--r-near', mixHex(RIDGES.near[0], RIDGES.near[1], dn))
        topRef.current?.style.setProperty('--scrim', (1 - 0.7 * dn).toFixed(3))
        // The morning star outlasts everything else.
        venus.style.opacity = (smoothstep(0.5, 0.8, d) * (1 - 0.35 * smoothstep(0.95, 1, d))).toFixed(3)
        lastDawnCss = d
        lastP = p
      }

      // Pole annotation: arrives after the intro, leaves with the stars.
      const poleO = (still ? 1 : smoothstep(1800, 3400, now - t0)) * (1 - smoothstep(0.25, 0.6, d))
      if (Math.abs(poleO - lastPole) > 0.002) {
        pole.style.opacity = poleO.toFixed(3)
        lastPole = poleO
      }
      // Its label is for the opening frame only; once text starts passing over it, it bows out.
      const poleLabelO = still ? 1 : 1 - smoothstep(0.012, 0.035, p)
      if (Math.abs(poleLabelO - lastPoleLabel) > 0.002) {
        poleLabel.style.opacity = poleLabelO.toFixed(3)
        lastPoleLabel = poleLabelO
      }

      // --- Shooting data.
      const text = formatExposure(p * EXPOSURE_SECONDS)
      if (text !== lastReadout && readoutRef.current) {
        readoutRef.current.textContent = text
        lastReadout = text
      }
      if (meterRef.current) meterRef.current.style.transform = `scaleX(${p.toFixed(4)})`
    }

    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      gpu?.dispose()
      window.removeEventListener('resize', resize)
    }
  }, [readoutRef, meterRef, topRef])

  return (
    <div className="le-sky" ref={wrapRef} aria-hidden="true">
      <div className="le-sky-layer le-sky-night" />
      <div className="le-sky-layer le-sky-blue" />
      <div className="le-sky-layer le-sky-dawn" />
      <div className="le-sky-layer le-sky-sun" />
      <div className="le-sky-layer le-airglow" />
      <canvas className="le-trails" ref={trailsRef} />
      <canvas className="le-glints" ref={glintsRef} />
      <div className="le-pole" ref={poleRef}>
        <span className="le-pole-ring" />
        <span className="le-pole-label">Celestial pole</span>
      </div>
      <div className="le-venus" ref={venusRef}>
        <span className="le-venus-dot" />
        <span className="le-venus-label">Venus, the last light out</span>
      </div>
      <p className="le-satlabel" ref={labelRef}>
        <span className="le-satlabel-arrow">↖</span> not a star: a satellite. <em>I used to help fly those.</em>
      </p>
      <Horizon />
      <div className="le-sky-layer le-grain" />
    </div>
  )
}
