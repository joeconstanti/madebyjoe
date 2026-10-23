/* madebyjoe 2.0: the five site videos behind the hero, shown as a one-colour ordered dither
   (raw WebGL, no library). It plays the same video as the hero pill and cross-fades when the
   pill changes. The screen is split into 4 px cells; each cell samples the video at its centre
   and is shown or hidden by a 4x4 Bayer threshold. Near the mouse the cells get finer and turn
   signal orange, with a dithered edge. */
(() => {
  const canvas = document.querySelector('.hero__gl');
  const vids = [...document.querySelectorAll('.hero__pill video')];
  if (!canvas || !vids.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) { canvas.remove(); return; }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Dither cells are 4 CSS pixels; rendering at half resolution preserves them.
  const DPR = 0.5;
  const CELL = 4; // dither cell in CSS px

  const vert = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0., 1.); }`;
  const frag = `
precision mediump float;
uniform sampler2D uA, uB;  // previous and current video
uniform vec2 uSizeA, uSizeB;
uniform float uMix;        // 0 = A, 1 = B
uniform vec2 uRes;         // canvas size in device px
uniform float uSize;       // cell size in device px
uniform vec2 uMouse;       // mouse in device px
uniform float uMouseOn;
uniform float uFade;
uniform float uTime;

float bayer4(vec2 c){
  vec2 p = mod(c, 4.);
  float i = p.x + p.y * 4.;
  if (i < .5) return 0.; if (i < 1.5) return 8.; if (i < 2.5) return 2.; if (i < 3.5) return 10.;
  if (i < 4.5) return 12.; if (i < 5.5) return 4.; if (i < 6.5) return 14.; if (i < 7.5) return 6.;
  if (i < 8.5) return 3.; if (i < 9.5) return 11.; if (i < 10.5) return 1.; if (i < 11.5) return 9.;
  if (i < 12.5) return 15.; if (i < 13.5) return 7.; if (i < 14.5) return 13.; return 5.;
}

// Cover fit: the video fills the canvas and keeps its aspect.
vec2 cover(vec2 uv, vec2 tex){
  float r = (uRes.x / uRes.y) / (tex.x / tex.y);
  if (r > 1.) uv.y = (uv.y - .5) / r + .5; else uv.x = (uv.x - .5) * r + .5;
  return vec2(uv.x, 1. - uv.y);
}

float luma(vec2 uv){
  vec3 a = texture2D(uA, cover(uv, uSizeA)).rgb;
  vec3 b = texture2D(uB, cover(uv, uSizeB)).rgb;
  vec3 c = mix(a, b, uMix);
  return dot(c, vec3(.2126, .7152, .0722));
}

