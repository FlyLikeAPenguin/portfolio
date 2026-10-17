import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { asset, skyPhotos, streetPhotos, type Photo } from '../../content'
import type { MarkKind } from './data'
import { FilmCell, Tape, Tri } from './film'
import { CellMarks, GreaseNote } from './marks'
import { markTimeline } from './FilmAdvance'

export type OpenPrint = (list: Photo[], index: number, opener: HTMLElement, roll: string) => void

type SheetProps = {
  photos: Photo[]
  roll: string
  name: string
  stock: string
  marks: Record<number, MarkKind>
  onOpen: OpenPrint
  className?: string
  cols?: 3 | 6
}

function Sheet({ photos, roll, name, stock, marks, onOpen, className = '', cols = 6 }: SheetProps) {
  return (
    <div className={`cs-sheet ${className}`} data-marks="">
      <div className="cs-sheet__paper">
        <p className="cs-sheet__label">
          <span>Roll {roll}</span>
          <span>{name}</span>
          <span>{photos.length} exp.</span>
        </p>
        <ul className={`cs-sheet-grid cs-sheet-grid--${cols === 3 ? '3x' : '6'}`} aria-label={`Roll ${roll}, ${name}`}>
          {photos.map((ph, i) => {
            const portrait = ph.h > ph.w * 1.05
            return (
              <li className="cs-sheet-cell" key={ph.src}>
                <FilmCell n={i + 1} top={i % cols === 0 ? 'text' : i % cols === Math.floor(cols / 2) ? 'dx' : 'none'} stock={stock}>
                  <button
                    className="cs-win cs-win--photo"
                    data-loupe=""
                    data-fit="cover"
                    data-rot={portrait ? -90 : undefined}
                    onClick={(e) => onOpen(photos, i, e.currentTarget, roll)}
                    aria-label={`${ph.title}. ${ph.stock}, ${ph.settings}. Open the print.`}
                  >
                    <img src={asset(ph.src)} alt="" loading="lazy" decoding="async" draggable={false} />
                  </button>
                  <span className="cs-sheet-tag" aria-hidden="true">
                    <b>{ph.title}</b>
                    <span>
                      {ph.stock} · {ph.settings}
                    </span>
                  </span>
                  <CellMarks mark={marks[i] ?? 'none'} />
                </FilmCell>
              </li>
            )
          })}
        </ul>
        <p className="cs-sheet__foot">
          <span>Contact print · grade 2 · 9s at f/8</span>
          <span>Hover for notes · click to enlarge</span>
        </p>
      </div>
    </div>
  )
}

export default function Photographs({ onOpen }: { onOpen: OpenPrint }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 769px)' }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean }
        const groups = gsap.utils.toArray<HTMLElement>('[data-marks]')
        if (!motion) {
          groups.forEach((g) => markTimeline(g).progress(1))
          return
        }
        groups.forEach((g) => {
          const tl = markTimeline(g)
          ScrollTrigger.create({ trigger: g, start: 'top 60%', once: true, onEnter: () => tl.play() })
        })
        gsap.utils.toArray<HTMLElement>('.cs-sheet').forEach((sheet, i) => {
          gsap.fromTo(
            sheet,
            { y: 80, rotation: desktop ? (i % 2 ? -2.2 : 2) : 0 },
            {
              y: 0,
              rotation: desktop ? (i % 2 ? 0.5 : -0.4) : 0,
              ease: 'power2.out',
              scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'top 35%', scrub: 0.9 },
            },
          )
          // frames settle onto the paper strip by strip
          gsap.from(sheet.querySelectorAll('.cs-sheet-cell'), {
            opacity: 0,
            y: 14,
            duration: 0.6,
            ease: 'power2.out',
            stagger: { each: 0.025 },
            scrollTrigger: { trigger: sheet, start: 'top 92%', once: true },
          })
        })
      })
    },
    { scope: root },
  )

  return (
    <section className="cs-photos" id="cs-photos" ref={root} aria-labelledby="cs-photos-title">
      <header className="cs-sechead">
        <p className="cs-kicker">
          <span>Roll 02</span>
          <Tri />
          <span>Photographs</span>
          <Tri />
          <span>{streetPhotos.length} exp.</span>
        </p>
        <h2 className="cs-h2" id="cs-photos-title">
          Photographs, <em>off the clock</em>
        </h2>
        <p className="cs-sechead__dek">
          Street, travel, everyday. Mostly digital, the odd roll of film. Hover a frame for its notes, or open it as a print.
        </p>
      </header>

      <div className="cs-photos__street">
        <Sheet
          photos={streetPhotos}
          roll="02"
          name="Street"
          stock="KODAK PORTRA 400"
          marks={{ 0: 'loop', 4: 'star', 7: 'crop', 10: 'tick', 15: 'query' }}
          onOpen={onOpen}
        />
        <Tape className="cs-tape--tl" />
        <Tape className="cs-tape--tr" />
        <span className="cs-photos__note">
          <GreaseNote text="the keeper" />
        </span>
      </div>

      <div className="cs-photos__nightwrap">
      <header className="cs-sechead cs-sechead--small">
        <p className="cs-kicker">
          <span>Roll 03</span>
          <Tri />
          <span>Night</span>
          <Tri />
          <span>{skyPhotos.length} exp.</span>
        </p>
        <h3 className="cs-h3">
          Night, <em>shutter open</em>
        </h3>
        <p className="cs-sechead__dek">
          After dark it’s long exposures: star trails, aurora, the Milky Way. Strictly speaking
          not a roll at all.
        </p>
      </header>
      <div className="cs-photos__night">
        <Sheet
          photos={skyPhotos}
          roll="03"
          name="Night"
          stock="DIGITAL · LONG EXPOSURE"
          marks={{ 1: 'loop', 3: 'star' }}
          onOpen={onOpen}
          className="cs-sheet--night"
          cols={3}
        />
        <Tape className="cs-tape--tr" />
      </div>
      </div>
    </section>
  )
}

