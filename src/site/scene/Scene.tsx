import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  DataTexture,
  DoubleSide,
  Group,
  Line,
  LineLoop,
  Mesh,
  PlaneGeometry,
  Points,
  SRGBColorSpace,
  ShaderMaterial,
  SphereGeometry,
  TextureLoader,
  Vector3,
  type PerspectiveCamera,
  type Texture,
} from 'three'
import { asset, earthTextures } from '../../content'
import { S, SHOT_KEYS } from '../store'
import { ALT_KM, DEG, MASK, R_ORBIT, STATIONS, TAU, angDist } from './orbit'
import { geoToLocal, orbitPos, orbitVel, subPoint } from './orbit3'
import * as sh from './shaders'

const MINT = new Color('#9ef0c6')
const AMBER = new Color('#ffb547')
const HAIR = new Color('#c9d4de')

const blank = () => {
  const t = new DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1)
  t.needsUpdate = true
  return t
}

/** Fixed, full-viewport WebGL layer behind the page. */
export default function Scene({ mobile }: { mobile: boolean }) {
  return (
    <div className="gs-canvas" aria-hidden="true">
      <Canvas
        flat
        dpr={mobile ? 1 : [1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', stencil: false }}
        camera={{ fov: 22, near: 0.01, far: 500, position: [0, 0, 7] }}
      >
        <color attach="background" args={['#05070b']} />
        <World mobile={mobile} />
      </Canvas>
    </div>
  )
}

function makeStars(count: number) {
  const pos = new Float32Array(count * 3)
  const size = new Float32Array(count)
  const seed = new Float32Array(count)
  const col = new Float32Array(count * 3)
  // A faint galactic band: a share of the stars cluster around a tilted great circle.
  const bandN = new Vector3(0.35, 0.82, -0.45).normalize()
  const e1 = new Vector3(1, 0, 0).cross(bandN).normalize()
  const e2 = bandN.clone().cross(e1)
  const v = new Vector3()
  const c = new Color()
  for (let i = 0; i < count; i++) {
    if (i % 3 === 0) {
      const a = Math.random() * TAU
      const off = (Math.random() + Math.random() + Math.random() - 1.5) * 0.22
      v.copy(e1).multiplyScalar(Math.cos(a)).addScaledVector(e2, Math.sin(a)).addScaledVector(bandN, off).normalize()
    } else {
      const z = Math.random() * 2 - 1
      const a = Math.random() * TAU
      const r = Math.sqrt(1 - z * z)
      v.set(r * Math.cos(a), z, r * Math.sin(a))
    }
    v.multiplyScalar(150)
    pos.set([v.x, v.y, v.z], i * 3)
    const big = Math.random()
    size[i] = big > 0.985 ? 2.8 + Math.random() * 1.2 : 1.6 + Math.pow(Math.random(), 3) * 1.4
    seed[i] = Math.random()
    const tint = Math.random()
    c.setRGB(0.75 + 0.25 * tint, 0.82 + 0.12 * tint, 1.0 - 0.18 * tint)
    const b = 0.35 + Math.random() * 0.65
    col.set([c.r * b, c.g * b, c.b * b], i * 3)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(pos, 3))
  g.setAttribute('aSize', new BufferAttribute(size, 1))
  g.setAttribute('aSeed', new BufferAttribute(seed, 1))
  g.setAttribute('aColor', new BufferAttribute(col, 3))
  return g
}

function makeOrbit() {
  const n = 720
  const pos = new Float32Array(n * 3)
  const aU = new Float32Array(n)
  const v = new Vector3()
  for (let i = 0; i < n; i++) {
    const u = (i / n) * TAU
    orbitPos(u, R_ORBIT, v)
    pos.set([v.x, v.y, v.z], i * 3)
    aU[i] = u
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(pos, 3))
  g.setAttribute('aU', new BufferAttribute(aU, 1))
  return g
}

function makeCircle(lat: number, lon: number) {
  const n = 160
  const c = geoToLocal(lat, lon)
  const e1 = new Vector3(0, 1, 0).cross(c).normalize()
  const e2 = c.clone().cross(e1).normalize()
  const pos = new Float32Array(n * 3)
  const aA = new Float32Array(n)
  const v = new Vector3()
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU
    v.copy(c)
      .multiplyScalar(Math.cos(MASK))
      .addScaledVector(e1, Math.cos(a) * Math.sin(MASK))
      .addScaledVector(e2, Math.sin(a) * Math.sin(MASK))
      .multiplyScalar(1.0025)
    pos.set([v.x, v.y, v.z], i * 3)
    aA[i] = i / n
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(pos, 3))
  g.setAttribute('aA', new BufferAttribute(aA, 1))
  return g
}

const fmtLat = (r: number) => `${Math.abs(r / DEG).toFixed(2).padStart(5, '0')}°${r >= 0 ? 'N' : 'S'}`
const fmtLon = (r: number) => `${Math.abs(r / DEG).toFixed(2).padStart(6, '0')}°${r >= 0 ? 'E' : 'W'}`

function World({ mobile }: { mobile: boolean }) {
  const gl = useThree((s) => s.gl)
  const earthGroup = useRef<Group>(null)

  const mats = useMemo(() => {
    const earth = new ShaderMaterial({
      vertexShader: sh.earthVert,
      fragmentShader: sh.earthFrag,
      uniforms: {
        uDay: { value: blank() as Texture },
        uNight: { value: blank() as Texture },
        uSun: { value: new Vector3(1, 0.3, -0.5).normalize() },
        uReveal: { value: 0 },
        uLights: { value: 1 },
      },
    })
    const atmo = new ShaderMaterial({
      vertexShader: sh.atmoVert,
      fragmentShader: sh.atmoFrag,
      uniforms: {
        uSun: earth.uniforms.uSun,
        uR: { value: 1.0 },
        uRa: { value: 1.05 },
        uReveal: { value: 0 },
      },
      side: BackSide,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
    })
    const stars = new ShaderMaterial({
      vertexShader: sh.starsVert,
      fragmentShader: sh.starsFrag,
      uniforms: { uTime: { value: 0 }, uPx: { value: 1 }, uReveal: { value: 0 } },
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    })
    const sat = new ShaderMaterial({
      vertexShader: sh.satVert,
      fragmentShader: sh.satFrag,
      uniforms: {
        uSize: { value: 54 },
        uPx: { value: 1 },
        uColA: { value: MINT.clone() },
        uColB: { value: AMBER.clone() },
        uAos: { value: 0 },
        uTime: { value: 0 },
        uReveal: { value: 0 },
      },
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
    })
    const orbit = new ShaderMaterial({
      vertexShader: sh.orbitVert,
      fragmentShader: sh.orbitFrag,
      uniforms: {
        uSatU: { value: 0 },
        uBase: { value: HAIR.clone() },
        uTrail: { value: MINT.clone() },
        uBaseA: { value: 0.16 },
        uReveal: { value: 0 },
      },
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
    })
    const beam = new ShaderMaterial({
      vertexShader: sh.beamVert,
      fragmentShader: sh.beamFrag,
      uniforms: { uTime: { value: 0 }, uStrength: { value: 0 }, uCol: { value: AMBER.clone() } },
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
    })
    const markers = STATIONS.map(
      (_, i) =>
        new ShaderMaterial({
          vertexShader: sh.markerVert,
          fragmentShader: sh.markerFrag,
          uniforms: {
            uTime: { value: 0 },
            uActive: { value: 0 },
            uPhase: { value: i * 0.31 },
            uIdle: { value: MINT.clone() },
            uHot: { value: AMBER.clone() },
            uReveal: { value: 0 },
          },
          blending: AdditiveBlending,
          transparent: true,
          depthWrite: false,
        }),
    )
    const circles = STATIONS.map(
      () =>
        new ShaderMaterial({
          vertexShader: sh.circleVert,
          fragmentShader: sh.circleFrag,
          uniforms: {
            uTime: { value: 0 },
            uActive: { value: 0 },
            uIdle: { value: MINT.clone() },
            uHot: { value: AMBER.clone() },
            uReveal: { value: 0 },
          },
          blending: AdditiveBlending,
          transparent: true,
          depthWrite: false,
        }),
    )
    return { earth, atmo, stars, sat, orbit, beam, markers, circles }
  }, [])

  const geo = useMemo(() => {
    const seg = mobile ? [72, 48] : [160, 112]
    const beamGeo = new ConeGeometry(1, 1, 40, 1, true)
    beamGeo.translate(0, -0.5, 0)
    const satGeo = new BufferGeometry()
    satGeo.setAttribute('position', new BufferAttribute(new Float32Array(3), 3))
    const lineGeo = new BufferGeometry()
    lineGeo.setAttribute('position', new BufferAttribute(new Float32Array(6), 3))
    return {
      earth: new SphereGeometry(1, seg[0], seg[1]),
      atmo: new SphereGeometry(1.05, mobile ? 64 : 96, mobile ? 48 : 64),
      stars: makeStars(mobile ? 1400 : 4200),
      orbit: makeOrbit(),
      beam: beamGeo,
      sat: satGeo,
      marker: new PlaneGeometry(0.2, 0.2),
      circles: STATIONS.map((s) => makeCircle(s.lat, s.lon)),
      stationLocal: STATIONS.map((s) => geoToLocal(s.lat, s.lon)),
    }
  }, [mobile])

  const lines = useMemo(() => {
    const beamLineMat = new ShaderMaterial({
      vertexShader: `void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float uStrength; uniform vec3 uCol;
void main(){ gl_FragColor = vec4(uCol * uStrength * 0.9, 1.0);
#include <colorspace_fragment>
}`,
      uniforms: { uStrength: { value: 0 }, uCol: { value: AMBER.clone() } },
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
    })
    const blg = new BufferGeometry()
    blg.setAttribute('position', new BufferAttribute(new Float32Array(6), 3))
    return {
      circles: STATIONS.map((_, i) => new LineLoop(geo.circles[i], mats.circles[i])),
      orbit: new Line(geo.orbit, mats.orbit),
      beam: new Line(blg, beamLineMat),
    }
  }, [geo, mats])

  // Textures load outside Suspense so the stars and HUD are never blocked by a 0.8 MB JPEG.
  useEffect(() => {
    let alive = true
    const loader = new TextureLoader()
    const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy())
    Promise.all([loader.loadAsync(asset(earthTextures.day)), loader.loadAsync(asset(earthTextures.night))])
      .then(([day, night]) => {
        if (!alive) return
        for (const t of [day, night]) {
          t.colorSpace = SRGBColorSpace
          t.anisotropy = aniso
        }
        mats.earth.uniforms.uDay.value = day
        mats.earth.uniforms.uNight.value = night
        S.ready = true
      })
      .catch(() => {
        S.ready = true
      })
    return () => {
      alive = false
    }
  }, [gl, mats])

  useEffect(
    () => () => {
      Object.values(mats).flat().forEach((m) => (m as ShaderMaterial).dispose())
    },
    [mats],
  )

  const starsRef = useRef<Points>(null)
  const satRef = useRef<Points>(null)
  const beamRef = useRef<Mesh>(null)
  const beamLine = useRef<Line>(null)

  const v = useMemo(
    () => ({
      sat: new Vector3(),
      r: new Vector3(),
      vel: new Vector3(),
      n: new Vector3(),
      dir: new Vector3(),
      look: new Vector3(),
      up: new Vector3(),
      upC: new Vector3(),
      sun: new Vector3(),
      a: new Vector3(),
      b: new Vector3(),
      c: new Vector3(),
      st: STATIONS.map(() => new Vector3()),
      down: new Vector3(0, -1, 0),
      proj: new Vector3(),
    }),
    [],
  )
  const live = useRef({ link: 0, act: STATIONS.map(() => 0), hudT: 0, lastLat: '', lastLon: '', lastAlt: '', lastVel: '', dim: -1, veil: -1, earthIn: 0 })

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.5)
    const c = S.cur
    const tg = S.target
    const k = S.reduced ? 1 : 1 - Math.exp(-dt * 3.2)
    for (const key of SHOT_KEYS) c[key] += (tg[key] - c[key]) * k
    const L = live.current
    const time = S.reduced ? 0 : state.clock.elapsedTime

    // Idle drift (hero only): bounded so scroll keys always land the satellite on its station.
    const uI = c.idle * 0.16 * (1 - Math.exp(-time / 40))
    const thI = c.idle * 0.3 * (1 - Math.exp(-time / 70))
    const u = c.u + uI
    const th = c.th + thI

    orbitPos(u, R_ORBIT, v.sat)
    if (earthGroup.current) earthGroup.current.rotation.y = th

    // Camera rig: anchored to a point on the orbit, framed with a lens shift.
    const cam = state.camera as PerspectiveCamera
    orbitPos(c.cu, 1, v.r)
    orbitVel(c.cu, v.vel)
    v.n.crossVectors(v.r, v.vel)
    v.dir.copy(v.r).addScaledVector(v.n, c.side).addScaledVector(v.vel, -c.back).normalize()
    cam.position.copy(v.dir).multiplyScalar(c.dist)
    orbitPos(c.cu, R_ORBIT, v.look).multiplyScalar(c.look)
    v.upC.copy(v.vel).negate()
    if (v.upC.y < 0) v.upC.negate()
    v.up.set(0, 1, 0).multiplyScalar(1 - c.chase).addScaledVector(v.upC, c.chase).normalize()
    cam.up.copy(v.up)
    cam.lookAt(v.look)
    const { width: W, height: H } = state.size
    cam.fov = c.fov
    cam.setViewOffset(W, H, -c.sx * W, -c.sy * H, W, H)
    cam.updateProjectionMatrix()
    cam.updateMatrixWorld()

    // Sun is placed relative to the camera so the visible face stays night-side with a lit limb.
    const e = cam.matrixWorld.elements
    v.sun
      .set(e[0] * c.sunX + e[4] * c.sunY - e[8] * c.sunZ, e[1] * c.sunX + e[5] * c.sunY - e[9] * c.sunZ, e[2] * c.sunX + e[6] * c.sunY - e[10] * c.sunZ)
      .normalize()
    mats.earth.uniforms.uSun.value.copy(v.sun)

    // Fade-ins.
    L.earthIn += ((S.ready ? 1 : 0) - L.earthIn) * (1 - Math.exp(-dt * 2.5))
    const rv = S.reveal.v
    mats.earth.uniforms.uReveal.value = rv * L.earthIn
    mats.atmo.uniforms.uReveal.value = rv * L.earthIn
    mats.stars.uniforms.uReveal.value = 0.25 + 0.75 * rv
    mats.stars.uniforms.uTime.value = time
    mats.stars.uniforms.uPx.value = gl.getPixelRatio()
    if (starsRef.current) starsRef.current.position.copy(cam.position)

    // Ground stations, contact circles and the downlink beam.
    const sp = subPoint(v.sat, th)
    let best = -1
    let bestD = 9
    STATIONS.forEach((s, i) => {
      const loc = geo.stationLocal[i]
      const ct = Math.cos(th)
      const st = Math.sin(th)
      v.st[i].set(loc.x * ct + loc.z * st, loc.y, -loc.x * st + loc.z * ct)
      const d = angDist(sp.lat, sp.lon, s.lat * DEG, s.lon * DEG)
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    // No contact while idling in the hero: the first AOS belongs to pass 01.
    const linkTarget = (bestD < MASK ? 1 - smoothstep(MASK * 0.72, MASK, bestD) : 0) * (1 - c.idle)
    L.link += (linkTarget - L.link) * (1 - Math.exp(-dt * 5))
    S.link = L.link
    S.linkStation = L.link > 0.05 ? best : -1
    STATIONS.forEach((_, i) => {
      const want = i === best ? L.link : 0
      L.act[i] += (want - L.act[i]) * (1 - Math.exp(-dt * 4))
      const mu = mats.markers[i].uniforms
      mu.uActive.value = L.act[i]
      mu.uTime.value = time
      mu.uReveal.value = rv * L.earthIn * (1 - c.dim * 0.6)
      const cu2 = mats.circles[i].uniforms
      cu2.uActive.value = L.act[i]
      cu2.uTime.value = time
      cu2.uReveal.value = rv * L.earthIn * (1 - c.dim * 0.6)
    })

    const beam = beamRef.current
    if (beam) {
      const target = v.st[Math.max(best, 0)]
      v.a.copy(target).sub(v.sat)
      const len = v.a.length()
      v.a.divideScalar(len)
      beam.position.copy(v.sat)
      beam.quaternion.setFromUnitVectors(v.down, v.a)
      const br = 0.008 + len * 0.045
      beam.scale.set(br, len, br)
      beam.visible = L.link > 0.01
      const quiet = 1 - c.dim * 0.85
      mats.beam.uniforms.uStrength.value = L.link * rv * quiet
      mats.beam.uniforms.uTime.value = time
      if (beamLine.current) {
        const arr = (beamLine.current.geometry.attributes.position as BufferAttribute).array as Float32Array
        arr.set([v.sat.x, v.sat.y, v.sat.z, target.x, target.y, target.z])
        beamLine.current.geometry.attributes.position.needsUpdate = true
        beamLine.current.visible = beam.visible
        ;(beamLine.current.material as ShaderMaterial).uniforms.uStrength.value = L.link * rv * quiet
      }
    }

    // Satellite and its orbit trail.
    if (satRef.current) {
      const arr = (satRef.current.geometry.attributes.position as BufferAttribute).array as Float32Array
      arr[0] = v.sat.x
      arr[1] = v.sat.y
      arr[2] = v.sat.z
      satRef.current.geometry.attributes.position.needsUpdate = true
    }
    const su = mats.sat.uniforms
    su.uAos.value = L.link
    su.uTime.value = time
    su.uPx.value = gl.getPixelRatio()
    su.uReveal.value = rv
    su.uSize.value = mobile ? 44 : 54
    mats.orbit.uniforms.uSatU.value = ((u % TAU) + TAU) % TAU
    mats.orbit.uniforms.uReveal.value = rv

    // Projected overlay: satellite reticle and station tags.
    const sizeW = W
    const sizeH = H
    const ret = S.reticle
    if (ret) {
      v.proj.copy(v.sat).project(cam)
      // Hidden when the Earth is between camera and satellite.
      const occluded = segmentHitsSphere(cam.position, v.sat)
      const on = !occluded && v.proj.z < 1 && Math.abs(v.proj.x) < 1.1 && Math.abs(v.proj.y) < 1.1
      const x = (v.proj.x * 0.5 + 0.5) * sizeW
      const y = (-v.proj.y * 0.5 + 0.5) * sizeH
      ret.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      ret.style.opacity = on ? String(rv * (0.35 + 0.65 * (1 - c.dim))) : '0'
      ret.dataset.link = L.link > 0.5 ? 'aos' : 'idle'
      ret.dataset.flip = x > sizeW * 0.74 ? '1' : '0'
    }
    STATIONS.forEach((_, i) => {
      const tag = S.stationTags[i]
      if (!tag) return
      v.b.copy(v.st[i])
      v.c.copy(cam.position).sub(v.b).normalize()
      const facing = v.b.dot(v.c)
      v.proj.copy(v.b).project(cam)
      const x = (v.proj.x * 0.5 + 0.5) * sizeW
      const y = (-v.proj.y * 0.5 + 0.5) * sizeH
      const vis = smoothstep(0.12, 0.35, facing) * rv * L.earthIn * (1 - c.dim * 0.85)
      tag.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      tag.style.opacity = vis.toFixed(3)
      tag.dataset.link = L.act[i] > 0.5 ? 'aos' : 'idle'
    })

    // Scrims follow the shot.
    if (S.scrimDim && Math.abs(L.dim - c.dim) > 0.002) {
      L.dim = c.dim
      S.scrimDim.style.opacity = c.dim.toFixed(3)
    }
    if (S.scrimVeil && Math.abs(L.veil - c.veil) > 0.002) {
      L.veil = c.veil
      S.scrimVeil.style.opacity = c.veil.toFixed(3)
    }

    // HUD telemetry (throttled to ~12 Hz, writes only on change).
    L.hudT += dt
    if (L.hudT > 0.08) {
      L.hudT = 0
      const lat = fmtLat(sp.lat)
      const lon = fmtLon(sp.lon)
      const alt = (ALT_KM + 2.6 * Math.sin(u * 2 + 0.4)).toFixed(1)
      const vel = (7.612 - 0.0034 * Math.sin(u * 2 + 0.4)).toFixed(3)
      const h = S.hud
      if (h.lat && lat !== L.lastLat) h.lat.textContent = L.lastLat = lat
      if (h.lon && lon !== L.lastLon) h.lon.textContent = L.lastLon = lon
      if (h.alt && alt !== L.lastAlt) h.alt.textContent = L.lastAlt = alt
      if (h.vel && vel !== L.lastVel) h.vel.textContent = L.lastVel = vel
    }
  })


  return (
    <>
      <points ref={starsRef} geometry={geo.stars} material={mats.stars} renderOrder={-1} frustumCulled={false} />
      <group ref={earthGroup}>
        <mesh geometry={geo.earth} material={mats.earth} />
        {STATIONS.map((s, i) => (
          <StationMarker key={s.id} local={geo.stationLocal[i]} geometry={geo.marker} material={mats.markers[i]} />
        ))}
        {STATIONS.map((s, i) => (
          <primitive key={`c-${s.id}`} object={lines.circles[i]} renderOrder={3} />
        ))}
      </group>
      <mesh geometry={geo.atmo} material={mats.atmo} renderOrder={2} />
      <primitive object={lines.orbit} renderOrder={3} frustumCulled={false} />
      <mesh ref={beamRef} geometry={geo.beam} material={mats.beam} renderOrder={4} frustumCulled={false} visible={false} />
      <primitive ref={beamLine} object={lines.beam} renderOrder={4} frustumCulled={false} />
      <points ref={satRef} geometry={geo.sat} material={mats.sat} renderOrder={6} frustumCulled={false} />
    </>
  )
}

function StationMarker({ local, geometry, material }: { local: Vector3; geometry: PlaneGeometry; material: ShaderMaterial }) {
  const ref = useRef<Mesh>(null)
  useEffect(() => {
    const m = ref.current
    if (!m) return
    m.position.copy(local).multiplyScalar(1.003)
    m.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), local)
  }, [local])
  return <mesh ref={ref} geometry={geometry} material={material} renderOrder={3} />
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

const _d = new Vector3()
const _o = new Vector3()
/** True if the segment from camera to point passes through the unit sphere. */
function segmentHitsSphere(from: Vector3, to: Vector3) {
  _d.copy(to).sub(from)
  const len = _d.length()
  _d.divideScalar(len)
  _o.copy(from)
  const b = _o.dot(_d)
  const cc = _o.lengthSq() - 1
  const disc = b * b - cc
  if (disc < 0) return false
  const t = -b - Math.sqrt(disc)
  return t > 0 && t < len - 0.01
}
