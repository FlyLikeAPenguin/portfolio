/**
 * GPU star trails: one full-screen fragment pass evaluates, for every pixel, the handful of stars
 * whose circle passes within a pixel or two of it. Each trail is an exact annulus segment with
 * box-filtered edges, so it stays crisp and delicate at any length, and a redraw costs the same
 * at 3° of sweep as at 300°. Stars live in float textures, indexed by 1px radial bins.
 */
import { NBINS, type Field, type StarRec } from './skyEngine'

const ROW = 1024
const GLOW_BIN = 8
/** Only the brightest bins get a halo along the trail. */
const GLOW_FROM = NBINS - 2

const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp isampler2D;

uniform sampler2D uA;        // r, angle, width, alpha
uniform sampler2D uB;        // rgb, brightness bin
uniform isampler2D uBins;    // per 1px radial bin: first star, count
uniform sampler2D uGA;       // bright stars only (for the halo)
uniform sampler2D uGB;
uniform isampler2D uGBins;   // per ${GLOW_BIN}px radial bin
uniform vec2 uPole;
uniform vec2 uRes;
uniform float uDpr;
uniform float uSweep;
uniform float uHeadMin;
uniform float uFade[${NBINS}];
uniform int uNBins;
uniform int uNGBins;
out vec4 fragColor;

const float TAU = 6.283185307179586;

ivec2 at(int i) { return ivec2(i & ${ROW - 1}, i >> ${Math.log2(ROW)}); }

// Box-filtered coverage of the band [-hw, hw] by a pixel of width px centred at d.
float band(float d, float hw, float px) {
  return clamp((min(d + 0.5 * px, hw) - max(d - 0.5 * px, -hw)) / px, 0.0, 1.0);
}

