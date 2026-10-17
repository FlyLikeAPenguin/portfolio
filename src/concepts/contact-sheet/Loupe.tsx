import { useEffect, useRef } from 'react'

/*
 * A chrome-rimmed 8× loupe... well, 2.2×. Follows the cursor over anything marked [data-loupe]
 * (a frame window holding one <img>). The lens is a background-image clone of that image with
 * a computed size and position, so it costs nothing to render. It honours object-fit, sideways
 * (portrait) frames via data-rot, and the frame's current develop state via --dev.
 */
const ZOOM = 2.2

export default function Loupe({ onEnable }: { onEnable?: (on: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const lensRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 769px)')
    const el = ref.current
    const lens = lensRef.current
    const mask = maskRef.current
    if (!el || !lens || !mask) return

    let enabled = false
    let x = -1
    let y = -1
    let raf = 0
    let shown = false
    let lastSrc = ''
    const last: Record<string, string> = {}
    const put = (node: HTMLElement, prop: 'backgroundColor' | 'backgroundSize' | 'backgroundPosition' | 'transform' | 'filter' | 'opacity', v: string) => {
      const k = (node === el ? 'el:' : node === mask ? 'mask:' : 'lens:') + prop
      if (last[k] === v) return
      last[k] = v
      node.style[prop] = v
    }

    const hide = () => {
      if (!shown) return
      shown = false
      el.classList.remove('is-on')
    }

    const update = () => {
      raf = 0
      if (!enabled || x < 0) return hide()
      const hit = document.elementFromPoint(x, y)
      const target = hit instanceof Element ? hit.closest<HTMLElement>('[data-loupe]') : null
      const img = target?.querySelector('img')
      if (!target || !img || !img.naturalWidth) return hide()

      const R = el.offsetWidth / 2
      const r = target.getBoundingClientRect()
      const rot = Number(target.dataset.rot || 0)
      const fit = target.dataset.fit === 'contain' ? 'contain' : 'cover'
      const bw = rot ? r.height : r.width
      const bh = rot ? r.width : r.height
      const iw = img.naturalWidth
      const ih = img.naturalHeight
      const s = fit === 'contain' ? Math.min(bw / iw, bh / ih) : Math.max(bw / iw, bh / ih)
      const dw = iw * s
      const dh = ih * s
      const dx = x - (r.left + r.width / 2)
      const dy = y - (r.top + r.height / 2)
      const [ix, iy] = rot === -90 ? [-dy, dx] : rot === 90 ? [dy, -dx] : [dx, dy]

      const src = img.currentSrc || img.src
      if (src !== lastSrc) {
        lastSrc = src
        lens.style.backgroundImage = `url("${src}")`
      }
      put(lens, 'backgroundColor', target.dataset.bg || '')
      put(lens, 'backgroundSize', `${(dw * ZOOM).toFixed(1)}px ${(dh * ZOOM).toFixed(1)}px`)
      put(lens, 'backgroundPosition', `${(R - (ix + dw / 2) * ZOOM).toFixed(1)}px ${(R - (iy + dh / 2) * ZOOM).toFixed(1)}px`)
      put(lens, 'transform', rot ? `rotate(${rot}deg)` : '')

      // match the develop wipe: negative to the right of the developer's edge, positive behind it
      const raw = target.style.getPropertyValue('--dev')
      const dev = raw === '' ? 1 : Math.max(0, Math.min(1, parseFloat(raw)))
      const fx = (x - r.left) / r.width
      const neg = Math.max(0, Math.min(1, (fx - (dev * 1.35 - 0.35)) / 0.3))
      put(lens, 'filter', neg > 0.001 ? `invert(${neg.toFixed(3)}) hue-rotate(${(neg * 180).toFixed(1)}deg)` : '')
      put(mask, 'opacity', (neg * 0.85).toFixed(3))

      put(el, 'transform', `translate3d(${x - R}px, ${y - R}px, 0)`)
      if (!shown) {
        shown = true
        el.classList.add('is-on')
      }
      // keep tracking while visible: scrubbed content keeps moving under a still cursor
      schedule()
    }

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x = e.clientX
      y = e.clientY
      schedule()
    }
    const onLeave = () => {
      x = -1
      hide()
    }

    const setEnabled = () => {
      enabled = mq.matches
      onEnable?.(enabled)
      if (!enabled) hide()
    }
    setEnabled()
    mq.addEventListener('change', setEnabled)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', schedule, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      mq.removeEventListener('change', setEnabled)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', schedule)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      onEnable?.(false)
    }
  }, [onEnable])

  return (
    <div className="cs-loupe" ref={ref} aria-hidden="true">
      <div className="cs-loupe__body">
        <div className="cs-loupe__glass">
          <div className="cs-loupe__lens" ref={lensRef} />
          <div className="cs-loupe__mask" ref={maskRef} />
        </div>
        <div className="cs-loupe__rim" />
        <div className="cs-loupe__glare" />
      </div>
    </div>
  )
}
