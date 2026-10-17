import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { asset, photoDate, photoSrc, type Photo } from '../../content'
import { getLenis } from '../../lib/useSmoothScroll'

const p2 = (n: number) => String(n).padStart(2, '0')

type Props = {
  photos: Photo[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
}

/**
 * Full-screen viewer for one photo at a time. The grid thumbnail shows straight away and the
 * full-size file fades in over it; neighbours are prefetched. Keys: ←/→ to move, Esc to close.
 * Swipe works on touch screens.
 */
export default function Lightbox({ photos, index, onIndex, onClose }: Props) {
  const n = photos.length
  const ph = photos[index]
  const root = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const touchX = useRef<number | null>(null)
  const [loaded, setLoaded] = useState<string | null>(null)
  const go = (d: number) => onIndex((index + d + n) % n)

  // Stop the page scrolling underneath, and hand focus back to the tile on close.
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null
    const lenis = getLenis()
    const html = document.documentElement
    const overflow = html.style.overflow
    lenis?.stop()
    html.style.overflow = 'hidden'
    closeBtn.current?.focus()
    return () => {
      lenis?.start()
      html.style.overflow = overflow
      before?.focus?.({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Tab' && root.current) {
        // Keep focus inside the viewer.
        const f = root.current.querySelectorAll<HTMLElement>('button')
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
  })

  useEffect(() => {
    for (const d of [1, -1]) new Image().src = asset(photoSrc(photos[(index + d + n) % n], 'full'))
  }, [index, n, photos])

  const date = photoDate(ph)
  const gear = [ph.kind === 'film' ? 'Film' : 'Digital', ph.camera, ph.lens].filter(Boolean).join(' · ')
  const host = document.querySelector<HTMLElement>('.gs') ?? document.body

  return createPortal(
    <div
      ref={root}
      className="gs-lb"
      role="dialog"
      aria-modal="true"
      aria-label={`${ph.title}, photo ${index + 1} of ${n}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
    >
      <div className="gs-lb__top">
        <span className="gs-lb__count">
          Frame <b>{p2(index + 1)}</b> / {p2(n)}
        </span>
        <button ref={closeBtn} type="button" className="gs-lb__close" onClick={onClose}>
          Close <span aria-hidden="true">✕</span>
        </button>
      </div>

      <figure className="gs-lb__fig" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="gs-lb__img" onClick={(e) => e.target === e.currentTarget && onClose()}>
          <img className="gs-lb__low" src={asset(photoSrc(ph, 'thumb'))} alt="" aria-hidden="true" width={ph.w} height={ph.h} />
          <img
            key={ph.id}
            className="gs-lb__full"
            src={asset(photoSrc(ph, 'full'))}
            alt={ph.title}
            width={ph.w}
            height={ph.h}
            data-loaded={loaded === ph.id ? '1' : '0'}
            onLoad={() => setLoaded(ph.id)}
            ref={(el) => {
              if (el?.complete && el.naturalWidth > 0 && loaded !== ph.id) setLoaded(ph.id)
            }}
          />
        </div>
        <figcaption className="gs-lb__cap">
          <b>{ph.title}</b>
          <span>{gear}</span>
          {ph.settings || ph.stock || date ? <span>{[ph.settings, ph.stock, date].filter(Boolean).join(' · ')}</span> : null}
        </figcaption>
      </figure>

      <button type="button" className="gs-lb__nav gs-lb__nav--prev" onClick={() => go(-1)} aria-label="Previous photo">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      <button type="button" className="gs-lb__nav gs-lb__nav--next" onClick={() => go(1)} aria-label="Next photo">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
    </div>,
    host,
  )
}
