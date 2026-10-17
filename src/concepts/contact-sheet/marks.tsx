import type { MarkKind } from './data'

/*
 * Grease-pencil marks, drawn by hand as wobbly cubic beziers (never perfect ellipses).
 * Every stroke has class `cs-gp` so DrawSVG can draw it; notes have class `cs-gp-note`
 * and are revealed left-to-right as if written.
 * Cell marks use the cell's own coordinate space: 380 × 350 (10× film units),
 * with the image window at x 10–370, y 55–295.
 */

/** Shared SVG defs: a waxy, slightly broken edge for grease pencil. Render once per page. */
export function MarkDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <filter id="cs-wax" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="cs-stamp-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="3" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  4.4 0 0 0 -1.25" result="holes" />
          <feComposite in="SourceGraphic" in2="holes" operator="in" />
        </filter>
      </defs>
    </svg>
  )
}

export const LOOP =
  'M262 -6C150 -22 30 -8 0 52C-22 100 -24 236 6 298C30 352 186 370 302 360C380 352 406 290 400 186C396 92 362 18 284 -2C236 -14 178 -6 148 10'

const STAR = 'M1 -23Q8 -2 13.5 18.5Q-4 7 -21.5 -6Q0 -8 21.5 -7.5Q3 6 -13 19Q-6 0 2.5 -20'
const TICK = 'M-16 -2C-11 3 -7 9 -3 15C3 2 11 -10 24 -20'

/** Marks for one frame of film. */
export function CellMarks({ mark, note }: { mark: MarkKind; note?: string }) {
  if (mark === 'none' && !note) return null
  return (
    <svg className="cs-marks" viewBox="0 0 380 350" aria-hidden="true" focusable="false">
      <g className="cs-gp-g" filter="url(#cs-wax)">
        {mark === 'loop' && (
          <>
            <path className="cs-gp" d={LOOP} />
            {note && (
              <text className="cs-gp-note cs-gp-note--loop" x="-62" y="-6" textAnchor="end" transform="rotate(-5 -62 -6)">
                {note}
              </text>
            )}
            {note && <path className="cs-gp" d={TICK} transform="translate(-36 -24) scale(1.05)" />}
          </>
        )}
        {mark === 'star' && <path className="cs-gp" d={STAR} transform="translate(336 34) rotate(8)" />}
        {mark === 'tick' && <path className="cs-gp" d={TICK} transform="translate(340 28) scale(1.3)" />}
        {mark === 'arrow' && (
          <g transform="translate(268 -38)">
            <path className="cs-gp" d="M0 0C10 20 26 40 58 62" />
            <path className="cs-gp" d="M38 61 59 63 56 42" />
          </g>
        )}
        {mark === 'crop' && (
          <>
            <path className="cs-gp" d="M66 128 63 86 110 83" />
            <path className="cs-gp" d="M314 222 317 266 270 269" />
          </>
        )}
        {mark === 'query' && (
          <text className="cs-gp-note cs-gp-note--big" x="332" y="48" transform="rotate(10 332 48)">
            ?
          </text>
        )}
      </g>
    </svg>
  )
}

/** A loose loop around a stat or word. Sized by its container (aspect 200:110). */
export function GreaseCircle({ className = '' }: { className?: string }) {
  return (
    <svg className={`cs-gcircle ${className}`} viewBox="0 0 200 110" aria-hidden="true" focusable="false">
      <path
        className="cs-gp"
        filter="url(#cs-wax)"
        d="M128 9C74 -1 12 14 6 52C1 86 58 104 118 101C170 98 198 74 193 46C188 18 150 4 96 8C78 10 62 14 50 20"
      />
    </svg>
  )
}

/** A short handwritten note with a curved arrow pointing down-left at its anchor. */
export function GreaseNote({ text, className = '', flip = false }: { text: string; className?: string; flip?: boolean }) {
  return (
    <span className={`cs-gnote ${flip ? 'is-flip' : ''} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 220 120" focusable="false">
        <g filter="url(#cs-wax)">
          <text className="cs-gp-note" x="70" y="40" transform="rotate(-6 70 40)">
            {text}
          </text>
          <path className="cs-gp" d="M84 54C60 62 40 76 26 104" />
          <path className="cs-gp" d="M14 86 25 106 44 96" />
        </g>
      </svg>
    </span>
  )
}

/** Underline scribble. */
export function GreaseUnderline({ className = '' }: { className?: string }) {
  return (
    <svg className={`cs-gunder ${className}`} viewBox="0 0 240 24" aria-hidden="true" focusable="false">
      <path className="cs-gp" filter="url(#cs-wax)" d="M4 14C60 6 140 4 236 9C170 12 100 16 40 20" />
    </svg>
  )
}

/** Hand-drawn star, standalone. */
export function GreaseStar({ className = '' }: { className?: string }) {
  return (
    <svg className={`cs-gstar ${className}`} viewBox="-30 -30 60 60" aria-hidden="true" focusable="false">
      <path className="cs-gp" filter="url(#cs-wax)" d={STAR} />
    </svg>
  )
}

/** Hand-drawn tick, standalone. */
export function GreaseTick({ className = '' }: { className?: string }) {
  return (
    <svg className={`cs-gtick ${className}`} viewBox="-24 -26 52 46" aria-hidden="true" focusable="false">
      <path className="cs-gp" filter="url(#cs-wax)" d={TICK} />
    </svg>
  )
}
