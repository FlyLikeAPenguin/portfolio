import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { getLenis, prefersReducedMotion } from '../../shared/useSmoothScroll'
import { useVf, vf } from './store'
import { pad } from './util'

export type Shot = {
  src: string
  title: string
  alt: string
  /** EXIF-ish strings shown under the frame */
  meta: string[]
  credit?: { author: string; url: string }
  w?: number
  h?: number
}

type Ctx = {
  /** Fire the focal-plane shutter; `mid` runs while the curtains are closed. */
  fire: (mid?: () => void) => void
  /** Fire, then open a frame in the viewfinder lightbox. */
  open: (items: Shot[], index: number, opener?: HTMLElement | null) => void
}

const ShutterCtx = createContext<Ctx>({ fire: (mid) => mid?.(), open: () => {} })
export const useShutter = () => useContext(ShutterCtx)

export function ShutterProvider({ children }: { children: ReactNode }) {
  const c1 = useRef<HTMLDivElement>(null)
  const c2 = useRef<HTMLDivElement>(null)
  const flash = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const [box, setBox] = useState<{ items: Shot[]; index: number } | null>(null)

  const fire = useCallback((mid?: () => void) => {
    vf.set({ frame: vf.get().frame + 1 })
    if (prefersReducedMotion() || !c1.current || !c2.current || !flash.current) {
      mid?.()
      return
    }
    // two cloth curtains cross the gate: ~120ms, with a breath of flash at full cover
    gsap
      .timeline()
      .set([c1.current, c2.current], { autoAlpha: 1 })
      .fromTo(c1.current, { xPercent: -101 }, { xPercent: 0, duration: 0.055, ease: 'power2.in' }, 0)
      .fromTo(c2.current, { xPercent: 101 }, { xPercent: 0, duration: 0.055, ease: 'power2.in' }, 0)
      .add(() => mid?.(), 0.055)
      .fromTo(flash.current, { opacity: 0.3 }, { opacity: 0, duration: 0.34, ease: 'power2.out' }, 0.06)
      .to(c1.current, { xPercent: 101, duration: 0.065, ease: 'power2.out' }, 0.07)
      .to(c2.current, { xPercent: -101, duration: 0.065, ease: 'power2.out' }, 0.07)
      .set([c1.current, c2.current], { autoAlpha: 0 })
  }, [])

  const open = useCallback(
    (items: Shot[], index: number, from?: HTMLElement | null) => {
      opener.current = from ?? (document.activeElement as HTMLElement | null)
      fire(() => setBox({ items, index }))
    },
    [fire],
  )

  const close = useCallback(() => {
    setBox(null)
    const el = opener.current
    requestAnimationFrame(() => el?.focus({ preventScroll: true }))
  }, [])

  const nav = useCallback(
    (dir: number) => {
      fire(() =>
        setBox((b) => (b ? { ...b, index: (b.index + dir + b.items.length) % b.items.length } : b)),
      )
    },
    [fire],
  )

  const ctx = useMemo(() => ({ fire, open }), [fire, open])

  return (
    <ShutterCtx.Provider value={ctx}>
      {children}
      {box && <Lightbox items={box.items} index={box.index} onClose={close} onNav={nav} />}
      <div className="vf-shutter" aria-hidden="true">
        <div ref={c1} className="vf-shutter__c vf-shutter__c--1" />
        <div ref={c2} className="vf-shutter__c vf-shutter__c--2" />
        <div ref={flash} className="vf-shutter__flash" />
      </div>
    </ShutterCtx.Provider>
  )
}

function Lightbox({
  items,
  index,
  onClose,
  onNav,
}: {
  items: Shot[]
  index: number
  onClose: () => void
  onNav: (dir: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const frame = useVf((s) => s.frame)
  const item = items[index]
  const many = items.length > 1

  useEffect(() => {
    closeBtn.current?.focus({ preventScroll: true })
    const lenis = getLenis()
    lenis?.stop()
    const html = document.documentElement
    const prevOverflow = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      lenis?.start()
      html.style.overflow = prevOverflow
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (many && e.key === 'ArrowRight') onNav(1)
      else if (many && e.key === 'ArrowLeft') onNav(-1)
      else if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button, a[href]')
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [many, onClose, onNav])

  return (
    <div
      ref={ref}
      className="vf-lb"
      role="dialog"
      aria-modal="true"
      aria-label={`Frame ${pad(frame)}: ${item.title}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="vf-lb__top">
        <span className="vf-engr">
          Frame <b className="vf-mono">▸ {pad(frame)}</b>
        </span>
        <span className="vf-engr vf-lb__count vf-mono">
          {pad(index + 1)} / {pad(items.length)}
        </span>
        <button ref={closeBtn} className="vf-btn vf-lb__close" onClick={onClose}>
          Close <kbd>Esc</kbd>
        </button>
      </div>

      <figure className="vf-lb__fig">
        <div className="vf-lb__frame vf-frame">
          <span className="vf-frame__br vf-frame__br--tl" />
          <span className="vf-frame__br vf-frame__br--tr" />
          <span className="vf-frame__br vf-frame__br--bl" />
          <span className="vf-frame__br vf-frame__br--br" />
          <img key={item.src} className="vf-lb__img" src={item.src} alt={item.alt} width={item.w} height={item.h} />
        </div>
        <figcaption className="vf-lb__cap">
          <span className="vf-lb__title vf-display">{item.title}</span>
          <span className="vf-lb__meta">
            {item.meta.map((m) => (
              <span key={m} className="vf-engr">
                {m}
              </span>
            ))}
            {item.credit && (
              <a className="vf-engr vf-lb__credit" href={item.credit.url} target="_blank" rel="noreferrer">
                Photo: {item.credit.author} (placeholder)
              </a>
            )}
          </span>
        </figcaption>
      </figure>

      {many && (
        <>
          <button className="vf-lb__nav vf-lb__nav--prev" onClick={() => onNav(-1)} aria-label="Previous frame">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          <button className="vf-lb__nav vf-lb__nav--next" onClick={() => onNav(1)} aria-label="Next frame">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
