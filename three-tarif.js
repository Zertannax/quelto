/* ============================================================
   QUELTO — Tarif 3D scene
   - One wireframe icosahedron (orange) rotating slowly
   - One wireframe icosahedron (gray) smaller, opposite rotation
   - Disabled on touch / reduced-motion / no WebGL
   ============================================================ */

(() => {
  'use strict';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;
  if (reduceMotion || isTouch) return;

  const wrap = document.getElementById('tarifCanvasWrap');
  const canvas = document.getElementById('tarifCanvas');
  if (!wrap || !canvas) return;

  const hasWebGL = (() => {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  })();
  if (!hasWebGL) return;

  // Wait for Three.js to be available via the importmap set by three-hero.js
  // Or set our own importmap if not yet present
  if (!document.querySelector('script[type="importmap"]')) {
    const im = document.createElement('script');
    im.type = 'importmap';
    im.textContent = JSON.stringify({ imports: { "three": "https://unpkg.com/three@0.160.0/build/three.module.js" }});
    document.head.appendChild(im);
  }

  const module = document.createElement('script');
  module.type = 'module';
  module.textContent = `
    import * as THREE from 'three';

    const wrap = document.getElementById('tarifCanvasWrap');
    const canvas = document.getElementById('tarifCanvas');
    if (!wrap || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 4);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    function resize() {
      const r = wrap.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    }
    resize();
    new ResizeObserver(resize).observe(wrap);
    addEventListener('resize', resize);

    // Two icosahedrons
    const icoBig = new THREE.IcosahedronGeometry(1.2, 1);
    const wireBig = new THREE.WireframeGeometry(icoBig);
    const matBig = new THREE.LineBasicMaterial({ color: 0xF97316, transparent: true, opacity: 0.5 });
    const linesBig = new THREE.LineSegments(wireBig, matBig);
    scene.add(linesBig);

    const icoSmall = new THREE.IcosahedronGeometry(0.7, 1);
    const wireSmall = new THREE.WireframeGeometry(icoSmall);
    const matSmall = new THREE.LineBasicMaterial({ color: 0x3A3A44, transparent: true, opacity: 0.7 });
    const linesSmall = new THREE.LineSegments(wireSmall, matSmall);
    linesSmall.position.set(1.3, -0.5, -0.5);
    scene.add(linesSmall);

    // Subtle mouse parallax
    let mx = 0, my = 0, tx = 0, ty = 0;
    addEventListener('mousemove', e => {
      tx = (e.clientX / innerWidth - 0.5) * 2;
      ty = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });

    const clock = new THREE.Clock();
    let raf;
    function tick() {
      const dt = clock.getDelta();
      const t = clock.elapsedTime;
      mx += (tx - mx) * 0.04;
      my += (ty - my) * 0.04;

      linesBig.rotation.x = t * 0.1 + my * 0.05;
      linesBig.rotation.y = t * 0.15 + mx * 0.05;
      linesSmall.rotation.x = -t * 0.2;
      linesSmall.rotation.y = -t * 0.25;
      linesSmall.rotation.z = t * 0.1;

      scene.rotation.x = my * 0.04;
      scene.rotation.y = mx * 0.04;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { if (!raf) tick(); }
        else { cancelAnimationFrame(raf); raf = null; }
      });
    }, { threshold: 0 });
    io.observe(wrap);

    tick();
  `;
  document.body.appendChild(module);
})();
