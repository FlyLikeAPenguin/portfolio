/** GLSL for the night-side Earth, atmosphere, stars, satellite, orbit, markers and beam. */

export const earthVert = /* glsl */ `
varying vec2 vUv;
varying vec3 vN;
varying vec3 vPos;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPos = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

export const earthFrag = /* glsl */ `
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform vec3 uSun;
uniform float uReveal;
uniform float uLights;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vPos;

void main() {
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vPos);
  float ndl = dot(N, uSun);
  vec3 day = texture2D(uDay, vUv).rgb;
  vec3 night = texture2D(uNight, vUv).rgb;

  // Day side: dimmed Blue Marble with a soft ocean glint.
  float lit = max(ndl, 0.0);
  vec3 dayCol = day * (0.04 + 0.62 * pow(lit, 0.8));
  float ocean = smoothstep(0.004, 0.03, day.b - day.r * 1.15);
  vec3 H = normalize(uSun + V);
  float spec = pow(max(dot(N, H), 0.0), 70.0) * ocean * lit;
  dayCol += vec3(1.0, 0.88, 0.7) * spec * 0.55;

  // Night side: Black Marble city lights as an emissive map. Kept linear in the filtered texel
  // (no thresholds after sampling) so sub-pixel motion can't make them sparkle, plus a soft halo
  // from a blurrier mip level in place of a bloom pass.
  vec3 halo = texture2D(uNight, vUv, 3.0).rgb;
  vec3 lights = (max(night - 0.045, 0.0) * 1.9 + max(halo - 0.03, 0.0) * 0.9) * vec3(1.5, 1.1, 0.7) * uLights;
  vec3 nightBase = night * 0.42 + vec3(0.0015, 0.0035, 0.009);

  float dayMix = smoothstep(-0.08, 0.28, ndl);
  float nightMix = 1.0 - smoothstep(-0.22, 0.06, ndl);
  vec3 col = mix(nightBase, dayCol, dayMix) + lights * nightMix;

  // Terminator: a thin warm band where day turns to night.
  float term = exp(-pow((ndl + 0.01) / 0.05, 2.0));
  col += vec3(1.0, 0.38, 0.12) * term * 0.012 * (0.4 + 0.6 * dayMix);

  // Inner atmospheric haze toward the limb, strongest on the sunlit side.
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.2);
  float sunSide = smoothstep(-0.3, 0.55, ndl);
  col += vec3(0.28, 0.6, 1.0) * fres * (0.05 + 0.85 * sunSide);
  col += vec3(1.0, 0.45, 0.2) * fres * term * 0.12;

  gl_FragColor = vec4(col * uReveal, 1.0);
  #include <colorspace_fragment>
}
`

export const atmoVert = /* glsl */ `
varying vec3 vPos;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

/** Rendered on the back faces of a slightly larger shell. Glow falls off with ray altitude. */
export const atmoFrag = /* glsl */ `
uniform vec3 uSun;
uniform float uR;
uniform float uRa;
uniform float uReveal;
varying vec3 vPos;
void main() {
  vec3 ro = cameraPosition;
  vec3 rd = normalize(vPos - ro);
  float t = -dot(ro, rd);
  vec3 cp = ro + rd * t;
  float h = length(cp);
  float alt = (h - uR) / (uRa - uR);
  float dens = exp(-max(alt, 0.0) * 5.0) * (1.0 - smoothstep(0.7, 1.0, alt));
  vec3 n = normalize(cp);
  float mu = dot(n, uSun);
  float lit = smoothstep(-0.32, 0.5, mu);
  float fwd = pow(max(dot(rd, uSun), 0.0), 5.0);
  vec3 dayC = vec3(0.26, 0.6, 1.0);
  vec3 twi = vec3(1.0, 0.48, 0.22);
  vec3 c = mix(twi, dayC, smoothstep(-0.05, 0.4, mu));
  vec3 col = c * dens * (lit * 1.35 + 0.05);
  col += twi * fwd * dens * 0.7 * smoothstep(-0.25, 0.05, mu);
  col += vec3(0.2, 0.45, 1.0) * dens * 0.04;
  gl_FragColor = vec4(col * uReveal, 1.0);
  #include <colorspace_fragment>
}
`

export const starsVert = /* glsl */ `
attribute float aSize;
attribute float aSeed;
attribute vec3 aColor;
uniform float uTime;
uniform float uPx;
varying float vA;
varying vec3 vC;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.9 + 0.1 * sin(uTime * (0.25 + aSeed * 0.5) + aSeed * 50.0);
  vA = tw;
  vC = aColor;
  gl_PointSize = aSize * uPx;
}
`

export const starsFrag = /* glsl */ `
uniform float uReveal;
varying float vA;
varying vec3 vC;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  gl_FragColor = vec4(vC * a * vA * uReveal, 1.0);
  #include <colorspace_fragment>
}
`

