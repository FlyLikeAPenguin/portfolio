import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { SplitText } from 'gsap/SplitText'
import { profile } from '../../content'
import { scrollTo } from '../../shared/useSmoothScroll'
import { GreaseUnderline } from './marks'
import { LinkArrow } from './film'

const f = (n: number) => Number(n.toFixed(2))
const PITCH = 4.75
const holes = (from: number, to: number, both: (x: number) => boolean) => {
  let d = ''
  for (let x = 0.975; x < to; x += PITCH) {
    if (x < from) continue
    const rr = (y: number) => `M${f(x + 0.44)} ${y}h1.92a.44.44 0 0 1 .44.44v1.1a.44.44 0 0 1-.44.44h-1.92a.44.44 0 0 1-.44-.44v-1.1a.44.44 0 0 1 .44-.44z`
    d += rr(31.1)
    if (both(x)) d += rr(1.92)
  }
  return d
}
const LEADER =
  'M150 0H31.2C27.4 0 26.6 2.6 25.4 5.6C24 9.4 22 11.8 17.4 11.8H3.6C1.5 11.8 0 13.4 0 15.6V35H150Z' + holes(0.5, 148, (x) => x > 31.6)

/** A 35mm canister with its leader pulled out. Decorative. */
function Canister() {
  return (
    <svg className="cs-can" viewBox="0 0 1000 420" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="cs-can-metal" x1="0" x2="1">
          <stop offset="0" stopColor="#3a3530" />
          <stop offset="0.16" stopColor="#d9d4ca" />
          <stop offset="0.32" stopColor="#8d877d" />
          <stop offset="0.62" stopColor="#4a453f" />
          <stop offset="0.86" stopColor="#bdb7ac" />
          <stop offset="1" stopColor="#2a2622" />
        </linearGradient>
        <linearGradient id="cs-can-shade" x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="0.2" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.38" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.75" stopColor="#000" stopOpacity="0.18" />
          <stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      <g className="cs-can__film">
        <g transform="translate(-60 105) scale(6)">
          <path d={LEADER} fillRule="evenodd" fill="#0d0b0a" />
          <g fill="#f2a33a" opacity="0.85">
            {[0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1].map((b, i) =>
              b ? <rect key={i} x={36 + i * 0.7} y={33.25} width={0.5} height={1.1} /> : null,
            )}
            <text x="52" y="2.05" fontSize="1.25" fontFamily="DM Mono, monospace" letterSpacing="0.12">
              KODAK PORTRA 400
            </text>
            <text x="58" y="34.35" fontSize="1.25" fontFamily="DM Mono, monospace">
              ▸ 00
            </text>
          </g>
        </g>
      </g>

      <g className="cs-can__body">
        {/* spool knob */}
        <rect x="772" y="26" width="46" height="38" rx="3" fill="url(#cs-can-metal)" />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={777 + i * 4.6} x2={777 + i * 4.6} y1="30" y2="60" stroke="#1a1714" strokeOpacity="0.35" />
        ))}
        {/* caps */}
        <rect x="690" y="60" width="210" height="26" rx="5" fill="url(#cs-can-metal)" />
        <rect x="690" y="334" width="210" height="26" rx="5" fill="url(#cs-can-metal)" />
        <rect x="780" y="360" width="30" height="12" rx="2" fill="url(#cs-can-metal)" />
        {/* body + label */}
        <rect x="700" y="84" width="190" height="252" fill="#1a1714" />
        <rect x="700" y="96" width="190" height="228" fill="#f2a33a" />
        <rect x="700" y="96" width="190" height="34" fill="#1a1714" />
        <rect x="700" y="290" width="190" height="34" fill="#e0412b" />
        <text x="795" y="242" textAnchor="middle" fontFamily="Instrument Serif, serif" fontStyle="italic" fontSize="88" fill="#1a1714">
          400
        </text>
        <text x="795" y="170" textAnchor="middle" fontFamily="DM Mono, monospace" fontSize="21" letterSpacing="5" fill="#1a1714">
          PORTRA
        </text>
        <text x="795" y="275" textAnchor="middle" fontFamily="DM Mono, monospace" fontSize="14" letterSpacing="3" fill="#1a1714">
          36 EXP · C-41
        </text>
        <text x="795" y="119" textAnchor="middle" fontFamily="DM Mono, monospace" fontSize="12" letterSpacing="4" fill="#f2a33a">
          ROLL Nº 01
        </text>
        <rect x="700" y="84" width="190" height="252" fill="url(#cs-can-shade)" />
        {/* felt light-trap lip */}
        <rect x="686" y="92" width="22" height="236" rx="6" fill="#0d0b0a" />
        <rect x="700" y="96" width="6" height="228" fill="#2a1f1a" />
      </g>
    </svg>
  )
}

