import { useRef, type ElementType } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

type Props = {
  text: string
  as?: ElementType
  className?: string
  id?: string
  /** Where the heading should land in focus, as a ScrollTrigger end (default: its centre at 58% of the viewport). */
  end?: string
}

/**
 * Split-image rack focus. Two copies of the heading, masked to the top and bottom half of
 * every line, slide apart in opposite directions with blur; scrubbing toward the finder's
 * centre pulls them into register, and the last hair of travel "clicks" home.
 */
export default function FocusTitle({ text, as: Tag = 'h2', className = '', id, end = 'center 58%' }: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (ctx.conditions?.reduce) {
            el.classList.add('is-sharp', 'is-static')
            return
          }
          let sharp = false
          let max = 40
          const measure = () => {
            const fs = parseFloat(getComputedStyle(el).fontSize) || 80
            max = Math.min(64, Math.max(14, fs * 0.3))
          }
          const apply = (p: number) => {
            const e = 1 - p
            if (p >= 0.92) {
              if (!sharp) {
                sharp = true
                el.classList.add('is-sharp')
              }
              el.style.setProperty('--o', '0')
              el.style.setProperty('--b', '0')
              el.style.setProperty('--g', '0')
              return
            }
            if (sharp && p < 0.86) {
              sharp = false
              el.classList.remove('is-sharp')
            }
            if (sharp) return
            // offset eases in hard at the end, so the final pull feels like a rack
            const o = max * (0.14 + 0.86 * Math.pow(e, 1.35))
            const b = 0.6 + 9 * Math.pow(e, 1.6)
            el.style.setProperty('--o', o.toFixed(2))
            el.style.setProperty('--b', b.toFixed(2))
            el.style.setProperty('--g', Math.min(1, 0.35 + e).toFixed(3))
          }
          measure()
          const st = ScrollTrigger.create({
            trigger: el,
            start: 'top 96%',
            end,
            onUpdate: (self) => apply(self.progress),
            onRefresh: (self) => {
              measure()
              apply(self.progress)
            },
          })
          apply(st.progress)
          return () => {
            el.classList.remove('is-sharp')
          }
        },
      )
    },
    { scope: ref, dependencies: [text] },
  )

  return (
    <Tag ref={ref} id={id} className={`vf-rf vf-display ${className}`}>
      <span className="vf-sr">{text}</span>
      <span className="vf-rf__stack" aria-hidden="true">
        <span className="vf-rf__sizer">{text}</span>
        <span className="vf-rf__half vf-rf__half--top">{text}</span>
        <span className="vf-rf__half vf-rf__half--bot">{text}</span>
        <span className="vf-rf__seam" />
      </span>
    </Tag>
  )
}