export const satVert = /* glsl */ `
uniform float uSize;
uniform float uPx;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = uSize * uPx;
}
`

export const satFrag = /* glsl */ `
uniform vec3 uColA;
uniform vec3 uColB;
uniform float uAos;
uniform float uTime;
uniform float uReveal;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float d = length(p);
  float core = smoothstep(0.05, 0.0, d);
  float halo = exp(-d * d * 70.0) * 0.55;
  float spike = exp(-abs(p.y) * 120.0) * exp(-abs(p.x) * 7.0) + exp(-abs(p.x) * 120.0) * exp(-abs(p.y) * 7.0);
  float pulse = 0.85 + 0.15 * sin(uTime * 3.0);
  vec3 tint = mix(uColA, uColB, uAos);
  vec3 col = vec3(1.0) * core * 2.4 + tint * (halo * pulse + spike * 0.32);
  gl_FragColor = vec4(col * uReveal, 1.0);
  #include <colorspace_fragment>
}
`

/** Full orbit with a fading trail behind the satellite and a dashed predicted track ahead. */
export const orbitVert = /* glsl */ `
attribute float aU;
varying float vU;
void main() {
  vU = aU;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const orbitFrag = /* glsl */ `
uniform float uSatU;
uniform vec3 uBase;
uniform vec3 uTrail;
uniform float uBaseA;
uniform float uReveal;
varying float vU;
const float TAU = 6.28318530718;
void main() {
  float behind = mod(uSatU - vU, TAU);
  float ahead = mod(vU - uSatU, TAU);
  float trail = exp(-behind * 2.6);
  float dash = step(0.45, fract(ahead * 26.0));
  float pred = (1.0 - smoothstep(0.0, 1.3, ahead)) * dash * 0.55;
  vec3 col = uBase * uBaseA + uTrail * (trail * 1.4) + uBase * pred * 0.45;
  gl_FragColor = vec4(col * uReveal, 1.0);
  #include <colorspace_fragment>
}
`

/** Expanding rings on a tangent plane at each ground station. */
export const markerVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const markerFrag = /* glsl */ `
uniform float uTime;
uniform float uActive;
uniform float uPhase;
uniform vec3 uIdle;
uniform vec3 uHot;
uniform float uReveal;
varying vec2 vUv;
void main() {
  float r = length(vUv - 0.5) * 2.0;
  vec3 col = mix(uIdle, uHot, uActive);
  float dot = smoothstep(0.1, 0.06, r);
  float ring0 = smoothstep(0.03, 0.0, abs(r - 0.24)) * 0.6;
  float a = 0.0;
  for (int i = 0; i < 2; i++) {
    float t = fract(uTime * (0.35 + 0.4 * uActive) + uPhase + float(i) * 0.5);
    float rr = mix(0.18, 0.98, t);
    a += smoothstep(0.035, 0.0, abs(r - rr)) * (1.0 - t) * (0.55 + 0.6 * uActive);
  }
  float alpha = dot * 1.4 + ring0 + a;
  gl_FragColor = vec4(col * alpha * uReveal, 1.0);
  #include <colorspace_fragment>
}
`

/** Dashed contact circle (5° elevation mask) around each station. */
export const circleVert = /* glsl */ `
attribute float aA;
varying float vA;
void main() {
  vA = aA;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const circleFrag = /* glsl */ `
uniform float uActive;
uniform float uTime;
uniform vec3 uIdle;
uniform vec3 uHot;
uniform float uReveal;
varying float vA;
void main() {
  float dash = step(0.5, fract(vA * 36.0 - uTime * 0.25 * uActive));
  vec3 col = mix(uIdle * 0.22, uHot * 0.95, uActive) * dash;
  gl_FragColor = vec4(col * uReveal, 1.0);
  #include <colorspace_fragment>
}
`

/** Downlink cone from satellite (apex, y = 0) to station (base, y = 1). */
export const beamVert = /* glsl */ `
varying float vY;
varying vec3 vN;
varying vec3 vPos;
void main() {
  vY = -position.y;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPos = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

export const beamFrag = /* glsl */ `
uniform float uTime;
uniform float uStrength;
uniform vec3 uCol;
varying float vY;
varying vec3 vN;
varying vec3 vPos;
void main() {
  vec3 V = normalize(cameraPosition - vPos);
  float facing = abs(dot(normalize(vN), V));
  float edge = pow(1.0 - facing, 2.0);
  float bands = smoothstep(0.82, 1.0, fract(vY * 9.0 - uTime * 1.4));
  float fade = smoothstep(0.0, 0.2, vY) * (1.0 - smoothstep(0.85, 1.0, vY) * 0.6);
  float a = (0.05 + edge * 0.32 + bands * 0.22) * fade * uStrength;
  gl_FragColor = vec4(uCol * a, 1.0);
  #include <colorspace_fragment>
}
`
