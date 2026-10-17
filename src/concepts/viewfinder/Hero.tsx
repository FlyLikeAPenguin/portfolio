import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { asset, profile, streetPhotos } from '../../content'
import { BLADES, BLADE_PATH, EDGE_R, RP, STOPS, alphaFor, arcPath, dForN, edgeSegments, nForK } from './iris'
import { clamp, smoothstep, stair } from './util'
import { vf } from './store'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/** Red umbrella: an iris of its own. Focal point = the umbrella's tip. */
const PHOTO = streetPhotos.find((p) => p.src.endsWith('p797.webp')) ?? streetPhotos[0]
const FOCAL = PHOTO.src.endsWith('p797.webp') ? { x: 0.39, y: 0.51 } : { x: 0.5, y: 0.5 }

const TEXT_TOP = 'OLYMPUS OM-1 · ZUIKO 1:1.8 f=50mm'
const TEXT_BOT = `${profile.name} · ${profile.location} · No. 001`.toUpperCase()

/** Machined satin: each blade catches a key light from the upper left a little differently. */
const bladeTone = (i: number) => {
  const facing = Math.cos(((i * 40 + 95 - 225) * Math.PI) / 180)
  return 0.5 + 0.5 * facing
}

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const lens = useRef<SVGGElement>(null)
  const knurl = useRef<SVGGElement>(null)
  const blades = useRef<(SVGGElement | null)[]>([])
  const edges = useRef<(SVGUseElement | null)[]>([])
  const grads = useRef<(SVGLinearGradientElement | null)[]>([])
  const edgeShadow = useRef<SVGPathElement>(null)
  const edgeHi = useRef<SVGPathElement>(null)
  const photo = useRef<HTMLDivElement>(null)
  const soft = useRef<HTMLImageElement>(null)
  const shade = useRef<HTMLDivElement>(null)
  const hud = useRef<HTMLDivElement>(null)
  const readout = useRef<HTMLSpanElement>(null)
  const stops = useRef<HTMLOListElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const stage = el.querySelector<HTMLElement>('.vf-hero__stage')!

      const g = { vw: 0, vh: 0, s0: 1, s1: 1, p: 0, intro: 0, stop: -1, al: -1 }

      const layout = () => {
        g.vw = stage.clientWidth || innerWidth
        g.vh = stage.clientHeight || innerHeight
        const mobile = g.vw <= 768
        svg.current?.setAttribute('viewBox', `${-g.vw / 2} ${-g.vh / 2} ${g.vw} ${g.vh}`)
        // lens barrel (r = 150 units) fills ~84% of the short side; clear aperture ends past the corners
        g.s0 = (Math.min(g.vw, g.vh) * (mobile ? 0.94 : 0.8)) / 300
        g.s1 = Math.hypot(g.vw, g.vh) / 2 / 96
        // photo: cover the stage with the umbrella's tip on the optical axis
        const W = Math.max(g.vw * 1.34, g.vh * 1.08 * (PHOTO.w / PHOTO.h))
        const H = W / (PHOTO.w / PHOTO.h)
        const left = g.vw / 2 - FOCAL.x * W
        const top = g.vh / 2 - FOCAL.y * H
        if (photo.current) {
          Object.assign(photo.current.style, {
            width: `${W}px`,
            height: `${H}px`,
            left: `${left}px`,
            top: `${top}px`,
            transformOrigin: `${g.vw / 2 - left}px ${g.vh / 2 - top}px`,
          })
        }
      }

      const typeTl = gsap
        .timeline({ paused: true })
        .fromTo(
          '.vf-hero__name',
          { '--w': 125, opacity: 0, yPercent: 18 },
          { '--w': 62, opacity: 1, yPercent: 0, duration: 1, ease: 'power3.out' },
          0,
        )
        .fromTo('.vf-hero__headline', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.32)
        .fromTo('.vf-hero__rule', { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, 0.42)
        .fromTo('.vf-hero__line, .vf-hero__exif', { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.12 }, 0.6)

      const render = () => {
        const p = g.p
        const a = clamp(p / 0.7)
        const k = stair(a * (STOPS.length - 1), 0.36)
        const n = nForK(k)
        // open through the stops, then retract the last sliver under the lip
        let d = dForN(n) + 12 * smoothstep(0.7, 0.8, p)
        d *= g.intro
        const al = alphaFor(d)
        if (Math.abs(al - g.al) > 0.004) {
          g.al = al
          const A = al.toFixed(3)
          for (let i = 0; i < BLADES; i++) {
            const t = `rotate(${i * 40}) rotate(${-A} ${RP} 0)`
            blades.current[i]?.setAttribute('transform', t)
            edges.current[i]?.setAttribute('transform', t)
            // satin sheen stays put in world space while the blades swing
            grads.current[i]?.setAttribute('gradientTransform', `rotate(${A} ${RP} 0) rotate(${-i * 40})`)
          }
          const segs = edgeSegments(al, [1, 2])
          edgeShadow.current?.setAttribute('d', arcPath(segs, EDGE_R - 1.2))
          edgeHi.current?.setAttribute('d', arcPath(segs, EDGE_R + 0.25))
        }
        // zoom into the lens: geometric interpolation reads as constant speed
        const z = Math.pow(a, 1.7)
        const s = g.s0 * Math.pow(g.s1 / g.s0, z) * (0.94 + 0.06 * g.intro)
        lens.current?.setAttribute('transform', `scale(${s.toFixed(4)})`)
        knurl.current?.setAttribute('transform', `rotate(${(-p * 120 + (1 - g.intro) * 40).toFixed(2)})`)
        if (photo.current) photo.current.style.transform = `scale(${(1.24 - 0.24 * smoothstep(0, 0.82, p)).toFixed(4)})`
        if (soft.current) soft.current.style.opacity = String(1 - smoothstep(0.26, 0.74, p))
        if (shade.current) shade.current.style.opacity = String(smoothstep(0.64, 0.92, p))
        if (hud.current) {
          hud.current.style.opacity = String((1 - smoothstep(0.52, 0.66, p)) * g.intro)
          hud.current.style.visibility = p > 0.67 ? 'hidden' : ''
        }
        typeTl.progress(clamp((p - 0.68) / 0.25))
        const stop = Math.round(k)
        if (stop !== g.stop) {
          g.stop = stop
          const N = STOPS[stop]
          if (readout.current) readout.current.textContent = String(N)
          stops.current?.style.setProperty('--i', String(stop))
          stops.current?.querySelectorAll('li').forEach((li, j) => li.classList.toggle('is-on', j === stop))
          vf.set({ aperture: N })
        }
      }

      layout()
      const mm = gsap.matchMedia()
      mm.add(
        {
          desktop: '(min-width: 769px) and (prefers-reduced-motion: no-preference)',
          mobile: '(max-width: 768px) and (prefers-reduced-motion: no-preference)',
          reduce: '(prefers-reduced-motion: reduce)',
        },
        (ctx) => {
          const { reduce, mobile } = ctx.conditions as Record<string, boolean>
          if (reduce) {
            g.intro = 1
            g.p = 1
            el.classList.add('is-static')
            render()
            return () => el.classList.remove('is-static')
          }
          g.p = 0
          g.intro = 0
          render()
          const intro = gsap.to(g, { intro: 1, duration: 1.5, delay: 0.2, ease: 'expo.out', onUpdate: render })
          gsap.fromTo('.vf-hero__ringtext', { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 0.5, ease: 'power2.out' })
          const st = ScrollTrigger.create({
            trigger: stage,
            start: 'top top',
            end: mobile ? '+=110%' : '+=160%',
            pin: true,
            pinSpacing: true,
            onUpdate: (self) => {
              g.p = self.progress
              render()
            },
            onRefresh: (self) => {
              layout()
              g.p = self.progress
              render()
            },
          })
          return () => {
            intro.kill()
            st.kill()
          }
        },
      )
      const onResize = () => {
        layout()
        render()
      }
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    },
    { scope: root },
  )

  return (
    <section ref={root} id="vf-open" className="vf-hero" aria-labelledby="vf-hero-title">
      <div className="vf-hero__stage">
        <div ref={photo} className="vf-hero__photo">
          <img className="vf-hero__img" src={asset(PHOTO.src)} alt={`${PHOTO.title}. Placeholder photograph.`} width={PHOTO.w} height={PHOTO.h} fetchPriority="high" />
          <img ref={soft} className="vf-hero__img vf-hero__img--soft" src={asset(PHOTO.src)} alt="" aria-hidden="true" />
        </div>
        <div ref={shade} className="vf-hero__shade" />

        <svg ref={svg} className="vf-hero__iris" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <defs>
            {Array.from({ length: BLADES }, (_, i) => (
              <linearGradient
                key={i}
                id={`vf-bl-${i}`}
                ref={(n) => {
                  grads.current[i] = n
                }}
                gradientUnits="userSpaceOnUse"
                x1={-90}
                y1={-100}
                x2={80}
                y2={100}
              >
                <stop offset={0} stopColor="#3a3936" />
                <stop offset={0.3} stopColor="#232321" />
                <stop offset={0.55} stopColor="#141413" />
                <stop offset={0.8} stopColor="#1b1b1a" />
                <stop offset={1} stopColor="#2a2927" />
              </linearGradient>
            ))}
            <g id="vf-edge">
              <path ref={edgeShadow} fill="none" stroke="#000" strokeOpacity={0.5} strokeWidth={2.4} />
              <path ref={edgeHi} fill="none" stroke="currentColor" strokeWidth={0.42} />
            </g>
            <linearGradient id="vf-bevel" gradientUnits="userSpaceOnUse" x1={-150} y1={-150} x2={150} y2={150}>
              <stop offset={0} stopColor="#8d8b85" />
              <stop offset={0.42} stopColor="#2b2b29" />
              <stop offset={0.58} stopColor="#111" />
              <stop offset={1} stopColor="#55534e" />
            </linearGradient>
            <linearGradient id="vf-bevel-r" gradientUnits="userSpaceOnUse" x1={150} y1={150} x2={-150} y2={-150}>
              <stop offset={0} stopColor="#6f6d67" />
              <stop offset={0.45} stopColor="#1d1d1c" />
              <stop offset={0.6} stopColor="#0d0d0d" />
              <stop offset={1} stopColor="#3d3c39" />
            </linearGradient>
            <radialGradient id="vf-ring" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={128}>
              <stop offset={0.8} stopColor="#0b0b0b" />
              <stop offset={0.9} stopColor="#161615" />
              <stop offset={1} stopColor="#0e0e0e" />
            </radialGradient>
            <radialGradient id="vf-cast" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={190}>
              <stop offset={0.78} stopColor="#000" stopOpacity={0.9} />
              <stop offset={1} stopColor="#000" stopOpacity={0} />
            </radialGradient>
            <clipPath id="vf-iris-clip">
              <circle r={104} />
            </clipPath>
            <path id="vf-arc-top" d="M -112,0 A 112,112 0 0,1 112,0" />
            <path id="vf-arc-bot" d="M -119.5,0 A 119.5,119.5 0 0,0 119.5,0" />
          </defs>

          <g ref={lens}>
            {/* camera body around the lens */}
            <path d="M-3000,-3000H3000V3000H-3000Z M150,0A150,150 0 1,0 -150,0A150,150 0 1,0 150,0Z" fillRule="evenodd" fill="#0b0b0b" />
            <circle r={186} fill="none" stroke="url(#vf-cast)" strokeWidth={72} opacity={0.7} />

            {/* blades */}
            <g clipPath="url(#vf-iris-clip)">
              {Array.from({ length: BLADES }, (_, i) => (
                <g
                  key={i}
                  ref={(n) => {
                    blades.current[i] = n
                  }}
                >
                  <path d={BLADE_PATH} fill={`url(#vf-bl-${i})`} />
                </g>
              ))}
              {Array.from({ length: BLADES }, (_, i) => (
                <use
                  key={i}
                  href="#vf-edge"
                  ref={(n) => {
                    edges.current[i] = n
                  }}
                  color={`rgba(243,241,234,${(0.34 + 0.4 * bladeTone(i)).toFixed(2)})`}
                />
              ))}
            </g>

            {/* housing: lip, name ring, bevel, focus ring knurl, chrome edge */}
            <circle r={100.6} fill="none" stroke="#050505" strokeWidth={1.6} />
            <circle r={101.4} fill="none" stroke="url(#vf-bevel)" strokeWidth={0.5} />
            <circle r={114} fill="none" stroke="url(#vf-ring)" strokeWidth={26} />
            <circle r={104.6} fill="none" stroke="#000" strokeWidth={1.2} strokeOpacity={0.8} />
            <g className="vf-hero__ringtext">
              <text className="vf-hero__engrave" fontSize={5.2} letterSpacing={2.1}>
                <textPath href="#vf-arc-top" startOffset="50%" textAnchor="middle">{TEXT_TOP}</textPath>
              </text>
              <text className="vf-hero__engrave vf-hero__engrave--dim" fontSize={4.4} letterSpacing={2}>
                <textPath href="#vf-arc-bot" startOffset="50%" textAnchor="middle">{TEXT_BOT}</textPath>
              </text>
            </g>
            <circle r={127.4} fill="none" stroke="url(#vf-bevel)" strokeWidth={1.6} />
            <circle r={128.6} fill="none" stroke="#050505" strokeWidth={0.8} />
            <g ref={knurl}>
              <circle r={138.5} fill="none" stroke="#151514" strokeWidth={19} />
              <circle r={138.5} fill="none" stroke="#2c2c2a" strokeWidth={17} strokeDasharray="1.05 1.4" />
              <circle r={138.5} fill="none" stroke="url(#vf-bevel-r)" strokeWidth={17} strokeOpacity={0.35} />
            </g>
            <circle r={148.6} fill="none" stroke="url(#vf-bevel)" strokeWidth={2.4} />
            <circle r={150} fill="none" stroke="#000" strokeWidth={0.8} />
          </g>
        </svg>

        <div ref={hud} className="vf-hero__hud" aria-hidden="true">
          <div className="vf-hero__read">
            <span className="vf-engr">Aperture</span>
            <span className="vf-hero__fnum vf-mono">
              <i>f/</i>
              <span ref={readout}>16</span>
            </span>
            <span className="vf-engr vf-hero__hint">
              <span className="vf-hero__hintline" />
              Scroll to open
            </span>
          </div>
          <ol ref={stops} className="vf-hero__stops vf-mono">
            {STOPS.map((s, i) => (
              <li key={s} className={i === 0 ? 'is-on' : ''}>
                {s}
              </li>
            ))}
          </ol>
        </div>

        <div className="vf-hero__type">
          <div className="vf-hero__top">
            <p className="vf-engr vf-hero__line">
              {profile.role} · Photographer · {profile.location}
            </p>
            <p className="vf-hero__exif vf-engr">
              <span>Frame 00</span>
              <span>{PHOTO.title}</span>
              <span>{PHOTO.stock}</span>
              <span>{PHOTO.settings}</span>
            </p>
          </div>
          <span className="vf-hero__rule" aria-hidden="true" />
          <h1 id="vf-hero-title" className="vf-hero__name vf-display">
            {profile.name}
          </h1>
          <p className="vf-hero__headline">{profile.headline}</p>
        </div>
      </div>
    </section>
  )
}
