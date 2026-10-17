// Screenshot a page at several scroll positions. Dev tooling for checking scroll-driven designs.
//   node scripts/shoot.mjs --url http://localhost:5173/#/long-exposure --out shots/le \
//     [--stops 0,0.1,0.25,0.5,1] (fractions of scrollable height) [--px 0,900,1800] \
//     [--w 1440] [--h 900] [--mobile] [--wait 1400] [--intro 2500]
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : 'true'])
    return acc
  }, []),
)
const mobile = args.mobile === 'true'
const w = Number(args.w ?? (mobile ? 390 : 1440))
const h = Number(args.h ?? (mobile ? 844 : 900))
const out = args.out ?? 'shots/shot'
fs.mkdirSync(path.dirname(out), { recursive: true })

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile })
const logs = []
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`) })
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))

await page.goto(args.url, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(Number(args.intro ?? 2500))
const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
const stops = args.px
  ? args.px.split(',').map(Number)
  : (args.stops ?? '0,0.2,0.4,0.6,0.8,1').split(',').map((f) => Math.round(Number(f) * total))

for (const [i, y] of stops.entries()) {
  await page.evaluate((y) => {
    const l = window.__lenis
    if (l) l.scrollTo(y, { immediate: true, force: true })
    else window.scrollTo(0, y)
  }, y)
  // nudge so scroll listeners/scrubs settle
  await page.mouse.move(w / 2, h / 2)
  await page.waitForTimeout(Number(args.wait ?? 1400))
  const file = `${out}-${String(i).padStart(2, '0')}.png`
  await page.screenshot({ path: file })
  console.log(`${file}  y=${y}/${total}`)
}
if (logs.length) console.log('CONSOLE:\n' + [...new Set(logs)].slice(0, 30).join('\n'))
else console.log('console clean')
await browser.close()
