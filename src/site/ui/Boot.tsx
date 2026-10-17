import { useMemo, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, tleEpoch } from '../fx'
import { S } from '../store'

/** ≤ 1.8 s: log lines type out, the link comes up, the Earth fades in underneath. */
export default function Boot({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const lines = useMemo(
    () => [
      ['INIT GROUND SEGMENT', 'OK'],
      [`TLE EPOCH ${tleEpoch(new Date())}`, 'OK'],
      ['ANTENNA SLEW · AZ 312.4 EL 05.0', 'OK'],
      ['LINK BUDGET +6.2 dB', 'OK'],
      ['AWAITING AOS', '··'],
    ],
    [],
  )

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const rows = gsap.utils.toArray<HTMLElement>('.gs-boot__line', el)
      const tl = gsap.timeline()
      tl.to(S.reveal, { v: 1, duration: 1.9, ease: 'power2.inOut' }, 0.25)
      tl.fromTo('.gs-boot__bar i', { scaleX: 0 }, { scaleX: 1, duration: 1.15, ease: 'power1.inOut' }, 0.05)
      rows.forEach((row, i) => {
        const txt = row.querySelector('.gs-boot__txt')
        const ok = row.querySelector('.gs-boot__ok')
        const n = (txt?.textContent ?? '').length
        const at = 0.06 + i * 0.2
        tl.set(row, { opacity: 1 }, at)
        tl.fromTo(txt, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.16, ease: `steps(${Math.max(4, n)})` }, at)
        tl.fromTo(ok, { opacity: 0 }, { opacity: 1, duration: 0.01 }, at + 0.17)
      })
      tl.call(onDone, [], 1.2)
      tl.to(el, { opacity: 0, duration: 0.4, ease: 'power1.out' }, 1.3)
      tl.set(el, { display: 'none' })
    },
    { scope: ref },
  )

  return (
    <div className="gs-boot" ref={ref} aria-hidden="true">
      <div className="gs-boot__log">
        <div className="gs-boot__head">
          <span>GS-01</span>
          <span>Ground segment · boot</span>
        </div>
        {lines.map(([t, ok]) => (
          <div className="gs-boot__line" key={t}>
            <span className="gs-boot__txt">{t}</span>
            <span className="gs-boot__dots" />
            <span className="gs-boot__ok">{ok}</span>
          </div>
        ))}
        <div className="gs-boot__bar">
          <i />
        </div>
      </div>
    </div>
  )
}
