import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { profile } from '../../content'
import { scrollTo } from '../../lib/useSmoothScroll'
import { gsap, scrambleIn, SplitText } from '../fx'
import { S } from '../store'

export default function Hero({ booted }: { booted: boolean }) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || !booted) return
      el.dataset.in = '1'
      if (S.reduced) return
      const name = el.querySelector<HTMLElement>('.gs-hero__name')!
      const split = SplitText.create(name, { type: 'words,chars', mask: 'chars' })
      const tl = gsap.timeline()
      tl.from(split.chars, { yPercent: 108, duration: 1.15, ease: 'expo.out', stagger: 0.035 }, 0)
      tl.from('.gs-hero__line', { opacity: 0, y: 16, duration: 0.9, ease: 'power3.out', stagger: 0.09 }, 0.3)
      el.querySelectorAll<HTMLElement>('[data-scr]').forEach((n, i) => {
        tl.add(scrambleIn(n, 0.6), 0.45 + i * 0.08)
      })
      tl.from('.gs-hero__cue', { opacity: 0, y: 8, duration: 0.6, ease: 'power2.out' }, 0.95)
      return () => split.revert()
    },
    { scope: ref, dependencies: [booted] },
  )

  return (
    <section className="gs-hero" id="gs-hero" ref={ref} data-in="0" data-shot="hero" data-sec="01" data-sec-label="Acquisition" aria-label="Introduction">
      <div className="gs-wrap gs-hero__wrap">
        <div className="gs-hero__top gs-hero__line">
          <span className="gs-idx">
            01 <i>/</i> Acquisition
          </span>
          <span className="gs-hero__rule" aria-hidden="true" />
          <span className="gs-hero__gs">GS-LDN · 51.5072°N 0.1276°W</span>
        </div>
        <h1 className="gs-hero__name">
          <span className="gs-hero__w">Joe</span> <span className="gs-hero__w">Thornton</span>
        </h1>
        <div className="gs-hero__foot">
          <p className="gs-hero__meta gs-hero__line">
            <span data-scr>{profile.role}</span>
            <i aria-hidden="true">·</i>
            <span data-scr>{profile.location}</span>
            <i aria-hidden="true">·</i>
            <span>
              <span data-utc-time>--:--:--</span> UTC
            </span>
          </p>
        </div>
        <button type="button" className="gs-hero__cue" onClick={() => scrollTo('#gs-p1')}>
          <span className="gs-hero__cue-t">Scroll to begin pass</span>
          <span className="gs-hero__cue-i" aria-hidden="true">
            ↓
          </span>
        </button>
      </div>
    </section>
  )
}