// Coverage along the arc: the trail runs from the tail (delta = 0) to the head (delta = sweep).
float along(float delta, float rs, float px) {
  float L = uSweep * rs;
  float u = delta * rs;
  float u2 = (delta - TAU) * rs;
  return max(band(u - 0.5 * L, 0.5 * L, px), band(u2 - 0.5 * L, 0.5 * L, px));
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 v = p - uPole;
  float r = length(v);
  float th = atan(v.y, v.x);
  float px = 1.0 / uDpr;
  vec3 acc = vec3(0.0);
  float sw = max(uSweep, 1e-4);

  int b0 = max(0, int(floor(r - 2.0)));
  int b1 = min(uNBins - 1, int(floor(r + 2.0)));
  for (int b = b0; b <= b1; b++) {
    ivec2 bc = texelFetch(uBins, at(b), 0).rg;
    for (int k = 0; k < bc.y; k++) {
      int i = bc.x + k;
      vec4 s = texelFetch(uA, at(i), 0);
      vec4 c = texelFetch(uB, at(i), 0);
      float fade = uFade[int(c.a)];
      if (fade <= 0.0) continue;
      float rs = s.x;
      float delta = mod(s.y - th, TAU);
      float radial = band(abs(r - rs), 0.5 * s.z, px);
      // A whisper dimmer towards the tail, like a stack fading in.
      float ramp = mix(0.42, 1.0, smoothstep(0.0, 1.0, clamp(delta / sw, 0.0, 1.0)));
      float trail = radial * along(delta, rs, px) * ramp;
      // The star itself, where it is now (distance measured along and across the circle).
      float dh = mod(delta - uSweep + 3.14159265, TAU) - 3.14159265;
      float hr = max(uHeadMin, s.z * 0.62);
      float hd = length(vec2(r - rs, rs * dh));
      float head = clamp((hr + 0.5 * px - hd) / px, 0.0, 1.0);
      acc += c.rgb * s.w * fade * (trail + 1.15 * head);
    }
  }

  // Soft halo along the brightest trails.
  int g0 = max(0, int(floor((r - 14.0) / ${GLOW_BIN}.0)));
  int g1 = min(uNGBins - 1, int(floor((r + 14.0) / ${GLOW_BIN}.0)));
  for (int b = g0; b <= g1; b++) {
    ivec2 bc = texelFetch(uGBins, at(b), 0).rg;
    for (int k = 0; k < bc.y; k++) {
      int i = bc.x + k;
      vec4 s = texelFetch(uGA, at(i), 0);
      vec4 c = texelFetch(uGB, at(i), 0);
      float fade = uFade[int(c.a)];
      if (fade <= 0.0) continue;
      float dr = r - s.x;
      float sigma = 1.1 + s.z * 1.3;
      float g = exp(-dr * dr / (2.0 * sigma * sigma));
      float delta = mod(s.y - th, TAU);
      float soft = along(delta, s.x, 4.0);
      acc += c.rgb * s.w * fade * g * soft * 0.085;
    }
  }

  acc = min(acc, vec3(1.0));
  fragColor = vec4(acc, max(acc.r, max(acc.g, acc.b)));
}`

export type GLTrails = {
  setField(f: Field): void
  draw(sweep: number, dpr: number, fades: Float32Array): void
  readonly lost: boolean
  dispose(): void
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh)
    gl.deleteShader(sh)
    throw new Error(`star-trail shader: ${log}`)
  }
  return sh
}

export function createGLTrails(canvas: HTMLCanvasElement): GLTrails | null {
  let gl: WebGL2RenderingContext | null = null
  try {
    gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' })
  } catch {
    gl = null
  }
  if (!gl) return null
  const g = gl

  let prog: WebGLProgram
  try {
    prog = g.createProgram()!
    g.attachShader(prog, compile(g, g.VERTEX_SHADER, VERT))
    g.attachShader(prog, compile(g, g.FRAGMENT_SHADER, FRAG))
    g.linkProgram(prog)
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) throw new Error(g.getProgramInfoLog(prog) ?? 'link failed')
  } catch (e) {
    if (import.meta.env.DEV) console.warn(e)
    return null
  }

  const vao = g.createVertexArray()
  const loc = (n: string) => g.getUniformLocation(prog, n)
  const U = {
    A: loc('uA'),
    B: loc('uB'),
    Bins: loc('uBins'),
    GA: loc('uGA'),
    GB: loc('uGB'),
    GBins: loc('uGBins'),
    Pole: loc('uPole'),
    Res: loc('uRes'),
    Dpr: loc('uDpr'),
    Sweep: loc('uSweep'),
    HeadMin: loc('uHeadMin'),
    Fade: loc('uFade'),
    NBins: loc('uNBins'),
    NGBins: loc('uNGBins'),
  }

  const textures: WebGLTexture[] = []
  const floatTex = (data: Float32Array, n: number) => {
    const t = g.createTexture()!
    const rows = Math.max(1, Math.ceil(n / ROW))
    const buf = new Float32Array(ROW * rows * 4)
    buf.set(data)
    g.bindTexture(g.TEXTURE_2D, t)
    g.texImage2D(g.TEXTURE_2D, 0, g.RGBA32F, ROW, rows, 0, g.RGBA, g.FLOAT, buf)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST)
    textures.push(t)
    return t
  }
  const intTex = (data: Int32Array, n: number) => {
    const t = g.createTexture()!
    const rows = Math.max(1, Math.ceil(n / ROW))
    const buf = new Int32Array(ROW * rows * 2)
    buf.set(data)
    g.bindTexture(g.TEXTURE_2D, t)
    g.texImage2D(g.TEXTURE_2D, 0, g.RG32I, ROW, rows, 0, g.RG_INTEGER, g.INT, buf)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST)
    textures.push(t)
    return t
  }

  /** Sort by radius, pack attributes and build the radial bin index. */
  const pack = (stars: StarRec[], binSize: number) => {
    const list = [...stars].sort((p, q) => p.r - q.r)
    const n = list.length
    const A = new Float32Array(n * 4)
    const B = new Float32Array(n * 4)
    list.forEach((s, i) => {
      A.set([s.r, s.a, s.width, s.alpha], i * 4)
      B.set([s.rgb[0], s.rgb[1], s.rgb[2], s.bin], i * 4)
    })
    const nBins = Math.max(1, Math.ceil((list.length ? list[n - 1].r : 0) / binSize) + 2)
    const bins = new Int32Array(nBins * 2)
    for (let i = 0; i < n; i++) {
      const b = Math.floor(list[i].r / binSize)
      if (bins[b * 2 + 1] === 0) bins[b * 2] = i
      bins[b * 2 + 1]++
    }
    return { A, B, bins, n, nBins }
  }

  let ready = false
  let field: Field | null = null
  let nBins = 0
  let nGBins = 0
  let lost = false
  let tex: WebGLTexture[] = []

  const onLost = (e: Event) => {
    e.preventDefault()
    lost = true
    ready = false
  }
  canvas.addEventListener('webglcontextlost', onLost)

  return {
    get lost() {
      return lost
    },
    setField(f: Field) {
      field = f
      textures.splice(0).forEach((t) => g.deleteTexture(t))
      const all = pack(f.stars, 1)
      const bright = pack(
        f.stars.filter((s) => s.bin >= GLOW_FROM),
        GLOW_BIN,
      )
      tex = [floatTex(all.A, all.n), floatTex(all.B, all.n), intTex(all.bins, all.nBins), floatTex(bright.A, bright.n), floatTex(bright.B, bright.n), intTex(bright.bins, bright.nBins)]
      nBins = all.nBins
      nGBins = bright.nBins
      ready = true
    },
    draw(sweep: number, dpr: number, fades: Float32Array) {
      if (!ready || !field || lost) return
      const w = canvas.width
      const h = canvas.height
      g.viewport(0, 0, w, h)
      g.disable(g.BLEND)
      g.clearColor(0, 0, 0, 0)
      g.clear(g.COLOR_BUFFER_BIT)
      g.useProgram(prog)
      g.bindVertexArray(vao)
      const units = [U.A, U.B, U.Bins, U.GA, U.GB, U.GBins]
      tex.forEach((t, i) => {
        g.activeTexture(g.TEXTURE0 + i)
        g.bindTexture(g.TEXTURE_2D, t)
        g.uniform1i(units[i], i)
      })
      g.uniform2f(U.Pole, field.cx, field.cy)
      g.uniform2f(U.Res, w, h)
      g.uniform1f(U.Dpr, dpr)
      g.uniform1f(U.Sweep, sweep)
      g.uniform1f(U.HeadMin, field.minHead)
      g.uniform1fv(U.Fade, fades)
      g.uniform1i(U.NBins, nBins)
      g.uniform1i(U.NGBins, nGBins)
      g.drawArrays(g.TRIANGLES, 0, 3)
    },
    dispose() {
      canvas.removeEventListener('webglcontextlost', onLost)
      textures.forEach((t) => g.deleteTexture(t))
      g.deleteProgram(prog)
      g.deleteVertexArray(vao)
    },
  }
}
