import { useEffect, useRef, useState } from 'react'

/** One split-flap digit. The flap falls whenever the value changes. */
function Flap({ d }: { d: string }) {
  const last = useRef(d)
  const prev = useRef(d)
  const n = useRef(0)
  if (last.current !== d) {
    prev.current = last.current
    last.current = d
    n.current += 1
  }
  const p = prev.current
  return (
    <span className="gs-flap" aria-hidden="true">
      <span className="gs-flap__h gs-flap__h--top">
        <span>{d}</span>
      </span>
      <span className="gs-flap__h gs-flap__h--bot">
        <span>{n.current === 0 ? d : p}</span>
      </span>
      {n.current > 0 && (
        <>
          <span key={`f${n.current}`} className="gs-flap__h gs-flap__h--top gs-flap__fold">
            <span>{p}</span>
          </span>
          <span key={`u${n.current}`} className="gs-flap__h gs-flap__h--bot gs-flap__unfold">
            <span>{d}</span>
          </span>
        </>
      )}
    </span>
  )
}

const MILESTONES = [
  { at: 0, label: 'Launch', note: 'Liftoff · T-0' },
  { at: 9, label: 'Separation', note: 'Payload deployed' },
  { at: 21, label: 'First contact', note: 'AOS at first ground station' },
]

const p2 = (n: number) => String(n).padStart(2, '0')

/**
 * A recreation of the Mission Countdown clock: counts down from T−10 s, straight through zero,
 * and keeps counting up, ticking milestones off on a short demo timeline.
 */
export default function FlipClock() {
  const ref = useRef<HTMLDivElement>(null)
  const [t0, setT0] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())

  // Arm the clock the first time it scrolls into view.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setT0((v) => v ?? Date.now() + 10_000)
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (t0 === null) return
    let id = 0
    const tick = () => {
      setNow(Date.now())
      id = window.setTimeout(tick, 1000 - ((Date.now() - t0) % 1000 + 1000) % 1000 + 4)
    }
    tick()
    return () => window.clearTimeout(id)
  }, [t0])

  const diff = t0 === null ? -10_000 : now - t0
  const plus = diff >= 0
  const s = plus ? Math.floor(diff / 1000) : Math.ceil(-diff / 1000)
  const parts = [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60].map(p2)
  const units = ['Days', 'Hours', 'Minutes', 'Seconds']
  const tPlus = plus ? s : -s
  const label = `T${plus ? '+' : '−'} ${parts.join(':')}`

  return (
    <div className="gs-clock" ref={ref} data-plus={plus ? '1' : '0'}>
      <div className="gs-clock__top">
        <span className="gs-label">Mission clock · demo</span>
        <button type="button" className="gs-clock__reset" onClick={() => setT0(Date.now() + 10_000)}>
          Reset to T−10
        </button>
      </div>
      <div className="gs-clock__face" role="timer" aria-label={label}>
        <span className="gs-clock__sign" aria-hidden="true">
          T{plus ? '+' : '−'}
        </span>
        {parts.map((v, i) => (
          <span className="gs-clock__unit" key={units[i]}>
            <span className="gs-clock__digits">
              <Flap d={v[0]} />
              <Flap d={v[1]} />
            </span>
            <span className="gs-clock__u" aria-hidden="true">
              {units[i]}
            </span>
          </span>
        ))}
      </div>
      <ol className="gs-clock__ms">
        {MILESTONES.map((m) => {
          const done = t0 !== null && tPlus >= m.at
          const next = !done && MILESTONES.find((x) => !(t0 !== null && tPlus >= x.at)) === m
          return (
            <li key={m.label} data-done={done ? '1' : '0'} data-next={next ? '1' : '0'}>
              <span className="gs-clock__mt">T+00:00:{p2(m.at)}</span>
              <span className="gs-clock__ml">{m.label}</span>
              <span className="gs-clock__mn">{m.note}</span>
              <span className="gs-clock__ms-state">{done ? 'Nominal' : next ? 'Next' : 'Pending'}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
