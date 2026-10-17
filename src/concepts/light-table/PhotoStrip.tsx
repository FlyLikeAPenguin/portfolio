import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { asset } from '../../content'
import { prefersReducedMotion } from '../../shared/useSmoothScroll'
import { clamp, gsap, useGSAP } from './gsap'
import { film, filters, frames, pad2, type FilterId } from './data'
import { SectionHead } from './SectionHead'

const filmYear = film?.detail.match(/\d{4}/)?.[0]

export function PhotoStrip() {
  const stripRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<FilterId>('all')
  const [copies, setCopies] = useState(1)
  const [near, setNear] = useState(false)
  const first = useRef(true)

  /* Start fetching frames a screen or so before the strip arrives, then wipe them in on entry. */
  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '120% 0px' },
    )
    io.observe(strip)
    return () => io.disconnect()
  }, [])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.lt-ph__img', {
        clipPath: 'inset(100% 0% 0% 0%)',
        duration: 1.1,
        ease: 'ltOut',
        stagger: (i: number) => Math.min(i, 6) * 0.08,
        clearProps: 'clipPath',
        scrollTrigger: { trigger: stripRef.current, start: 'top 82%', once: true },
      })
    },
    { scope: stripRef },
  )

  const list = useMemo(() => frames.filter(filters.find((f) => f.id === filter)!.test), [filter])
  const counts = useMemo(() => Object.fromEntries(filters.map((f) => [f.id, frames.filter(f.test).length])), [])

  /* ---------- the physics: drag + inertia + wheel + idle drift, wrapped infinitely ---------- */
  useEffect(() => {
    const strip = stripRef.current
    const track = trackRef.current
    if (!strip || !track) return
    const reduce = prefersReducedMotion()
    const items = Array.from(track.children) as HTMLElement[]
    let xs: number[] = []
    let total = 1
    let maxW = 0

    const layout = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 16
      let x = 0
      xs = items.map((el) => {
        const at = x
        x += el.offsetWidth + gap
        return at
      })
      total = Math.max(1, x)
      maxW = Math.max(...items.map((el) => el.offsetWidth), 0)
      const need = Math.ceil((strip.clientWidth + maxW * 2) / (total / copies))
      if (need > copies) setCopies(need)
    }

    let offset = 0
    let vel = 0
    let skew = 0
    let drift = 0
    let dragging = false
    let hovering = false
    let lastX = 0
    let moved = 0
    let last = performance.now()

    const wrap = (v: number) => ((((v + maxW) % total) + total) % total) - maxW

    const render = () => {
      track.style.transform = `skewX(${skew.toFixed(3)}deg)`
      for (let i = 0; i < items.length; i++) items[i].style.transform = `translate3d(${wrap(xs[i] + offset).toFixed(2)}px,0,0)`
    }

    const tick = () => {
      const now = performance.now()
      const dt = Math.min(48, now - last) / 16.667
      last = now
      if (!dragging) {
        offset += vel * dt
        vel *= Math.pow(0.935, dt)
        if (Math.abs(vel) < 0.01) vel = 0
      }
      const wantDrift = reduce || dragging || hovering ? 0 : 1
      drift += (wantDrift - drift) * 0.04 * dt
      offset -= 0.45 * drift * dt
      const target = reduce ? 0 : clamp(-vel * 0.45, -9, 9)
      skew += (target - skew) * 0.14 * dt
      render()
    }

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      dragging = true
      moved = 0
      lastX = e.clientX
      vel = 0
      strip.classList.add('is-drag')
      strip.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      lastX = e.clientX
      offset += dx
      vel = vel * 0.25 + dx * 0.75
      moved += Math.abs(dx)
    }
    const onUp = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      strip.classList.remove('is-drag')
      if (strip.hasPointerCapture(e.pointerId)) strip.releasePointerCapture(e.pointerId)
    }
    const onClick = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        // horizontal intent: the strip owns it
        e.preventDefault()
        e.stopPropagation()
        vel -= e.deltaX * 0.12
      } else {
        // vertical: the page scrolls as usual, the strip leans into it
        vel -= e.deltaY * 0.035
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') vel -= 14
      else if (e.key === 'ArrowLeft') vel += 14
      else return
      e.preventDefault()
    }
    const onEnter = () => (hovering = true)
    const onLeave = () => (hovering = false)

    layout()
    render()

    let running = false
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true
        last = performance.now()
        gsap.ticker.add(tick)
      } else if (!e.isIntersecting && running) {
        running = false
        gsap.ticker.remove(tick)
      }
    })
    io.observe(strip)
    const ro = new ResizeObserver(() => {
      layout()
      render()
    })
    ro.observe(strip)

    strip.addEventListener('pointerdown', onDown)
    strip.addEventListener('pointermove', onMove)
    strip.addEventListener('pointerup', onUp)
    strip.addEventListener('pointercancel', onUp)
    strip.addEventListener('click', onClick, true)
    strip.addEventListener('wheel', onWheel, { passive: false })
    strip.addEventListener('keydown', onKey)
    strip.addEventListener('pointerenter', onEnter)
    strip.addEventListener('pointerleave', onLeave)

    return () => {
      io.disconnect()
      ro.disconnect()
      gsap.ticker.remove(tick)
      strip.removeEventListener('pointerdown', onDown)
      strip.removeEventListener('pointermove', onMove)
      strip.removeEventListener('pointerup', onUp)
      strip.removeEventListener('pointercancel', onUp)
      strip.removeEventListener('click', onClick, true)
      strip.removeEventListener('wheel', onWheel)
      strip.removeEventListener('keydown', onKey)
      strip.removeEventListener('pointerenter', onEnter)
      strip.removeEventListener('pointerleave', onLeave)
    }
  }, [list, copies])

  /* ---------- filter change: frames wipe in, left to right as they sit on screen ---------- */
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (prefersReducedMotion()) return
    const strip = stripRef.current!
    // the physics effect re-lays the new set out from x = 0, so index order is screen order
    const figs = Array.from(strip.querySelectorAll<HTMLElement>('.lt-ph__img'))
    if (!figs.length) return
    gsap.fromTo(
      figs,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.9,
        ease: 'ltOut',
        stagger: (i: number) => Math.min(i, 6) * 0.07,
        clearProps: 'clipPath',
      },
    )
  }, [filter])

  const rendered = useMemo(() => Array.from({ length: copies }, (_, c) => list.map((f, i) => ({ f, i, key: `${c}-${f.id}` }))).flat(), [list, copies])

  return (
    <section className="lt-sec lt-photos" id="lt-photos" aria-labelledby="lt-photos-h">
      <SectionHead no="04" id="lt-photos-h" title="Off the clock" aside="Photography" />

      <div className="lt-photos__intro">
        <p className="lt-photos__line" data-reveal>
          {film ? (
            <>
              Mostly digital: streets, travel and long exposures of the <em>night sky</em>. Every so often, a roll
              through an {film.name}
              {filmYear ? ` from ${filmYear}` : ''}.
            </>
          ) : (
            <>Mostly digital: streets, travel and long exposures of the night sky. Film, occasionally.</>
          )}
        </p>
        <div className="lt-photos__ctrl" data-reveal>
          <div className="lt-chips" role="group" aria-label="Filter photographs">
            {filters.map((f) => (
              <button
                type="button"
                key={f.id}
                className="lt-chip"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <sup>{counts[f.id]}</sup>
              </button>
            ))}
          </div>
          <span className="lt-label lt-photos__hint">Drag, swipe or scroll sideways</span>
        </div>
      </div>

      <div
        className="lt-strip"
        ref={stripRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={`Photographs, ${list.length} frames. Use the arrow keys to move.`}
      >
        <div className="lt-strip__track" ref={trackRef}>
          {rendered.map(({ f, i, key }) => (
            <figure className="lt-ph" key={key} style={{ '--ar': `${f.w} / ${f.h}` } as React.CSSProperties} aria-hidden={key.startsWith('0-') ? undefined : true}>
              <div className="lt-ph__img">
                {near && (
                  <img src={asset(f.src)} alt={f.title} loading={i < 8 && key.startsWith('0-') ? 'eager' : 'lazy'} decoding="async" draggable={false} />
                )}
              </div>
              <figcaption className="lt-ph__cap">
                <span className="lt-ph__no">{pad2(i + 1)}</span>
                <span className="lt-ph__t">{f.title}</span>
                <span className="lt-ph__m">
                  {f.stock} · {f.settings}
                </span>
                <span className={`lt-ph__k${f.kind === 'film' ? ' is-film' : ''}`}>{f.night ? 'Night' : f.kind}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <p className="lt-photos__note lt-label">Placeholder frames courtesy of Unsplash photographers, standing in for the real rolls.</p>
    </section>
  )
}
