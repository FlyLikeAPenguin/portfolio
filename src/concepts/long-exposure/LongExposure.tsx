import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/fraunces/full-italic.css'
import '@fontsource-variable/inter-tight'
import './long-exposure.css'

import { useEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { useGSAP } from '@gsap/react'
import { useSmoothScroll, scrollTo, prefersReducedMotion } from '../../shared/useSmoothScroll'
import { profile, timeline, experiments, dayJob, streetPhotos, skyPhotos, asset, type Photo } from '../../content'
import Sky from './Sky'
import { ChapterOne, ChapterTwo, ChapterThree, ChapterFour } from './Chapters'
import { sky, SUNRISE } from './store'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin)

const NAV = [
  { id: '#le-work', label: 'Work' },
  { id: '#le-night', label: 'Night' },
  { id: '#le-log', label: 'Log' },
  { id: '#le-contact', label: 'Contact' },
]

/* ------------------------------------------------------------------ */

function TopBar({ readoutRef, meterRef, topRef }: { readoutRef: RefObject<HTMLSpanElement | null>; meterRef: RefObject<HTMLSpanElement | null>; topRef: RefObject<HTMLElement | null> }) {
  return (
    <header className="le-top" ref={topRef}>
      <a
        className="le-mark"
        href="#/long-exposure"
        onClick={(e) => {
          e.preventDefault()
          scrollTo(0)
        }}
      >
        <em>Joe</em> Thornton
      </a>
      <nav className="le-nav" aria-label="Sections">
        {NAV.map((n) => (
          <button key={n.id} type="button" className="le-nav-btn" onClick={() => scrollTo(n.id)}>
            {n.label}
          </button>
        ))}
      </nav>
      <div className="le-readout" role="group" aria-label="Exposure data">
        <span className="le-rec" aria-hidden="true" />
        <span className="le-readout-k">Exposure</span>
        <span className="le-readout-v" ref={readoutRef}>
          00:00:00
        </span>
        <span className="le-readout-sep" aria-hidden="true">
          ·
        </span>
        <span>f/2.8</span>
        <span className="le-readout-sep le-readout-hide-sm" aria-hidden="true">
          ·
        </span>
        <span className="le-readout-hide-sm">ISO 400</span>
        <span className="le-readout-sep le-readout-hide" aria-hidden="true">
          ·
        </span>
        <span className="le-readout-hide">14 mm</span>
        <span className="le-meter" aria-hidden="true">
          <span ref={meterRef} />
        </span>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="le-hero" aria-labelledby="le-name">
      <p className="le-meta le-hero-kicker">
        <span className="le-gold">Plate 001</span> <span className="le-rule" aria-hidden="true" /> North-facing, shutter open
      </p>
      <h1 className="le-hero-name le-display" id="le-name">
        <span className="le-mask">
          <span className="le-hero-l1">
            <em>Joe</em>
          </span>
        </span>
        <span className="le-mask">
          <span className="le-hero-l2">Thornton</span>
        </span>
      </h1>
      <div className="le-hero-foot">
        <p className="le-meta le-hero-roles">
          {profile.role} <span className="le-dot" aria-hidden="true" /> Photographer <span className="le-dot" aria-hidden="true" /> {profile.location}
        </p>
        <p className="le-hero-headline">{profile.headline}</p>
        <p className="le-hint">
          <span className="le-hint-line" aria-hidden="true">
            <span />
          </span>
          Keep scrolling. The shutter’s open.
        </p>
      </div>
    </section>
  )
}

function Interlude() {
  return (
    <section className="le-interlude" aria-label="Interlude">
      <p className="le-meta le-fade">f/2.8 · ISO 400 · 14 mm · tripod, remote release</p>
      <p className="le-interlude-line le-split">
        Everything below is one exposure. <em>Scrolling is time.</em>
      </p>
    </section>
  )
}

