import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { scrollTo } from '../../shared/useSmoothScroll'
import { frameCounter, ROLL_LENGTH } from './store'

/*
 * OM-1 style frame counter: a curved dial of numbers under a small chrome window with a red index.
 * It ticks (with a little mechanical overshoot) whenever the counter store changes.
 */
const STEP = 8.8 // degrees between numbers
const CX = 60
const CY = 238
const RAD = 198

function FrameCounter() {
  const dial = useRef<SVGGElement>(null)
  const [n, setN] = useState(0)

  useEffect(
    () =>
      frameCounter.subscribe((v) => {
        setN(v)
        if (!dial.current) return
        gsap.to(dial.current, {
          rotation: -v * STEP,
          svgOrigin: `${CX} ${CY}`,
          duration: 0.42,
          ease: 'back.out(2.4)',
          overwrite: true,
        })
      }),
    [],
  )

  const label = n === 0 ? 'Start of roll' : `Frame ${n} of ${ROLL_LENGTH}`
  return (
    <div className="cs-counter" role="img" aria-label={label} title={label}>
      <svg viewBox="0 0 120 52" className="cs-counter__dial">
        <defs>
          <linearGradient id="cs-counter-fade" x1="0" x2="1">
            <stop offset="0" stopColor="#0b0a09" stopOpacity="1" />
            <stop offset="0.3" stopColor="#0b0a09" stopOpacity="0" />
            <stop offset="0.7" stopColor="#0b0a09" stopOpacity="0" />
            <stop offset="1" stopColor="#0b0a09" stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect width="120" height="52" fill="#0b0a09" />
        <g ref={dial}>
          {Array.from({ length: ROLL_LENGTH + 1 }, (_, i) => {
            const a = (i * STEP * Math.PI) / 180
            const px = CX + Math.sin(a) * RAD
            const py = CY - Math.cos(a) * RAD
            const hot = i === 12 || i === 24 || i === 36
            return (
              <text
                key={i}
                x={px}
                y={py}
                transform={`rotate(${i * STEP} ${px} ${py})`}
                className={`cs-counter__num${hot ? ' is-hot' : ''}${i % 2 && i ? ' is-odd' : ''}${i === n ? ' is-cur' : ''}`}
                textAnchor="middle"
              >
                {i === 0 ? 'S' : i}
              </text>
            )
          })}
          {Array.from({ length: ROLL_LENGTH * 2 }, (_, i) => {
            const a = ((i * STEP) / 2) * (Math.PI / 180)
            return (
              <line
                key={i}
                x1={CX + Math.sin(a) * (RAD + 19)}
                y1={CY - Math.cos(a) * (RAD + 19)}
                x2={CX + Math.sin(a) * (RAD + (i % 2 ? 22 : 25))}
                y2={CY - Math.cos(a) * (RAD + (i % 2 ? 22 : 25))}
                className="cs-counter__tick"
              />
            )
          })}
        </g>
        <rect width="120" height="52" fill="url(#cs-counter-fade)" />
        <path d="M55 0h10l-5 7z" className="cs-counter__index" />
      </svg>
      <span className="cs-counter__glass" aria-hidden="true" />
    </div>
  )
}

function SafelightSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button className="cs-switch" role="switch" aria-checked={on} onClick={onToggle} title="Darkroom safelight">
      <span className="cs-switch__lamp" aria-hidden="true" />
      <span className="cs-switch__label">Safelight</span>
      <span className="cs-switch__track" aria-hidden="true">
        <span className="cs-switch__knob" />
      </span>
    </button>
  )
}

const NAV = [
  ['#cs-work', 'Work'],
  ['#cs-proofs', 'Proofs'],
  ['#cs-photos', 'Photographs'],
  ['#cs-notes', 'Notes'],
  ['#cs-contact', 'Contact'],
] as const

export default function Header({ darkroom, onToggle }: { darkroom: boolean; onToggle: () => void }) {
  return (
    <header className="cs-top">
      <button className="cs-top__brand cs-label" onClick={() => scrollTo(0)} aria-label="Joe Thornton, back to top">
        <span className="cs-top__mono">JT</span>
        <span className="cs-top__roll">Contact sheet</span>
      </button>
      <nav className="cs-top__nav cs-label" aria-label="Sections">
        {NAV.map(([href, label], i) => (
          <button key={href} onClick={() => scrollTo(href)}>
            <span className="cs-top__i">{String(i + 1).padStart(2, '0')}</span>
            {label}
          </button>
        ))}
      </nav>
      <div className="cs-top__right">
        <SafelightSwitch on={darkroom} onToggle={onToggle} />
        <div className="cs-top__counter cs-label">
          <span className="cs-top__fr" aria-hidden="true">
            FR
          </span>
          <FrameCounter />
        </div>
      </div>
    </header>
  )
}
