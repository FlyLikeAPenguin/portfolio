import { useRef } from 'react'
import { prefersReducedMotion, scrollTo } from '../../shared/useSmoothScroll'
import { gsap, ScrollTrigger, useGSAP } from './gsap'
import { fmtCount, pad2, parseCount, proof } from './data'
import { SectionHead } from './SectionHead'

export function Proof() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const vals = gsap.utils.toArray<HTMLElement>('.lt-proof__num')
      const counters = vals.map((el) => {
        const c = parseCount(el.dataset.value ?? '')
        if (c) el.textContent = fmtCount(c, 0)
        else el.style.visibility = 'hidden'
        return c
      })
      ScrollTrigger.create({
        trigger: '.lt-proof__list',
        start: 'top 82%',
        once: true,
        onEnter: () => {
          vals.forEach((el, i) => {
            const c = counters[i]
            const delay = i * 0.09
            if (c) {
              const o = { v: 0 }
              gsap.to(o, {
                v: c.n,
                duration: 1.8,
                delay,
                ease: 'expo.out',
                onUpdate: () => {
                  el.textContent = fmtCount(c, o.v)
                },
              })
            } else {
              el.style.visibility = ''
              gsap.to(el, { duration: 1.4, delay, scrambleText: { text: el.dataset.value ?? '', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', speed: 0.5 } })
            }
          })
          gsap.from('.lt-proof__item', { '--rule-s': 0, duration: 1.2, stagger: 0.08, ease: 'ltInOut' })
        },
      })
    },
    { scope: ref },
  )

  return (
    <section className="lt-sec lt-proof" id="lt-proof" ref={ref} aria-labelledby="lt-proof-h">
      <SectionHead no="01" id="lt-proof-h" title="Proof" aside="Numbers, not adjectives" />
      <ul className="lt-proof__list">
        {proof.map((p, i) => {
          const c = parseCount(p.value)
          return (
            <li className="lt-proof__item" key={p.label}>
              <a
                className="lt-proof__a"
                href={p.target}
                onClick={(e) => {
                  e.preventDefault()
                  // land case cards flush under the fixed header
                  scrollTo(p.target, -(document.querySelector('.lt-hdr')?.clientHeight ?? 0))
                }}
              >
                <span className="lt-proof__top">
                  <span className="lt-label lt-proof__i">{pad2(i + 1)}</span>
                  <span className="lt-label lt-proof__src">
                    {p.source}
                    <span className="lt-proof__arrow" aria-hidden="true">
                      ↘
                    </span>
                  </span>
                </span>
                <span className="lt-sr">{p.value}</span>
                <span className="lt-proof__val" aria-hidden="true">
                  {c?.prefix && <span className="lt-proof__fix">{c.prefix}</span>}
                  <span className="lt-proof__num" data-value={p.value}>
                    {c ? fmtCount(c, c.n) : p.value}
                  </span>
                  {c?.suffix && <span className="lt-proof__fix lt-proof__fix--s">{c.suffix.trim()}</span>}
                </span>
                <span className="lt-proof__label">{p.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