function OM1() {
  return (
    <svg className="le-om1" viewBox="0 0 220 132" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path className="le-draw" d="M18 50 H202 a8 8 0 0 1 8 8 V116 a8 8 0 0 1 -8 8 H18 a8 8 0 0 1 -8 -8 V58 a8 8 0 0 1 8 -8 Z" />
        <path className="le-draw" d="M84 50 L94 22 H126 L136 50" />
        <path className="le-draw" d="M30 50 V40 H54 V50 M150 50 V44 H158 V50 M166 50 V41 H192 V50" />
        <path className="le-draw" d="M10 64 H76 M144 64 H210 M10 110 H76 M144 110 H210" />
        <circle className="le-draw" cx="110" cy="88" r="34" />
        <circle className="le-draw" cx="110" cy="88" r="27" />
        <circle className="le-draw" cx="110" cy="88" r="17" />
        <circle className="le-draw" cx="110" cy="88" r="7" />
      </g>
      <text x="110" y="42" textAnchor="middle" className="le-om1-t">
        OM-1
      </text>
    </svg>
  )
}

function Prologue() {
  const [lead, second, third] = profile.bio
  const om1 = profile.cameras.find((c) => c.kind === 'Film')
  const digital = profile.cameras.find((c) => c.kind === 'Digital')
  return (
    <section className="le-prologue" id="le-prologue" aria-labelledby="le-prologue-h">
      <div className="le-prologue-side">
        <h2 className="le-meta le-gold le-fade" id="le-prologue-h">
          Prologue
        </h2>
        <figure className="le-prologue-fig le-fade">
          <OM1 />
          <figcaption className="le-caption">
            <span className="le-caption-k">Fig. 0</span> {om1?.name}. {om1?.detail} Most days it’s {digital?.kind.toLowerCase()}, especially under the night sky.
          </figcaption>
        </figure>
      </div>
      <div className="le-prologue-main">
        <p className="le-dropcap le-fade">{lead}</p>
        <p className="le-body le-prologue-second le-fade">{second}</p>
        <blockquote className="le-pull">
          <span className="le-pull-mark" aria-hidden="true">
            “
          </span>
          <p className="le-split">{third}</p>
        </blockquote>
      </div>
    </section>
  )
}

