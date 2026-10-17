import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import gsap from 'gsap'
import { scrollTo, prefersReducedMotion } from '../../shared/useSmoothScroll'
import { dialPos, useVf } from './store'
import { SECTIONS, SPEEDS, speedLabel, sectionSpeed } from './sections'

const STEP = 360 / SPEEDS.length
const sectionAt = (pos: number) => SECTIONS.findIndex((s) => s.pos === pos)

const go = (id: string) => {
  if (id === 'vf-open') return scrollTo(0)
  const el = document.getElementById(id)
  if (el) scrollTo(el)
}

/**
 * OM-1 shutter speed dial as navigation. The rotor turns with scroll and snaps from
 * detent to detent (the only place we let things overshoot). Engraved speeds that own a
 * section are buttons; the rest are just engraving.
 */
export default function ShutterDial() {
  const rotor = useRef<HTMLDivElement>(null)
  const section = useVf((s) => s.section)
  const [hover, setHover] = useState<number | null>(null)
  const [menu, setMenu] = useState(false)
  const menuId = useId()
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let detent = -1
    const reduce = prefersReducedMotion()
    return dialPos.subscribe((pos) => {
      const d = Math.round(pos)
      if (d === detent || !rotor.current) return
      const first = detent === -1
      detent = d
      gsap.to(rotor.current, {
        rotation: -d * STEP,
        duration: first || reduce ? 0 : 0.5,
        ease: 'back.out(2.6)',
        overwrite: true,
      })
    })
  }, [])

  // mobile menu: Esc + outside click
  useEffect(() => {
    if (!menu) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenu(false)
        toggleRef.current?.focus()
      }
    }
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!menuRef.current?.contains(t) && !toggleRef.current?.contains(t)) setMenu(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    menuRef.current?.querySelector<HTMLButtonElement>('[aria-current="true"], button')?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [menu])

  const tip = hover ?? section
  const current = sectionSpeed(section)

  return (
    <>
      <nav className="vf-dial" aria-label="Sections (shutter speed dial)" onMouseLeave={() => setHover(null)}>
        <span className="vf-dial__index" aria-hidden="true" />
        <div className="vf-dial__tip" aria-hidden="true" data-show={hover !== null ? 'true' : 'false'}>
          <b className="vf-mono">{speedLabel(SPEEDS[SECTIONS[tip].pos])}</b>
          <span className="vf-engr">{SECTIONS[tip].label}</span>
        </div>
        <div className="vf-dial__body">
          <div ref={rotor} className="vf-dial__rotor">
            <span className="vf-dial__knurl" aria-hidden="true" />
            <span className="vf-dial__face" aria-hidden="true" />
            {SPEEDS.map((sp, i) => {
              const si = sectionAt(i)
              const style = { '--a': `${i * STEP}deg` } as CSSProperties
              if (si < 0)
                return (
                  <span key={sp} className="vf-dial__n" style={style} aria-hidden="true">
                    <span>{sp}</span>
                  </span>
                )
              return (
                <button
                  key={sp}
                  type="button"
                  className="vf-dial__n vf-dial__n--go"
                  style={style}
                  aria-label={`${SECTIONS[si].label}, ${speedLabel(sp)}`}
                  aria-current={si === section ? 'true' : undefined}
                  onMouseEnter={() => setHover(si)}
                  onFocus={() => setHover(si)}
                  onBlur={() => setHover(null)}
                  onClick={() => go(SECTIONS[si].id)}
                >
                  <span>{sp}</span>
                </button>
              )
            })}
          </div>
          <span className="vf-dial__cap" aria-hidden="true">
            <span className="vf-mono">{current === 'B' ? 'B' : current}</span>
          </span>
        </div>
      </nav>

      {/* mobile: a small dial-button that opens the section menu */}
      <div className="vf-dialm">
        <button
          ref={toggleRef}
          type="button"
          className="vf-dialm__btn"
          aria-expanded={menu}
          aria-controls={menuId}
          aria-label={`Sections menu. Current: ${SECTIONS[section].label}`}
          onClick={() => setMenu((m) => !m)}
        >
          <span className="vf-dialm__knurl" aria-hidden="true" />
          <span className="vf-dialm__val vf-mono" aria-hidden="true">
            {current}
          </span>
        </button>
        <div ref={menuRef} id={menuId} className="vf-dialm__menu" hidden={!menu}>
          <span className="vf-engr vf-dialm__head">Shutter · Section</span>
          <ul>
            {SECTIONS.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  aria-current={i === section ? 'true' : undefined}
                  onClick={() => {
                    setMenu(false)
                    go(s.id)
                  }}
                >
                  <b className="vf-mono">{speedLabel(SPEEDS[s.pos])}</b>
                  <span>{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
