/* madebyjoe 2.0: a dithered form made of 3D particles behind the hero (raw WebGL, no library).
   Each particle snaps to a 4 px screen grid and is shown or hidden by a 4x4 Bayer threshold at
   that cell, so the lit, rippling form reads as a one-colour ordered dither. It drifts with a
   little turbulence; near the mouse, particles lift slightly and brighten. */
(() => {
  const canvas = document.querySelector('.hero__gl');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) { canvas.remove(); return; }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = innerWidth < 700;
  const DPR = Math.min(devicePixelRatio || 1, 2);
  const CELL = 4; // particle size in CSS px

  /* ---------- Particles ---------- */
  // One form. (Type 2 = dust and 3 = orbiting blobs are still supported by the shader.)
  const q = small ? .45 : 1;
  const parts = [
    [0, 70000],
  ].map(([t, n, o = 0]) => [t, Math.round(n * q), o]);
  const N = parts.reduce((s, p) => s + p[1], 0);
  const pos = new Float32Array(N * 3);
  const rnd = new Float32Array(N);
  const type = new Float32Array(N);
  const obj = new Float32Array(N);
  const golden = Math.PI * (3 - Math.sqrt(5));
  let k = 0;
  for (const [t, n, o] of parts) {
    for (let i = 0; i < n; i++, k++) {
      let x, y, z;
      if (t === 2) {
        x = (Math.random() - .5) * 7; y = (Math.random() - .5) * 4.5; z = (Math.random() - .5) * 3;
      } else { // Fibonacci sphere: even spread, no clumps
        y = 1 - (i + .5) / n * 2; const r = Math.sqrt(1 - y * y), a = i * golden; x = Math.cos(a) * r; z = Math.sin(a) * r;
      }
      pos.set([x, y, z], k * 3); rnd[k] = Math.random(); type[k] = t; obj[k] = o;
    }
  }

  const vert = `
attribute vec3 aPos;
attribute float aRnd;
attribute float aType;
attribute float aObj;
uniform mat4 uProj;
uniform float uTime;
uniform vec2 uRot;
uniform vec2 uMouse;     // mouse in NDC
uniform float uMouseOn;  // eases in when the mouse moves
uniform vec3 uTrail[12]; // recent mouse points: xy in NDC, z strength
uniform vec2 uCenter;    // offset of the form in NDC
uniform float uScale;
uniform float uAspect;
uniform float uFade;
uniform float uSize;     // cell size in device px
uniform vec2 uRes;       // canvas size in device px
varying float vLevel;

float bayer4(vec2 c){
  vec2 p = mod(c, 4.);
  float i = p.x + p.y * 4.;
  if (i < .5) return 0.; if (i < 1.5) return 8.; if (i < 2.5) return 2.; if (i < 3.5) return 10.;
  if (i < 4.5) return 12.; if (i < 5.5) return 4.; if (i < 6.5) return 14.; if (i < 7.5) return 6.;
  if (i < 8.5) return 3.; if (i < 9.5) return 11.; if (i < 10.5) return 1.; if (i < 11.5) return 9.;
  if (i < 12.5) return 15.; if (i < 13.5) return 7.; if (i < 14.5) return 13.; return 5.;
}

mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
vec3 spin(vec3 p){
  p.xz *= rot(uTime * .23 + uRot.x);
  p.yz *= rot(uTime * .17 + uRot.y);
  p.xy *= rot(.4);
  return p;
}

// Frame for the orbiting shapes: a fixed tilt plus a lean toward the mouse.
vec3 sys(vec3 p){
  p.yz *= rot(.38 + uRot.y * .5);
  p.xz *= rot(uRot.x * .5);
  p.xy *= rot(.22);
  return p;
}

void main(){
  vec3 n = normalize(aPos);
  vec3 p = aPos;
  vec3 w, wn;
  if (aType < .5) {
    // Main form: gyroid ripples drift across a sphere.
    vec3 q = spin(n) * 3.2;
    float g = dot(sin(q + uTime * .5), cos(q.zxy - uTime * .35));
    p = n * (1.05 + g * .11);
    w = spin(p); wn = spin(n);
  } else if (aType < 2.5) {
    // Dust drifts.
    w = p + vec3(0., sin(uTime * .2 + aRnd * 6.28) * .08, 0.);
    wn = vec3(0., 0., 1.);
  } else {
    // Smaller blobs: same gyroid ripple as the main form, on slow tilted orbits.
    float R  = aObj < .5 ? 1.75 : (aObj < 1.5 ? 2.05 : (aObj < 2.5 ? 1.95 : 1.55));
    float r  = aObj < .5 ? .32  : (aObj < 1.5 ? .2   : (aObj < 2.5 ? .45  : .14));
    float sp = aObj < .5 ? .21  : (aObj < 1.5 ? -.17 : (aObj < 2.5 ? .12  : -.27));
    float tilt = aObj < .5 ? .3 : (aObj < 1.5 ? -.45 : (aObj < 2.5 ? .6 : -.15));
    float a = uTime * sp + aObj * 1.7;
    vec3 c = vec3(cos(a) * R, sin(uTime * .4 + aObj) * .12, sin(a) * R);
    c.xy *= rot(tilt);
    float self = uTime * (.3 + aObj * .08);
    vec3 sn = n; sn.xz *= rot(self); sn.yz *= rot(self * .7);
    vec3 q = sn * 3.2 + aObj * 5.;
    float g = dot(sin(q + uTime * .6), cos(q.zxy - uTime * .4));
    w = sys(c + n * r * (1. + g * .14)); wn = sys(n);
  }

  // Turbulence: every particle drifts a little on its own, so surfaces breathe.
  vec3 tq = w * 1.3 + aRnd * 3.;
  vec3 turb = vec3(sin(tq.y * 2.7 + uTime * .8) + sin(tq.z * 4.1 - uTime * .6),
                   sin(tq.z * 3.1 + uTime * .7) + sin(tq.x * 4.7 + uTime * .9),
                   sin(tq.x * 2.9 - uTime * .75) + sin(tq.y * 4.3 + uTime * .65));
  w += turb * ((aType > 1.5 && aType < 2.5) ? .05 : .006 + .01 * aRnd);

  vec3 cam = vec3(0., 0., 4.2);
  vec3 v = normalize(cam - w);
  float facing = dot(wn, v);

  // Mouse: a trail of points. Each one lifts nearby particles off the surface (3D spikes of
  // different lengths), twists them around the cursor and lights them up. The edge of each
  // point's reach is wavy, so the shape is never a plain circle.
  vec4 clip0 = uProj * vec4(w - cam, 1.);
  vec2 ndc0 = clip0.xy / clip0.w * uScale + uCenter;
  float inf = 0.;
  for (int i = 0; i < 12; i++) {
    vec3 t = uTrail[i];
    vec2 d = (ndc0 - t.xy) * vec2(uAspect, 1.);
    float r = length(d);
    float a = atan(d.y, d.x);
    float reach = .18 * (1. + .35 * sin(a * 5. + uTime * 2. + float(i) * .7) + .2 * sin(a * 3. - uTime * 1.3));
    inf += exp(-r * r / (reach * reach)) * t.z;
  }
  inf = min(inf, 1.) * uMouseOn;

  w += wn * inf * (.04 + .2 * aRnd * aRnd);
  vec4 clip = uProj * vec4(w - cam, 1.);
  vec2 ndc = clip.xy / clip.w * uScale + uCenter;
  float fall = inf * (.3 + .7 * aRnd);

  // Light the particle.
  vec3 l = normalize(vec3(-.6, .7, .8));
  float lum;
  bool surface = aType < .5 || aType > 2.5;
  if (surface) {
    float dif = max(dot(wn, l), 0.);
    float rim = pow(1. - max(facing, 0.), 2.5);
    float spec = pow(max(dot(reflect(-l, wn), v), 0.), 24.);
    lum = dif * .45 + rim * .4 + spec * .55;
    if (facing < -.05) lum = 0.; // back faces stay dark
  } else {
    lum = .2;
  }
  lum = (lum + fall * .3) * uFade;

  // Snap to the dither grid, then threshold with the Bayer value of that cell: shown or hidden.
  vec2 cell = floor((ndc * .5 + .5) * uRes / uSize);
  ndc = (cell + .5) * uSize / uRes * 2. - 1.;
  vLevel = step((bayer4(cell) + .5) / 16., lum);

  gl_Position = vec4(ndc * clip.w, clip.z, clip.w);
  gl_PointSize = vLevel < .5 ? 0. : uSize;
}`;
  const frag = `
precision mediump float;
varying float vLevel;
void main(){
  if (vLevel < .5) discard;
  gl_FragColor = vec4(.36, .34, .32, 1.);
}`;

  function sh(t, src) {
    const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  const vs = sh(gl.VERTEX_SHADER, vert), fs = sh(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) { canvas.remove(); return; }
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); canvas.remove(); return; }
  gl.useProgram(prog);

  function attr(name, data, size) {
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  }
  attr('aPos', pos, 3); attr('aRnd', rnd, 1); attr('aType', type, 1); attr('aObj', obj, 1);
  const U = {};
  ['uProj', 'uTime', 'uRot', 'uMouse', 'uMouseOn', 'uCenter', 'uScale', 'uAspect', 'uFade', 'uSize', 'uRes', 'uTrail[0]'].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(.055, .051, .047, 1);

  let W = 0, H = 0, aspect = 1;
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width * DPR)); H = Math.max(1, Math.round(r.height * DPR));
    canvas.width = W; canvas.height = H; aspect = W / H;
    gl.viewport(0, 0, W, H);
    const f = 1.6, near = .1, far = 20;
    gl.uniformMatrix4fv(U.uProj, false, new Float32Array([
      f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, (2 * far * near) / (near - far), 0,
    ]));
  }
  resize();
  addEventListener('resize', resize);

  const m = { x: 9, y: 9, tx: 9, ty: 9, on: 0, ton: 0, rx: 0, ry: 0 };
  const trail = new Float32Array(36);
  let frame = 0;
  let idle;
  addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    m.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    m.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
    if (m.x > 5) { m.x = m.tx; m.y = m.ty; }
    m.ton = 1; clearTimeout(idle); idle = setTimeout(() => (m.ton = .4), 1600);
  }, { passive: true });

  // The page sets these: fade-in after the loader, and scroll progress through the hero.
  const state = window.heroGL = { fade: 0, scroll: 0 };

  let visible = true, raf = 0;
  const t0 = performance.now();
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible && !raf) loop(); }).observe(canvas);

  function draw(now) {
    const wide = aspect > 1.1;
    m.x += (m.tx - m.x) * .08; m.y += (m.ty - m.y) * .08; m.on += (m.ton - m.on) * .04;
    if (m.tx < 5) { m.rx += (m.x * 1.1 - m.rx) * .04; m.ry += (-m.y * .8 - m.ry) * .04; }
    gl.uniform1f(U.uTime, reduce ? 6 : (now - t0) / 1000);
    gl.uniform2f(U.uRot, m.rx, m.ry);
    gl.uniform2f(U.uMouse, m.x, m.y);
    // Trail: slot 0 is the cursor. While the mouse moves, older points shift back and fade.
    for (let i = 5; i < 36; i += 3) trail[i] *= .9;
    const moved = Math.hypot(m.x - trail[0], m.y - trail[1]) > .015;
    if (moved && ++frame % 2 === 0) { trail.copyWithin(3, 0, 33); trail[5] = .8; }
    trail[0] = m.x; trail[1] = m.y; trail[2] = 1;
    gl.uniform3fv(U['uTrail[0]'], trail);
    gl.uniform1f(U.uMouseOn, reduce ? 0 : m.on);
    gl.uniform2f(U.uCenter, wide ? .44 : 0, (wide ? -.16 : -.1) + state.scroll * .5);
    gl.uniform1f(U.uScale, (wide ? 1.25 : 1) * (1 - state.scroll * .2));
    gl.uniform1f(U.uAspect, aspect);
    gl.uniform1f(U.uFade, state.fade * (1 - state.scroll * .6));
    gl.uniform1f(U.uSize, Math.max(1, Math.round(CELL * DPR)));
    gl.uniform2f(U.uRes, W, H);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, N);
  }
  function loop(now = performance.now()) {
    raf = 0;
    if (!visible) return;
    draw(now);
    if (!reduce || state.fade < 1) raf = requestAnimationFrame(loop);
  }
  loop();
})();
