import '@fontsource/ibm-plex-sans-condensed/300.css'
import '@fontsource/ibm-plex-sans-condensed/400.css'
import '@fontsource/ibm-plex-sans-condensed/500.css'
import '@fontsource/ibm-plex-sans-condensed/600.css'
import '@fontsource/ibm-plex-mono/300.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './gs.css'

import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { useSmoothScroll } from '../lib/useSmoothScroll'
import { CHARS_ALPHA, ScrollTrigger, SplitText, countUp, gsap, noiseTile, scrambleIn } from './fx'
import { PASS_STATIONS, blockRange, buildKeys, type Key } from './plan'
import { STATIONS } from './scene/orbit'

// three.js is the bulk of the bundle: load it after the text so the page reads straight away.
const Scene = lazy(() => import('./scene/Scene'))
import { S, makeShot } from './store'
import { useMedia } from './useMedia'
import Boot from './ui/Boot'
import Hud from './ui/Hud'
import Marks from './ui/Marks'
import Hero from './sections/Hero'
import { PassCountdown, PassGenki, PassNitpick, PassQuibble, PassSatboard, Transit } from './sections/Passes'
import { Optical } from './sections/Optical'
import { Contact, Ground } from './sections/Tail'

const p2 = (n: number) => String(n).padStart(2, '0')
const CHIP = { wait: 'Awaiting signal', aos: 'AOS · Signal acquired', los: 'LOS · Loss of signal' } as const
type LinkState = keyof typeof CHIP

