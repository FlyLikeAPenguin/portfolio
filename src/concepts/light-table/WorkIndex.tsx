import { useEffect, useRef, useState } from 'react'
import { experiments, projects } from '../../content'
import { prefersReducedMotion } from '../../shared/useSmoothScroll'
import { clamp, gsap, ScrollTrigger, useGSAP } from './gsap'
import { pad2, yearSpan } from './data'
import { SectionHead } from './SectionHead'
import { Cover } from './Cover'

const PREVIEW_MQ = '(hover: hover) and (pointer: fine) and (min-width: 769px)'

export function WorkIndex() {
  const secRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const pvRef = useRef<HTMLDivElement>(null)
  const openRef = useRef<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [mountPreview, setMountPreview] = useState(false)

  /* Load preview images only once the index is near. */
  useEffect(() => {
    const el = secRef.current
    if (!el || !window.matchMedia(PREVIEW_MQ).matches || prefersReducedMotion()) return
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setMountPreview(true)
          io.disconnect()
        }
      },
      { rootMargin: '100% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.lt-row', {
          '--row-rule': 0,
          duration: 1.2,
          ease: 'ltInOut',
          stagger: 0.06,
          scrollTrigger: { trigger: '.lt-rows', start: 'top 85%', once: true },
        })
        gsap.from('.lt-row__grid > *', {
          yPercent: 60,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'ltOut',
          stagger: { each: 0.012, from: 'start' },
          scrollTrigger: { trigger: '.lt-rows', start: 'top 85%', once: true },
        })
      })
      return () => mm.revert()
    },
    { scope: secRef },
  )

  /* ---------- the cursor-following preview (desktop, fine pointer only) ---------- */
  useGSAP(
    () => {
      const wrap = pvRef.current
      const list = listRef.current
      if (!wrap || !list || !mountPreview) return
      const card = wrap.querySelector<HTMLElement>('.lt-pv__card')!
      const tiles = gsap.utils.toArray<HTMLElement>('.lt-pv__tile', wrap)
      let x = window.innerWidth / 2
      let y = window.innerHeight / 2
      let tx = x
      let ty = y
      let rot = 0
      let sk = 0
      let active = -1
      let visible = false
      let running = false
      let z = 2
      gsap.set(card, { autoAlpha: 0, scale: 0.4 })

      const tick = () => {
        x += (tx - x) * 0.14
        y += (ty - y) * 0.14
        const vx = tx - x
        rot += (clamp(vx * 0.035, -9, 9) - rot) * 0.18
        sk += (clamp(vx * 0.05, -11, 11) - sk) * 0.18
        wrap.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(3)}deg) skewX(${(-sk).toFixed(3)}deg)`
      }
      const run = () => {
        if (running) return
        running = true
        gsap.ticker.add(tick)
      }
      const stop = () => {
        running = false
        gsap.ticker.remove(tick)
      }

      const swap = (i: number) => {
        const tile = tiles[i]
        if (!tile) return
        const down = i > active
        tile.style.zIndex = String(++z)
        gsap.fromTo(
          tile,
          { clipPath: down ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'ltOut', overwrite: true },
        )
        gsap.fromTo(tile.firstElementChild, { scale: 1.28, yPercent: down ? 12 : -12 }, { scale: 1, yPercent: 0, duration: 1, ease: 'ltOut', overwrite: true })
        active = i
      }

      const show = (i: number) => {
        if (!visible) {
          visible = true
          x = tx
          y = ty
          run()
          gsap.to(card, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'ltOut', overwrite: true })
        }
        if (i !== active) swap(i)
      }
      const hide = () => {
        if (!visible) return
        visible = false
        active = -1
        gsap.to(card, { autoAlpha: 0, scale: 0.4, duration: 0.4, ease: 'power3.in', overwrite: true, onComplete: () => !visible && stop() })
      }

      const pick = (el: Element | null) => {
        const btn = el?.closest<HTMLElement>('.lt-row__btn')
        if (!btn || btn.getAttribute('aria-expanded') === 'true') return hide()
        show(Number(btn.dataset.i))
      }
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return
        tx = e.clientX
        ty = e.clientY
        pick(e.target as Element)
      }
      const onLeave = () => hide()
      const onScroll = () => {
        if (visible) pick(document.elementFromPoint(tx, ty))
      }
      const onClick = () => window.setTimeout(onScroll, 0)

      const mm = gsap.matchMedia()
      mm.add(PREVIEW_MQ, () => {
        list.addEventListener('pointermove', onMove)
        list.addEventListener('pointerleave', onLeave)
        list.addEventListener('click', onClick)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
          list.removeEventListener('pointermove', onMove)
          list.removeEventListener('pointerleave', onLeave)
          list.removeEventListener('click', onClick)
          window.removeEventListener('scroll', onScroll)
          hide()
          stop()
        }
      })
      return () => {
        mm.revert()
        stop()
      }
    },
    { scope: secRef, dependencies: [mountPreview] },
  )

  /* ---------- inline expansion ---------- */
  const animate = contextSafe!((slug: string, opening: boolean) => {
    const panel = document.getElementById(`lt-panel-${slug}`)
    if (!panel) return
    const reduce = prefersReducedMotion()
    gsap.killTweensOf(panel)
    if (opening) {
      gsap.fromTo(panel, { height: panel.offsetHeight }, { height: 'auto', duration: reduce ? 0 : 0.95, ease: 'ltOut', onComplete: () => ScrollTrigger.refresh() })
      if (!reduce)
        gsap.fromTo(
          panel.querySelectorAll('[data-pi]'),
          { y: 28, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.9, ease: 'ltOut', stagger: 0.06, delay: 0.08 },
        )
    } else {
      gsap.to(panel, { height: 0, duration: reduce ? 0 : 0.6, ease: 'ltInOut', onComplete: () => ScrollTrigger.refresh() })
    }
  })

  const toggle = (slug: string) => {
    const prev = openRef.current
    if (prev) animate(prev, false)
    const next = prev === slug ? null : slug
    if (next) animate(next, true)
    openRef.current = next
    setOpen(next)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !openRef.current) return
      const slug = openRef.current
      toggle(slug)
      document.getElementById(`lt-row-${slug}`)?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section className="lt-sec lt-index" id="lt-index" ref={secRef} aria-labelledby="lt-index-h">
      <SectionHead
        no="02"
        id="lt-index-h"
        title="Index"
        aside={
          <>
            {projects.length} entries{experiments.length > 0 && ` · ${experiments.length} lab`} · {yearSpan}
          </>
        }
      />

      <div className="lt-ix">
        <div className="lt-ix__head lt-label" aria-hidden="true">
          <span className="c-no">No.</span>
          <span className="c-name">Project</span>
          <span className="c-kind">Kind</span>
          <span className="c-year">Year</span>
          <span className="c-stack">Stack</span>
          <span className="c-status">Status</span>
        </div>

        <ul className="lt-rows" ref={listRef}>
          {projects.map((p, i) => {
            const isOpen = open === p.slug
            const live = /^live/i.test(p.status)
            return (
              <li key={p.slug} className={`lt-row${isOpen ? ' is-open' : ''}`} style={{ '--accent': p.accent } as React.CSSProperties}>
                <h3 className="lt-row__h">
                  <button
                    type="button"
                    className="lt-row__btn"
                    id={`lt-row-${p.slug}`}
                    data-i={i}
                    aria-expanded={isOpen}
                    aria-controls={`lt-panel-${p.slug}`}
                    onClick={() => toggle(p.slug)}
                  >
                    <span className="lt-row__grid">
                      <span className="c-no lt-row__no">{pad2(i + 1)}</span>
                      <span className="c-name lt-row__name">
                        {p.name}
                        {p.tier === 'experiment' && <span className="lt-tag">Lab</span>}
                      </span>
                      <span className="c-kind lt-row__kind">{p.kind}</span>
                      <span className="c-year lt-row__year">{p.year}</span>
                      <span className="c-stack lt-row__stack">{p.stack.slice(0, 3).join(' · ')}</span>
                      <span className="c-status lt-row__status">
                        <i className={`lt-dot${live ? ' is-live' : ''}`} aria-hidden="true" />
                        {p.status}
                      </span>
                    </span>
                    <span className="lt-row__icon" aria-hidden="true" />
                  </button>
                </h3>

                <div className="lt-row__panel" id={`lt-panel-${p.slug}`} role="region" aria-labelledby={`lt-row-${p.slug}`} inert={!isOpen}>
                  <div className="lt-row__in">
                    <figure className="lt-pi lt-pi--thumb" data-pi>
                      <Cover p={p} />
                    </figure>
                    <div className="lt-pi lt-pi--lead" data-pi>
                      <p className="lt-pi__one">{p.oneLiner}</p>
                      <p className="lt-pi__sum">{p.summary}</p>
                      <p className="lt-pi__role">
                        <span className="lt-label">Role</span> {p.role}
                      </p>
                      {p.credit && <p className="lt-pi__credit lt-label">{p.credit}</p>}
                    </div>
                    <div className="lt-pi lt-pi--side" data-pi>
                      {p.highlights.length > 0 && (
                        <ol className="lt-pi__hl">
                          {p.highlights.slice(0, 3).map((h, k) => (
                            <li key={h.title}>
                              <span className="lt-label">{pad2(k + 1)}</span>
                              <div>
                                <strong>{h.title}</strong>
                                <p>{h.detail}</p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      )}
                      {p.stats.length > 0 && (
                        <dl className="lt-pi__stats">
                          {p.stats.map((s) => (
                            <div key={s.label}>
                              <dt className="lt-label">{s.label}</dt>
                              <dd>{s.value}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                      <div className="lt-pi__foot">
                        <p className="lt-pi__stack">
                          <span className="lt-label">Stack</span> {p.stack.join(', ')}
                        </p>
                        <ul className="lt-links">
                          {p.links.map((l) => (
                            <li key={l.href}>
                              <a href={l.href} target="_blank" rel="noreferrer">
                                {l.label}
                                <span aria-hidden="true"> ↗</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {mountPreview && (
        <div className="lt-pv" ref={pvRef} aria-hidden="true">
          <div className="lt-pv__anchor">
            <div className="lt-pv__card">
              {projects.map((p) => (
                <div className="lt-pv__tile" key={p.slug}>
                  <Cover p={p} live eager />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
