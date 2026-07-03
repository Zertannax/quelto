/* ============================================================
   QUELTO — Hero 3D scene
   ES module, requires importmap in the HTML head:
   <script type="importmap">{ "imports": { "three": "https://..." }}</script>
   ============================================================ */

import * as THREE from 'three';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = matchMedia('(hover: none)').matches;
if (reduceMotion || isTouch) {
  console.log('[quelto-hero] skipped (reduced-motion or touch)');
} else {
  init();
}

function init() {
  const wrap = document.getElementById('heroCanvasWrap');
  const canvas = document.getElementById('heroCanvas');
  if (!wrap || !canvas) {
    console.warn('[quelto-hero] wrap or canvas missing');
    return;
  }

  // WebGL detection
  const hasWebGL = (() => {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  })();
  if (!hasWebGL) {
    console.warn('[quelto-hero] no WebGL');
    const fb = document.getElementById('heroCanvasFallback');
    if (fb) fb.style.display = 'block';
    return;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'low-power'
  });
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  // --- Resize ---
  function resize() {
    const r = wrap.getBoundingClientRect();
    const w = r.width;
    const h = r.height;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  addEventListener('resize', resize);

  // --- Colors ---
  const ORANGE = 0xF97316;
  const ORANGE_SOFT = 0xFB923C;
  const GRID = 0x2A2A33;
  const NODE = 0xF97316;

  // --- 3 orbital rings ---
  const rings = [];
  const ringConfigs = [
    { radius: 2.2, tube: 0.006, color: ORANGE,      speed: 0.08, tilt: { x:  0.3, y:  0.0, z:  0.0 }, opacity: 0.9 },
    { radius: 2.6, tube: 0.005, color: GRID,        speed: 0.05, tilt: { x: -0.4, y:  0.6, z:  0.2 }, opacity: 0.5 },
    { radius: 1.8, tube: 0.004, color: ORANGE_SOFT, speed: 0.12, tilt: { x:  0.5, y: -0.3, z: -0.1 }, opacity: 0.4 }
  ];

  ringConfigs.forEach(cfg => {
    const geom = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 100);
    const mat = new THREE.MeshBasicMaterial({
      color: cfg.color,
      transparent: true,
      opacity: cfg.opacity
    });
    const ring = new THREE.Mesh(geom, mat);
    ring.rotation.x = cfg.tilt.x;
    ring.rotation.y = cfg.tilt.y;
    ring.rotation.z = cfg.tilt.z;
    ring.userData = { speed: cfg.speed };
    scene.add(ring);
    rings.push(ring);
  });

  // --- 6 orbital nodes ---
  const nodes = [];
  const nodeGeom = new THREE.SphereGeometry(0.045, 16, 16);
  const NODES_COUNT = 6;

  // Halo sprite texture
  const glowTex = (() => {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(249,115,22,0.9)');
    g.addColorStop(0.4, 'rgba(249,115,22,0.3)');
    g.addColorStop(1, 'rgba(249,115,22,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();

  for (let i = 0; i < NODES_COUNT; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: NODE });
    const node = new THREE.Mesh(nodeGeom, mat);
    node.userData = {
      angle: (i / NODES_COUNT) * Math.PI * 2,
      radius: 2.2,
      tiltX: 0.3,
      speed: 0.18 + (i % 3) * 0.04,
      phase: i * 0.4
    };
    scene.add(node);
    nodes.push(node);

    // Halo
    const sprMat = new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.7 });
    const spr = new THREE.Sprite(sprMat);
    spr.scale.set(0.4, 0.4, 0.4);
    node.add(spr);
  }

  // --- Background grid (wireframe plane) ---
  const gridGeom = new THREE.PlaneGeometry(14, 14, 28, 28);
  const wireGeom = new THREE.WireframeGeometry(gridGeom);
  const gridMat = new THREE.LineBasicMaterial({ color: GRID, transparent: true, opacity: 0.25 });
  const grid = new THREE.LineSegments(wireGeom, gridMat);
  grid.position.z = -2.5;
  grid.rotation.x = -0.2;
  scene.add(grid);

  // --- Center pulse ---
  const centerGeom = new THREE.SphereGeometry(0.08, 24, 24);
  const centerMat = new THREE.MeshBasicMaterial({ color: ORANGE });
  const center = new THREE.Mesh(centerGeom, centerMat);
  scene.add(center);
  const centerHaloMat = new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5 });
  const centerHalo = new THREE.Sprite(centerHaloMat);
  centerHalo.scale.set(0.8, 0.8, 0.8);
  center.add(centerHalo);

  // --- Mouse parallax ---
  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener('mousemove', e => {
    tx = (e.clientX / innerWidth - 0.5) * 2;
    ty = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  // --- Animation loop ---
  const clock = new THREE.Clock();
  let raf;

  function tick() {
    const dt = clock.getDelta();
    const t = clock.elapsedTime;

    mx += (tx - mx) * 0.05;
    my += (ty - my) * 0.05;

    rings.forEach((r, i) => {
      r.rotation.z += r.userData.speed * dt;
      r.rotation.x = ringConfigs[i].tilt.x + my * 0.06;
      r.rotation.y = ringConfigs[i].tilt.y + mx * 0.06;
    });

    nodes.forEach(n => {
      const ud = n.userData;
      ud.angle += ud.speed * dt;
      const a = ud.angle;
      const x = Math.cos(a) * ud.radius;
      const y = Math.sin(a) * ud.radius;
      const ty_ = y * Math.cos(ud.tiltX);
      const tz_ = y * Math.sin(ud.tiltX);
      n.position.set(x, ty_, tz_);
      const s = 1 + Math.sin(t * 2 + ud.phase) * 0.3;
      n.scale.setScalar(s);
    });

    const centerPulse = 1 + Math.sin(t * 1.5) * 0.15;
    center.scale.setScalar(centerPulse);
    centerHalo.material.opacity = 0.4 + Math.sin(t * 1.5) * 0.2;

    grid.position.y = Math.sin(t * 0.2) * 0.1;
    grid.material.opacity = 0.22 + Math.sin(t * 0.5) * 0.05;

    scene.rotation.x = my * 0.08;
    scene.rotation.y = mx * 0.08;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }

  // Pause on off-screen
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!raf) tick();
      } else {
        cancelAnimationFrame(raf);
        raf = null;
      }
    });
  }, { threshold: 0 });
  io.observe(wrap);

  tick();
  console.log('[quelto-hero] 3D scene running');
}