function Marginalia() {
  if (!experiments.length) return <section className="le-marg-empty" id="le-marginalia" aria-hidden="true" />
  return (
    <section className="le-marg" id="le-marginalia" aria-labelledby="le-marg-h">
      <div className="le-marg-head">
        <p className="le-meta le-gold le-fade">Notes in the margin</p>
        <h2 className="le-h2 le-display le-split" id="le-marg-h">
          <em>Marginalia</em>
        </h2>
        <p className="le-body le-fade">Smaller things, kept in the margin: experiments and side quests, each with a source.</p>
      </div>
      <ol className="le-notes">
        {experiments.map((p, i) => (
          <li className="le-note le-fade" key={p.slug}>
            <span className="le-note-n" aria-hidden="true">
              {['*', '†', '‡'][i] ?? i + 1}
            </span>
            <span className="le-note-year le-num">{p.year}</span>
            <span className="le-note-body">
              <span className="le-note-name">{p.name}</span>
              <span className="le-note-kind le-meta">{p.kind}</span>
              <span className="le-note-line">{p.oneLiner}</span>
            </span>
            <span className="le-note-links">
              {p.links.map((l) => (
                <a key={l.href} className="le-link le-link--small" href={l.href} target="_blank" rel="noreferrer">
                  <span>{l.label}</span>
                  <span className="le-link-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              ))}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

const credits = (photos: Photo[]) => [...new Set(photos.map((p) => p.credit.author))].join(', ')

function NightWork() {
  return (
    <section className="le-night" id="le-night" aria-labelledby="le-night-h">
      <header className="le-night-head">
        <p className="le-meta le-gold le-fade">Plates · digital</p>
        <h2 className="le-h2 le-display le-split" id="le-night-h">
          Night <em>work</em>
        </h2>
        <p className="le-body le-fade">The sky this page is pretending to be. Long exposures and stacks; each plate develops as you reach it.</p>
      </header>
      <div className="le-plates">
        {skyPhotos.map((ph, i) => (
          <figure className={`le-plate le-plate--${i}`} key={ph.src}>
            <div className="le-plate-img" style={{ aspectRatio: `${ph.w} / ${ph.h}` }}>
              <img src={asset(ph.src)} alt={ph.title} width={ph.w} height={ph.h} loading="lazy" decoding="async" />
            </div>
            <figcaption className="le-plate-cap">
              <span className="le-plate-n le-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="le-plate-title">{ph.title}</span>
              <span className="le-meta">
                {ph.stock} · {ph.settings}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="le-credits le-fade">Placeholder plates by {credits(skyPhotos)}, standing in for Joe’s own until the real ones are scanned.</p>
    </section>
  )
}

function Log() {
  return (
    <section className="le-log" id="le-log" aria-labelledby="le-log-h">
      <header className="le-log-head">
        <p className="le-meta le-gold le-fade">Career · {timeline[0].year} → now</p>
        <h2 className="le-h2 le-display le-split" id="le-log-h">
          Log of the <em>night</em>
        </h2>
      </header>
      <div className="le-log-body">
        <div className="le-log-track">
          <span className="le-log-line" aria-hidden="true">
            <span className="le-log-fill" />
          </span>
          <ol className="le-log-list">
            {timeline.map((e, i) => {
              const repeat = i > 0 && timeline[i - 1].year === e.year
              return (
                <li className={`le-log-item${e.place === 'Tokyo' ? ' is-tokyo' : ''}`} key={`${e.year}-${e.title}`}>
                  <span className="le-log-tick" aria-hidden="true" />
                  <span className={`le-log-year le-num${repeat ? ' is-ditto' : ''}`}>{e.year}</span>
                  <div className="le-log-text">
                    <h3 className="le-log-title">{e.title}</h3>
                    <p className="le-meta">{e.place}</p>
                    <p className="le-log-detail">{e.detail}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
        <aside className="le-dayjob le-fade" aria-labelledby="le-dayjob-h">
          <p className="le-meta le-gold">The day job</p>
          <h3 className="le-dayjob-title" id="le-dayjob-h">
            {dayJob.title}
          </h3>
          <p className="le-meta">{dayJob.place}</p>
          <p className="le-body">{dayJob.summary}</p>
          <dl className="le-stats le-stats--job">
            {dayJob.stats.map((s) => (
              <div className="le-stat" key={s.label}>
                <dt className="le-meta">{s.label}</dt>
                <dd className="le-stat-v">{s.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  )
}

function DriftRow({ photos, reverse }: { photos: Photo[]; reverse?: boolean }) {
  const item = (ph: Photo, k: string, hidden: boolean) => (
    <li className="le-drift-item" key={k} aria-hidden={hidden || undefined} style={{ aspectRatio: `${ph.w} / ${ph.h}` }}>
      <figure>
        <img src={asset(ph.src)} alt={hidden ? '' : ph.title} width={ph.w} height={ph.h} loading="lazy" decoding="async" />
        <figcaption className="le-drift-cap">
          <span className="le-drift-title">{ph.title}</span>
          <span className="le-meta">
            {ph.kind === 'film' ? 'OM-1' : 'Digital'} · {ph.stock} · {ph.settings}
          </span>
        </figcaption>
      </figure>
    </li>
  )
  return (
    <div className={`le-drift-row${reverse ? ' is-reverse' : ''}`}>
      <ul className="le-drift-track">
        {photos.map((ph) => item(ph, ph.src, false))}
        {photos.map((ph) => item(ph, `${ph.src}-dup`, true))}
      </ul>
    </div>
  )
}

function Daylight() {
  const half = Math.ceil(streetPhotos.length / 2)
  const driftRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = driftRef.current
    if (!el) return
    // The marquee only runs while it can be seen.
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-offscreen', !e.isIntersecting), { rootMargin: '10% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <section className="le-day" id="le-daylight" aria-labelledby="le-day-h">
      <header className="le-day-head">
        <p className="le-meta le-gold le-fade">Frames · mostly film</p>
        <h2 className="le-h2 le-display le-split" id="le-day-h">
          Day<em>light</em>
        </h2>
        <p className="le-body le-fade">When the sky gives up, the streets take over. Mostly digital, with the odd roll through a 1972 OM-1.</p>
      </header>
      <div className="le-drift is-offscreen" ref={driftRef}>
        <DriftRow photos={streetPhotos.slice(0, half)} />
        <DriftRow photos={streetPhotos.slice(half)} reverse />
      </div>
      <p className="le-credits le-fade">Placeholder frames by {credits(streetPhotos)}.</p>
    </section>
  )
}

function Contact() {
  const { links } = profile
  const social = [
    { label: 'GitHub', href: links.github },
    { label: 'LinkedIn', href: links.linkedin },
    { label: 'Instagram', href: links.instagram },
  ]
  return (
    <section className="le-contact" id="le-contact" aria-labelledby="le-contact-h">
      <p className="le-meta le-gold le-fade">Dawn · Contact</p>
      <h2 className="le-contact-title le-display le-split" id="le-contact-h">
        Let’s make <em>something.</em>
      </h2>
      <div className="le-contact-row">
        <a className="le-email le-fade" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        <ul className="le-social le-fade">
          {social.map((s) => (
            <li key={s.label}>
              <a className="le-link" href={s.href} target="_blank" rel="noreferrer">
                <span>{s.label}</span>
                <span className="le-link-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <footer className="le-colophon">
        <p className="le-colophon-big">
          Exposure complete. <span className="le-num">{SUNRISE}</span> sunrise.
        </p>
        <p className="le-meta">Set in Fraunces &amp; Inter Tight · The sky is drawn live: every star an analytic arc around the pole, scroll as shutter time · © {new Date().getFullYear()} {profile.name}</p>
      </footer>
    </section>
  )
}

/* ------------------------------------------------------------------ */

export default function LongExposure() {
  const rootRef = useRef<HTMLDivElement>(null)
  const readoutRef = useRef<HTMLSpanElement>(null)
  const meterRef = useRef<HTMLSpanElement>(null)
  const topRef = useRef<HTMLElement>(null)
  useSmoothScroll()

  useEffect(() => {
    const prev = document.body.style.background
    document.body.style.background = '#070912'
    sky.still = prefersReducedMotion()
    let alive = true
    document.fonts?.ready.then(() => alive && ScrollTrigger.refresh())
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => {
      alive = false
      window.removeEventListener('load', onLoad)
      document.body.style.background = prev
      sky.progress = 0
      sky.dawn = 0
      sky.sats = [0, 0, 0]
      sky.meteorAt = 0
      sky.meteorSeen = false
    }
  }, [])

  useGSAP(
    (_context, contextSafe) => {
      const root = rootRef.current!
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()

      // 1. The pinned horizontal gallery comes first so later triggers measure the pin spacing.
      mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
        const track = q('.le-hg-row')[0] as HTMLElement
        const pinEl = q('.le-hg')[0] as HTMLElement
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth)
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: { trigger: pinEl, start: 'top top', end: () => `+=${distance() * 0.72}`, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
        })
        q('.le-hg-frame img').forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -5 },
            { xPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } },
          )
        })
        gsap.to(q('.le-hg-arrow'), { x: 8, repeat: -1, yoyo: true, duration: 1.1, ease: 'sine.inOut' })
      })

      // 2. Sky state: page progress (exposure), dawn, satellites, meteor. Always on (colour isn't motion).
      const setP = (s: ScrollTrigger) => void (sky.progress = s.progress)
      // refreshPriority -1: measure after the pin above has added its spacing.
      ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom bottom', refreshPriority: -1, onUpdate: setP, onRefresh: setP })
      const setD = (s: ScrollTrigger) => void (sky.dawn = s.progress)
      ScrollTrigger.create({ trigger: '#le-log', start: 'top bottom', endTrigger: root, end: 'bottom bottom', refreshPriority: -1, onUpdate: setD, onRefresh: setD })
      const passes: [string, string, string][] = [
        ['.le-interlude', 'top 85%', 'bottom 15%'],
        ['#le-satboard', 'top 75%', 'center top'],
        ['#le-night', 'top 70%', '30% top'],
      ]
      passes.forEach(([trigger, start, end], i) => {
        const set = (s: ScrollTrigger) => void (sky.sats[i] = s.progress)
        ScrollTrigger.create({ trigger, start, end, onUpdate: set, onRefresh: set })
      })
      ScrollTrigger.create({
        trigger: '#le-marginalia',
        start: 'top 55%',
        onEnter: () => {
          sky.meteorAt = performance.now()
          sky.meteorSeen = true
        },
        onLeaveBack: () => {
          sky.meteorAt = 0
          sky.meteorSeen = false
        },
      })

      // 3. Reveals. Slow, elegant, never bouncy.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const intro = gsap.timeline({ delay: 0.2 })
        intro
          .from(q('.le-hero-name .le-mask > span'), { yPercent: 118, duration: 1.7, ease: 'expo.out', stagger: 0.13 })
          .from(q('.le-hero-kicker, .le-hero-roles, .le-hero-headline, .le-hint'), { autoAlpha: 0, y: 16, duration: 1.2, ease: 'power3.out', stagger: 0.08 }, 0.5)
          .from(q('.le-top'), { autoAlpha: 0, duration: 1.2, ease: 'power2.out' }, 0.7)
          .from(q('.le-hint-line > span'), { scaleX: 0, duration: 1.1, ease: 'expo.inOut' }, 0.9)

        gsap.to(q('.le-hero-name'), {
          yPercent: -16,
          ease: 'none',
          scrollTrigger: { trigger: q('.le-hero')[0], start: 'top top', end: 'bottom top', scrub: true },
        })
        gsap.to(q('.le-hero-foot, .le-hero-kicker'), {
          autoAlpha: 0,
          y: -40,
          ease: 'none',
          scrollTrigger: { trigger: q('.le-hero')[0], start: '30% top', end: '85% top', scrub: true },
        })

        // Split into masked lines only once the exact faces are in: italic Fraunces is wider than any
        // fallback, and lines measured early would re-wrap inside their masks.
        const splitAll = contextSafe!(() => {
          q('.le-split').forEach((el) => {
            SplitText.create(el, {
              type: 'lines',
              mask: 'lines',
              linesClass: 'le-sl',
              autoSplit: true,
              onSplit: (self) =>
                gsap.from(self.lines, {
                  yPercent: 115,
                  duration: 1.6,
                  ease: 'expo.out',
                  stagger: 0.09,
                  scrollTrigger: { trigger: el, start: 'top 88%', once: true },
                }),
            })
          })
          ScrollTrigger.refresh()
        })
        const faces = ['300 1em "Fraunces Variable"', 'italic 300 1em "Fraunces Variable"', '400 1em "Inter Tight Variable"']
        Promise.all(faces.map((f) => document.fonts.load(f)))
          .catch(() => undefined)
          .then(() => {
            if (rootRef.current) splitAll()
          })

        gsap.set(q('.le-fade'), { autoAlpha: 0, y: 26 })
        ScrollTrigger.batch(q('.le-fade'), {
          start: 'top 92%',
          once: true,
          onEnter: (els) => {
            // A jump (nav, reload) can enter dozens at once: show what's already behind us, stagger only what's in view.
            const behind = els.filter((e) => e.getBoundingClientRect().bottom < 0)
            const inView = els.filter((e) => !behind.includes(e))
            if (behind.length) gsap.set(behind, { autoAlpha: 1, y: 0, overwrite: true })
            if (inView.length) gsap.to(inView, { autoAlpha: 1, y: 0, duration: 1.4, ease: 'power3.out', stagger: Math.min(0.08, 0.48 / inView.length), overwrite: true })
          },
        })

        // Images: vertical clip wipe + inner parallax.
        q('.le-frame').forEach((frame) => {
          const img = frame.querySelector('img')
          gsap.fromTo(
            frame,
            { clipPath: 'inset(100% 0% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'expo.inOut', scrollTrigger: { trigger: frame, start: 'top 88%', once: true } },
          )
          if (img)
            gsap.fromTo(
              img,
              { scale: 1.15, yPercent: -4 },
              { scale: 1, yPercent: 0, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } },
            )
        })

        // The Satboard globe drifts up out of the horizon and turns a few degrees.
        gsap.fromTo(
          q('.le-ch3-globe-in'),
          { yPercent: 14, rotate: -6 },
          { yPercent: -4, rotate: 4, ease: 'none', scrollTrigger: { trigger: q('.le-ch3-globe')[0], start: 'top bottom', end: 'bottom 30%', scrub: true } },
        )
        gsap.from(q('.le-ch3-globe'), { autoAlpha: 0, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: q('.le-ch3-globe')[0], start: 'top 85%', once: true } })

        // Night plates "expose": brightness ramps up as if the shutter stays open longer.
        q('.le-plate').forEach((plate) => {
          const img = plate.querySelector('img')
          const tl = gsap.timeline({ scrollTrigger: { trigger: plate, start: 'top 98%', end: 'top 30%', scrub: true } })
          tl.fromTo(img, { filter: 'brightness(0.02) saturate(0.4)' }, { filter: 'brightness(1) saturate(1)', ease: 'power1.in' }, 0)
          tl.fromTo(plate.querySelector('.le-plate-cap'), { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none', duration: 0.5 }, 0.5)
        })

        // Log: a thin gold line draws down with scroll; entries light up as it reaches them.
        gsap.fromTo(
          q('.le-log-fill'),
          { scaleY: 0 },
          { scaleY: 1, ease: 'none', scrollTrigger: { trigger: q('.le-log-list')[0], start: 'top 65%', end: 'bottom 65%', scrub: true } },
        )
        q('.le-log-item').forEach((item) => {
          ScrollTrigger.create({ trigger: item, start: 'top 66%', toggleClass: { targets: item, className: 'is-lit' } })
        })

        // Prologue line drawing of the OM-1.
        gsap.from(q('.le-om1 .le-draw'), {
          drawSVG: '0%',
          duration: 2.4,
          ease: 'power2.inOut',
          stagger: 0.12,
          scrollTrigger: { trigger: q('.le-om1')[0], start: 'top 85%', once: true },
        })

        // Chapter numerals drift a touch slower than the page.
        q('.le-numeral').forEach((n) => {
          gsap.fromTo(n, { yPercent: 18 }, { yPercent: -18, ease: 'none', scrollTrigger: { trigger: n, start: 'top bottom', end: 'bottom top', scrub: true } })
        })
      })

      ScrollTrigger.sort()
      ScrollTrigger.refresh()
    },
    { scope: rootRef },
  )

  return (
    <div className="le" ref={rootRef}>
      <Sky readoutRef={readoutRef} meterRef={meterRef} topRef={topRef} />
      <TopBar readoutRef={readoutRef} meterRef={meterRef} topRef={topRef} />
      <main className="le-main">
        <Hero />
        <Interlude />
        <Prologue />
        <ChapterOne />
        <ChapterTwo />
        <ChapterThree />
        <ChapterFour />
        <Marginalia />
        <NightWork />
        <Log />
        <Daylight />
        <Contact />
      </main>
    </div>
  )
}
