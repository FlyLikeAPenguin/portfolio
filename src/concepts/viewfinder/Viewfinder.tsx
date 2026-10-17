import { experiments } from '../../content'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/jetbrains-mono'
import './styles/base.css'
import './styles/focus.css'
import './styles/hero.css'
import './styles/overlay.css'
import './styles/dial.css'
import './styles/shutter.css'
import './styles/work.css'
import './styles/specs.css'
import './styles/career.css'
import './styles/rest.css'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useSmoothScroll, scrollTo } from '../../shared/useSmoothScroll'
import { ShutterProvider } from './Shutter'
import Overlay from './Overlay'
import ShutterDial from './ShutterDial'
import Hero from './Hero'
import Work from './Work'
import Specs from './Specs'
import Career from './Career'
import Prints from './Prints'
import Experiments from './Experiments'
import Contact from './Contact'
import { SECTIONS } from './sections'
import { dialPos, vf } from './store'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * VIEWFINDER: the portfolio as a precise mechanical instrument. Look through Joe's OM-1:
 * the iris opens, headings rack into focus on a split-image screen, the match needle
 * meters your scrolling and the shutter-speed dial is the navigation.
 */
export default function Viewfinder() {
  useSmoothScroll({ lerp: 0.085 })
  const root = useRef<HTMLDivElement>(null)
  // fresh roll on every mount, before any child effect writes a reading
  useState(() => vf.reset())

  useEffect(() => {
    const prev = document.body.style.background
    document.body.style.background = '#0c0c0c'
    return () => {
      document.body.style.background = prev
    }
  }, [])

  // section tracking → dial position (continuous) and current section (discrete)
  useGSAP(
    () => {
      // one page-long trigger maps scroll → section; robust to jumps (dial clicks, keyboard)
      let tops: number[] = []
      const measure = () => {
        tops = SECTIONS.map((s) => {
          const el = document.getElementById(s.id)
          return el ? el.getBoundingClientRect().top + window.scrollY : 0
        })
      }
      const update = () => {
        if (!tops.length) return
        const y = window.scrollY + window.innerHeight * 0.55
        let i = 0
        while (i < tops.length - 1 && y >= tops[i + 1]) i++
        vf.set({ section: i })
        const s = SECTIONS[i]
        const next = SECTIONS[i + 1]
        const t = next ? Math.min(1, Math.max(0, (y - tops[i]) / (tops[i + 1] - tops[i]))) : 0
        dialPos.set(next ? s.pos + (next.pos - s.pos) * t : s.pos)
      }
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: update,
        onRefresh: () => {
          measure()
          update()
        },
      })
      ScrollTrigger.refresh()
      let alive = true
      document.fonts?.ready.then(() => alive && ScrollTrigger.refresh())
      const onLoad = () => ScrollTrigger.refresh()
      window.addEventListener('load', onLoad)
      return () => {
        alive = false
        window.removeEventListener('load', onLoad)
      }
    },
    { scope: root },
  )

  return (
    <div className="vf" ref={root}>
      <ShutterProvider>
        <a
          className="vf-skip"
          href="#vf-work"
          onClick={(e) => {
            e.preventDefault()
            const el = document.getElementById('vf-work')
            if (el) {
              scrollTo(el)
              el.setAttribute('tabindex', '-1')
              el.focus({ preventScroll: true })
            }
          }}
        >
          Skip to work
        </a>
        <Overlay />
        <main>
          <Hero />
          <Work />
          <Specs />
          <Career />
          <Prints />
          {experiments.length > 0 && <Experiments />}
          <Contact />
        </main>
        <ShutterDial />
      </ShutterProvider>
    </div>
  )
}