export default function GroundStation() {
  const root = useRef<HTMLDivElement>(null)
  useSmoothScroll()
  const mobile = useMedia('(max-width: 768px)')
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  S.mobile = mobile
  S.reduced = reduced
  const [booted, setBooted] = useState(false)
  const live = booted || reduced

  // Page chrome: base colour for overscroll, generated grain, fresh scene state per visit.
  useEffect(() => {
    const prev = document.body.style.background
    document.body.style.background = '#05070b'
    root.current?.style.setProperty('--noise', `url(${noiseTile()})`)
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => {
      document.body.style.background = prev
      S.reveal.v = 0
      S.ready = false
    }
  }, [])

  useEffect(() => {
    if (reduced) S.reveal.v = 1
  }, [reduced])

  // The flight plan: one paused timeline over the whole page, keyed to each block's scroll range.
  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const keys = buildKeys(mobile)
      Object.assign(S.target, keys.hero.A)
      Object.assign(S.cur, makeShot({ ...keys.hero.A, dist: keys.hero.A.dist * 1.55, u: keys.hero.A.u - 0.25 }))
      if (reduced) {
        // Static scene: no camera moves, just a darker backdrop once the content starts.
        Object.assign(S.cur, keys.hero.A)
        const rst = ScrollTrigger.create({
          trigger: '#gs-p1',
          start: 'top bottom',
          endTrigger: el,
          end: 'bottom bottom',
          onToggle: (self) => {
            S.target.dim = self.isActive ? 0.62 : 0
            S.target.veil = self.isActive ? 0.8 : keys.hero.A.veil
          },
        })
        return () => rst.kill()
      }
      let tl: gsap.core.Timeline | null = null
      const build = () => {
        const vh = window.innerHeight
        const marks: { y0: number; y1: number; k: Key }[] = []
        let last = -1
        for (const b of gsap.utils.toArray<HTMLElement>('[data-shot]', el)) {
          const id = b.dataset.shot ?? ''
          const k = keys[id]
          if (!k) continue
          const r = b.getBoundingClientRect()
          const top = r.top + window.scrollY
          let [y0, y1] = blockRange(id, top, r.height, vh)
          y0 = Math.max(y0, last + 1)
          y1 = Math.max(y1, y0)
          marks.push({ y0, y1, k })
          last = y1
        }
        tl?.kill()
        const t = gsap.timeline({ paused: true })
        t.set(S.target, { ...marks[0].k.A }, 0)
        let prev = marks[0].k.A
        let prevY = marks[0].y0
        for (const m of marks) {
          if (m.y0 > prevY) t.fromTo(S.target, { ...prev }, { ...m.k.A, duration: m.y0 - prevY, ease: 'sine.inOut', immediateRender: false }, prevY)
          if (m.y1 > m.y0) t.fromTo(S.target, { ...m.k.A }, { ...m.k.B, duration: m.y1 - m.y0, ease: 'none', immediateRender: false }, m.y0)
          prev = m.k.B
          prevY = Math.max(m.y1, m.y0)
        }
        t.time(window.scrollY)
        tl = t
      }
      build()
      ScrollTrigger.addEventListener('refresh', build)
      const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => tl?.time(self.scroll()) })
      return () => {
        ScrollTrigger.removeEventListener('refresh', build)
        st.kill()
        tl?.kill()
      }
    },
    { scope: root, dependencies: [mobile, reduced] },
  )

  // Passes: AOS/LOS chips, HUD state, text streaming in, counters, reveals.
  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const motion = !reduced
      const q = (s: string, scope: ParentNode = el) => Array.from(scope.querySelectorAll<HTMLElement>(s))
      const hudPass = el.querySelector<HTMLElement>('[data-hud-pass]')
      const hudStn = el.querySelector<HTMLElement>('[data-hud-stn]')
      const hudSec = el.querySelector<HTMLElement>('[data-hud-sec]')
      const hud = el.querySelector<HTMLElement>('.gs-hud')

      const setChip = (chip: HTMLElement, state: LinkState) => {
        if (chip.dataset.state === state) return
        chip.dataset.state = state
        const t = chip.querySelector<HTMLElement>('.gs-chip__t, span:last-child')
        if (!t) return
        if (motion) gsap.to(t, { duration: 0.55, scrambleText: { text: CHIP[state], chars: CHARS_ALPHA, speed: 1 }, overwrite: true })
        else t.textContent = CHIP[state]
      }
      const setLink = (state: LinkState, stn: string) => {
        const link = S.hud.link
        if (link) link.dataset.state = state
        const lt = S.hud.linkText
        if (lt) {
          const text = state === 'aos' ? `AOS · ${stn}` : state === 'los' ? `LOS · ${stn}` : 'No link'
          if (motion) gsap.to(lt, { duration: 0.5, scrambleText: { text, chars: CHARS_ALPHA, speed: 1 }, overwrite: true })
          else lt.textContent = text
        }
      }

      const reveal = (scope: HTMLElement) => {
        if (scope.dataset.rx === '1') return
        scope.dataset.rx = '1'
        if (!motion) return
        q('[data-scr]', scope).forEach((n, i) => scrambleIn(n, 0.7).delay(i * 0.07))
        q('[data-stream]', scope).forEach((p, i) => {
          p.dataset.streamDone = '1'
          const sp = SplitText.create(p, { type: 'words' })
          gsap.from(sp.words, {
            opacity: 0,
            duration: 0.22,
            ease: 'none',
            delay: 0.1 + i * 0.12,
            stagger: { amount: 0.55 },
            onComplete: () => sp.revert(),
          })
        })
        q('[data-count]', scope).forEach((n, i) => {
          n.dataset.countDone = '1'
          countUp(n, 0.8).delay(0.15 + i * 0.06)
        })
      }

      q('[data-pass]').forEach((sec) => {
        const n = Number(sec.dataset.pass)
        const stn = STATIONS[PASS_STATIONS[n - 1]].id
        const chip = sec.querySelector<HTMLElement>('.gs-passhead .gs-chip')
        const scope = sec.querySelector<HTMLElement>('.gs-stage') ?? sec
        ScrollTrigger.create({
          trigger: sec,
          start: 'top 62%',
          end: 'bottom 30%',
          onToggle: (self) => {
            const state: LinkState = self.isActive ? 'aos' : self.progress >= 1 ? 'los' : 'wait'
            if (chip) setChip(chip, state)
            setLink(state, stn)
            if (self.isActive) reveal(scope)
          },
        })
      })

      q('[data-sec]').forEach((sec) => {
        ScrollTrigger.create({
          trigger: sec,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => {
            if (!self.isActive) return
            if (hudSec) hudSec.textContent = `${sec.dataset.sec} · ${sec.dataset.secLabel ?? ''}`
            const pn = sec.dataset.pass ? Number(sec.dataset.pass) : 0
            if (pn && hudPass) hudPass.innerHTML = `${p2(pn)}<i>/06</i>`
            if (pn && hudStn) hudStn.textContent = STATIONS[PASS_STATIONS[pn - 1]].id
            if (sec.id === 'gs-hero' && hudPass && hudStn) {
              hudPass.innerHTML = `--<i>/06</i>`
              hudStn.textContent = '---'
            }
          },
        })
      })

      // Headings and counters outside the pass stages resolve when they scroll in.
      q('[data-scr]')
        .filter((n) => !n.closest('[data-pass]') && !n.closest('.gs-hero'))
        .forEach((n) => {
          if (!motion) return
          ScrollTrigger.create({ trigger: n, start: 'top 86%', once: true, onEnter: () => scrambleIn(n, 0.75) })
        })
      q('[data-count]')
        .filter((n) => !n.closest('.gs-stage') && !n.closest('.gs-pass--ground'))
        .forEach((n) => {
          if (!motion) return
          ScrollTrigger.create({
            trigger: n,
            start: 'top 90%',
            once: true,
            onEnter: () => {
              n.dataset.countDone = '1'
              countUp(n, 0.8)
            },
          })
        })

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Gentle rise for lists and table rows.
        gsap.set(q('[data-reveal]'), { opacity: 0 })
        ScrollTrigger.batch(q('[data-reveal]'), {
          start: 'top 92%',
          once: true,
          onEnter: (batch) => gsap.fromTo(batch, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, overwrite: true }),
        })

        // Transit progress bars.
        q('[data-scrub-bar] i').forEach((bar) => {
          gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: bar.closest('.gs-transit'), start: 'top bottom', end: 'bottom top', scrub: true } })
        })
      })

      // Page progress drives the HUD ruler and the edge ticks.
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          if (hud) {
            hud.style.setProperty('--prog', self.progress.toFixed(4))
            hud.style.setProperty('--tick', `${(-(self.scroll() * 0.35) % 48).toFixed(1)}px`)
          }
        },
      })

      return () => mm.revert()
    },
    { scope: root, dependencies: [reduced] },
  )

  return (
    <div className="gs" ref={root} data-motion={reduced ? '0' : '1'} data-live={live ? '1' : '0'}>
      <svg className="gs-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <filter id="gs-ch-r" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
        </filter>
        <filter id="gs-ch-g" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" />
        </filter>
        <filter id="gs-ch-b" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" />
        </filter>
      </svg>

      <Suspense fallback={null}>
        <Scene mobile={mobile} />
      </Suspense>
      <Marks />
      <div
        className="gs-veil"
        aria-hidden="true"
        ref={(n) => {
          S.scrimVeil = n
        }}
      />
      <div
        className="gs-dimmer"
        aria-hidden="true"
        ref={(n) => {
          S.scrimDim = n
        }}
      />
      <div className="gs-frame" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      <main className="gs-main">
        <Hero booted={live} />
        <Transit id="t0" next={0} />
        <PassQuibble />
        <Transit id="t1" next={1} />
        <PassNitpick />
        <Transit id="t2" next={2} />
        <PassSatboard />
        <Transit id="t3" next={3} />
        <PassCountdown />
        <Transit id="t4" next={4} />
        <PassGenki />
        <Transit id="t5" next={5} />
        <Ground />
        <Optical />
        <Contact />
      </main>

      <Hud />
      <div className="gs-grain" aria-hidden="true" />
      {!reduced && <Boot onDone={() => setBooted(true)} />}
    </div>
  )
}
