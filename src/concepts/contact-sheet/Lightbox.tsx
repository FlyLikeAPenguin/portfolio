import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import gsap from 'gsap'
import { asset, type Photo } from '../../content'
import { getLenis, prefersReducedMotion } from '../../shared/useSmoothScroll'
import { pad2 } from './data'
import { LinkArrow } from './film'

export type LightboxState = { list: Photo[]; index: number; roll: string } | null

type Props = {
  state: LightboxState
  onIndex: (i: number) => void
  onClose: () => void
}

/** An enlarged print on the light table: paper border, caption, prev/next, Esc, focus trapped. */
export default function Lightbox({ state, onIndex, onClose }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const [closing, setClosing] = useState(false)
  const open = !!state

  const close = useCallback(() => {
    if (closing) return
    const el = root.current
    if (!el || prefersReducedMotion()) return onClose()
    setClosing(true)
    gsap
      .timeline({
        onComplete: () => {
          setClosing(false)
          onClose()
        },
      })
      .to(el.querySelector('.cs-lb__print'), { y: 60, rotation: 3, opacity: 0, duration: 0.32, ease: 'power2.in' }, 0)
      .to(el.querySelector('.cs-lb__backdrop'), { opacity: 0, duration: 0.32 }, 0)
      .to(el.querySelectorAll('.cs-lb__ctrl'), { opacity: 0, duration: 0.2 }, 0)
  }, [closing, onClose])

  // entrance
  useLayoutEffect(() => {
    if (!open) return
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const tl = gsap.timeline()
    tl.fromTo(el.querySelector('.cs-lb__backdrop'), { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power1.out' }, 0)
      .fromTo(
        el.querySelector('.cs-lb__print'),
        { y: 110, rotation: 5, opacity: 0 },
        { y: 0, rotation: -0.8, opacity: 1, duration: 0.8, ease: 'expo.out' },
        0.05,
      )
      .fromTo(el.querySelectorAll('.cs-lb__ctrl'), { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.05 }, 0.25)
    return () => {
      tl.kill()
    }
  }, [open])

  // lock scroll, focus, keyboard
  useEffect(() => {
    if (!open) return
    const lenis = getLenis()
    lenis?.stop()
    const prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    closeBtn.current?.focus({ preventScroll: true })
    return () => {
      lenis?.start()
      document.documentElement.style.overflow = prevOverflow
    }
  }, [open])

  useEffect(() => {
    if (!state) return
    const n = state.list.length
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      } else if (e.key === 'ArrowRight') {
        onIndex((state.index + 1) % n)
      } else if (e.key === 'ArrowLeft') {
        onIndex((state.index - 1 + n) % n)
      } else if (e.key === 'Tab' && root.current) {
        const f = Array.from(root.current.querySelectorAll<HTMLElement>('button, a[href]'))
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        } else if (!root.current.contains(document.activeElement)) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state, onIndex, close])

  if (!state) return null
  const ph = state.list[state.index]
  const n = state.list.length
  const portrait = ph.h > ph.w

  return (
    <div className="cs-lb" ref={root} role="dialog" aria-modal="true" aria-label={`${ph.title}, enlarged print`}>
      <div className="cs-lb__backdrop" onClick={close} />
      <figure
        className={`cs-lb__print ${portrait ? 'is-portrait' : ''}`}
        style={{ '--ar': (ph.w / ph.h).toFixed(4) } as CSSProperties}
      >
        <div className="cs-lb__img">
          <img key={ph.src} src={asset(ph.src)} alt={`${ph.title}. ${ph.stock}, ${ph.settings}.`} width={ph.w} height={ph.h} />
        </div>
        <figcaption className="cs-lb__cap">
          <span className="cs-lb__title">{ph.title}</span>
          <span className="cs-lb__meta">
            {ph.kind === 'film' ? 'Film' : 'Digital'} · {ph.stock} · {ph.settings}
          </span>
          <span className="cs-lb__no">
            Roll {state.roll} · {pad2(state.index + 1)}/{pad2(n)}
          </span>
          <a className="cs-lb__credit" href={ph.credit.url} target="_blank" rel="noreferrer">
            Placeholder · {ph.credit.author}
            <LinkArrow />
          </a>
        </figcaption>
      </figure>
      <button className="cs-lb__ctrl cs-lb__prev" onClick={() => onIndex((state.index - 1 + n) % n)} aria-label="Previous print">
        <LinkArrow dir="left" />
        <span>Prev</span>
      </button>
      <button className="cs-lb__ctrl cs-lb__next" onClick={() => onIndex((state.index + 1) % n)} aria-label="Next print">
        <span>Next</span>
        <LinkArrow dir="right" />
      </button>
      <button className="cs-lb__ctrl cs-lb__close" ref={closeBtn} onClick={close} aria-label="Close print">
        <span>Close</span>
        <kbd>Esc</kbd>
      </button>
    </div>
  )
}