export default function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', mobile: '(max-width: 768px)' },
        (ctx) => {
          const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean }
          if (!motion) {
            gsap.set('.cs-hero__leak', { autoAlpha: 0 })
            return
          }
          const split = SplitText.create('.cs-hero__name', { type: 'chars', charsClass: 'cs-ch' })
          // built paused (from-states apply immediately), played once fonts are in and a frame has painted
          const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
          tl.from(split.chars, {
            opacity: 0,
            filter: 'blur(14px)',
            yPercent: 6,
            duration: 1.15,
            stagger: { each: 0.045, from: 'start' },
          })
            .from('.cs-hero__line', { opacity: 0, filter: 'blur(10px)', duration: 1, ease: 'power2.out' }, 0.45)
            .from('.cs-hero__meta > *, .cs-hero__foot > *', { opacity: 0, y: 12, duration: 0.7, stagger: 0.06 }, 0.6)
            .from('.cs-can', { xPercent: 16, rotation: -2, opacity: 0, duration: 1.2, ease: 'expo.out' }, 0.25)
            .from('.cs-hero .cs-gp', { drawSVG: '0%', duration: 0.6, ease: 'power1.inOut' }, 1.15)
            .from('.cs-hero .cs-hero__aside', { opacity: 0, duration: 0.4 }, 1.25)

          // the light leak: one warm sweep, done in 1.5s
          const leak = gsap.timeline()
          leak
            .fromTo(
              '.cs-hero__leak',
              { xPercent: -70, rotation: -8, autoAlpha: 0 },
              { xPercent: 150, rotation: 6, duration: 1.5, ease: 'power2.inOut' },
            )
            .to('.cs-hero__leak', { autoAlpha: 1, duration: 0.35, ease: 'power1.out' }, 0)
            .to('.cs-hero__leak', { autoAlpha: 0, duration: 0.5, ease: 'power1.in' }, 1.0)
          tl.add(leak, 0.05)

          let started = false
          const start = () => {
            if (started) return
            started = true
            tl.play(0)
          }
          const fallback = window.setTimeout(start, 1200)
          Promise.all([
            document.fonts.load('400 100px "Instrument Serif"'),
            document.fonts.load('italic 400 100px "Instrument Serif"'),
          ])
            .catch(() => undefined)
            .then(() => requestAnimationFrame(() => requestAnimationFrame(start)))

          // scroll: the leader pulls out of the canister, the name drifts
          gsap.to('.cs-can__film', {
            x: mobile ? -40 : -110,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
          })
          gsap.to('.cs-can', {
            yPercent: mobile ? -6 : -14,
            rotation: -9,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
          })
          gsap.to('.cs-hero__title', {
            yPercent: -12,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
          })
          return () => window.clearTimeout(fallback)
        },
      )
    },
    { scope: root },
  )

  return (
    <section className="cs-hero" ref={root} aria-labelledby="cs-hero-title">
      <span className="cs-crop cs-crop--tl" aria-hidden="true" />
      <span className="cs-crop cs-crop--tr" aria-hidden="true" />
      <span className="cs-crop cs-crop--bl" aria-hidden="true" />
      <span className="cs-crop cs-crop--br" aria-hidden="true" />

      <div className="cs-hero__meta">
        <span>Portfolio · Roll Nº 01</span>
        <span className="cs-hero__meta-mid">Loaded in an {profile.cameras[0]?.name ?? 'Olympus OM-1'}</span>
        <span>36 exp. · {profile.location}</span>
      </div>

      <h1 className="cs-hero__title" id="cs-hero-title">
        <span className="cs-hero__name">
          <span className="cs-hero__first">{profile.firstName}</span>{' '}
          <span className="cs-hero__last">{profile.name.replace(profile.firstName, '').trim()}</span>
        </span>
        <span className="cs-hero__line">
          writes software, <span className="cs-hero__shoots">shoots pictures.<GreaseUnderline /></span>
          <span className="cs-hero__aside" aria-hidden="true">
            (in that order, mostly)
          </span>
        </span>
      </h1>

      <div className="cs-hero__foot">
        <p className="cs-hero__headline">{profile.headline}</p>
        <p className="cs-hero__where">
          {profile.role}
          <br />
          {profile.location}
        </p>
        <button className="cs-hero__cue" onClick={() => scrollTo('#cs-work')}>
          <span>Advance the film</span>
          <LinkArrow dir="down" />
        </button>
      </div>

      <Canister />
      <span className="cs-hero__leak cs-hero__burn" aria-hidden="true" />
      <span className="cs-hero__leak cs-hero__glow" aria-hidden="true" />
      <div className="cs-hero__residue" aria-hidden="true" />
    </section>
  )
}