void main(){
  // Mouse reach with a wavy edge, so it is not a plain circle.
  vec2 d = gl_FragCoord.xy - uMouse;
  float a = atan(d.y, d.x);
  float reach = min(uRes.x, uRes.y) * .2 * (1. + .25 * sin(a * 5. + uTime * 1.5) + .15 * sin(a * 3. - uTime));
  float inf = smoothstep(1., 0., length(d) / reach) * uMouseOn;

  // Near the mouse: half-size cells. The switch itself is dithered on the coarse grid.
  vec2 coarse = floor(gl_FragCoord.xy / uSize);
  bool fine = inf > (bayer4(coarse) + .5) / 16.;
  float s = fine ? max(1., floor(uSize * .5)) : uSize;
  vec2 cell = floor(gl_FragCoord.xy / s);
  vec2 uv = (cell + .5) * s / uRes;

  // Dimmed overall, and more behind the main heading (left, middle) so it stays readable.
  vec2 h = (uv - vec2(.18, .5)) * vec2(1.6, 2.4);
  float dim = .55 * (1. - .6 * smoothstep(1., .2, length(h)));
  float l = smoothstep(.06, .8, luma(uv)) * dim * uFade;
  float on = step((bayer4(cell) + .5) / 16., l);
  vec3 ink = vec3(.055, .051, .047);
  vec3 col = fine ? vec3(.97, .31, .08) : vec3(.36, .34, .32);
  gl_FragColor = vec4(mix(ink, col, on), 1.);
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

  // One triangle that covers the screen.
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ['uA', 'uB', 'uSizeA', 'uSizeB', 'uMix', 'uRes', 'uSize', 'uMouse', 'uMouseOn', 'uFade', 'uTime'].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

  function tex(unit) {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    [[gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE], [gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR]]
      .forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, k, v));
    return t;
  }
  const texs = [tex(0), tex(1)];
  gl.uniform1i(U.uA, 0); gl.uniform1i(U.uB, 1);

  // Posters stand in until a video has frames (and for reduced motion, where videos do not play).
  const posters = new Map(vids.map((v) => { const i = new Image(); if (v.poster) i.src = v.poster; return [v, i]; }));
  function upload(unit, v) {
    let src = v, w = v.videoWidth, h = v.videoHeight;
    if (v.readyState < 2) {
      src = posters.get(v);
      if (v.poster && src.src !== v.poster) src.src = v.poster;
      if (!src.complete || !src.naturalWidth) return null;
      w = src.naturalWidth; h = src.naturalHeight;
    }
    gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, texs[unit]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    return [w, h];
  }

  let W = 0, H = 0;
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width * DPR)); H = Math.max(1, Math.round(r.height * DPR));
    canvas.width = W; canvas.height = H;
    gl.viewport(0, 0, W, H);
  }
  resize();
  addEventListener('resize', resize);

  const m = { x: -9999, y: -9999, tx: -9999, ty: -9999, on: 0, ton: 0 };
  let idle;
  addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    m.tx = (e.clientX - r.left) * DPR; m.ty = (r.bottom - e.clientY) * DPR;
    if (m.x < -999) { m.x = m.tx; m.y = m.ty; }
    m.ton = 1; clearTimeout(idle); idle = setTimeout(() => (m.ton = 0), 1600);
  }, { passive: true });

  // The page sets these: fade-in after the loader, and scroll progress through the hero.
  const state = window.heroGL = { fade: 0, scroll: 0 };

  // Follow the pill: when its video changes, the old one becomes A and we fade to the new B.
  let cur = vids[0], prev = vids[0], mixT = 1, last = 0;
  const sizes = [[1, 1], [1, 1]];

  let visible = true, raf = 0, frame = 0, painted = 0;
  const t0 = performance.now();
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible && !raf) loop(); }).observe(canvas);

  function draw(now) {
    const dt = Math.min((now - last) / 1000, .1); last = now;
    const on = vids.find((v) => v.classList.contains('on'));
    if (on && on !== cur) {
      // Swap the textures: the frame on screen now becomes A, so the fade starts from it, not
      // from an old frame in A.
      prev = cur; cur = on; mixT = 0; frame = 0;
      texs.reverse(); sizes.reverse();
      texs.forEach((t, i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t); });
    }
    mixT = Math.min(1, mixT + dt / .8);

    // Upload video frames at about 30 fps; that is enough for 4 px cells.
    if (frame++ % 2 === 0) {
      const b = upload(1, cur); if (b) sizes[1] = b;
      if (mixT < 1) { const a = upload(0, prev); if (a) sizes[0] = a; }
    }

    m.x += (m.tx - m.x) * .12; m.y += (m.ty - m.y) * .12; m.on += (m.ton - m.on) * .05;
    gl.uniform2fv(U.uSizeA, sizes[0]); gl.uniform2fv(U.uSizeB, sizes[1]);
    gl.uniform1f(U.uMix, mixT * mixT * (3 - 2 * mixT));
    gl.uniform2f(U.uRes, W, H);
    gl.uniform1f(U.uSize, Math.max(1, Math.round(CELL * DPR)));
    gl.uniform2f(U.uMouse, m.x, m.y);
    gl.uniform1f(U.uMouseOn, reduce ? 0 : m.on);
    gl.uniform1f(U.uFade, state.fade * (1 - state.scroll * .6));
    gl.uniform1f(U.uTime, (now - t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (sizes[1][0] > 1) canvas.classList.add('is-ready');
  }
  function loop(now = performance.now()) {
    raf = 0;
    if (!visible || document.hidden) return;
    if (now - painted >= 1000 / 24) { draw(now); painted = now; }
    raf = requestAnimationFrame(loop);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !raf) loop(); });
  loop();
})();
