/* =========================================================
   QUELTO — Three.js hero clock
   - Minimal scene: 1 wall clock + 2 hands + outer ticks
   - Hour hand slow (2-3 day rotation metaphor), minute hand fast
   - Subtle 3D depth, no mesh gradient, no 80 particles
   - Color: cream-on-ink matching brand
   - Scroll-driven: hour hand winds forward with scroll
   ========================================================= */

import * as THREE from 'three';

function initHero(THREE) {
  'use strict';

  const canvas = document.getElementById('heroCanvas');
  const heroVisual = canvas ? canvas.closest('.hero-3d') : null;
  if (!canvas || !heroVisual) return;

  heroVisual.classList.add('has-webgl');

  // Colors
  const ink = new THREE.Color(0x1A1A1A);
  const accent = new THREE.Color(0xD97706);

  // Renderer
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Scene + camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  // === Clock assembly ===
  const clockGroup = new THREE.Group();
  scene.add(clockGroup);

  // Outer ring (clock face outline)
  const ringGeo = new THREE.TorusGeometry(1.4, 0.02, 16, 96);
  const ringMat = new THREE.MeshStandardMaterial({ color: ink, roughness: 0.6, metalness: 0.1 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  clockGroup.add(ring);

  // Inner face (subtle disk)
  const faceGeo = new THREE.CircleGeometry(1.36, 96);
  const faceMat = new THREE.MeshBasicMaterial({ color: 0xFAFAF7, transparent: true, opacity: 0.0 });
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.position.z = -0.02;
  clockGroup.add(face);

  // 12 hour ticks
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const isMain = i % 3 === 0;
    const tickGeo = new THREE.BoxGeometry(isMain ? 0.04 : 0.02, isMain ? 0.12 : 0.06, 0.01);
    const tickMat = new THREE.MeshStandardMaterial({ color: ink, roughness: 0.5 });
    const tick = new THREE.Mesh(tickGeo, tickMat);
    tick.position.set(Math.cos(angle) * 1.28, Math.sin(angle) * 1.28, 0.02);
    tick.rotation.z = angle - Math.PI / 2;
    clockGroup.add(tick);
  }

  // Hour hand (short, thick, orange — represents "your project's 2-3 day arc")
  const hourGeo = new THREE.BoxGeometry(0.06, 0.7, 0.02);
  const hourMat = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.4, metalness: 0.2 });
  const hourHand = new THREE.Mesh(hourGeo, hourMat);
  hourHand.position.set(0, 0.3, 0.04);
  clockGroup.add(hourHand);

  // Minute hand (long, thin, ink)
  const minuteGeo = new THREE.BoxGeometry(0.04, 1.1, 0.02);
  const minuteMat = new THREE.MeshStandardMaterial({ color: ink, roughness: 0.5 });
  const minuteHand = new THREE.Mesh(minuteGeo, minuteMat);
  minuteHand.position.set(0, 0.4, 0.05);
  clockGroup.add(minuteHand);

  // Center pin
  const pinGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.04, 24);
  const pinMat = new THREE.MeshStandardMaterial({ color: ink, roughness: 0.4, metalness: 0.3 });
  const pin = new THREE.Mesh(pinGeo, pinMat);
  pin.rotation.x = Math.PI / 2;
  pin.position.z = 0.07;
  clockGroup.add(pin);

  // Subtle ambient + directional light
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(2, 2, 5);
  scene.add(dir);

  // Resize
  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(canvas.parentElement);

  // Mouse parallax (desktop only) — gentle
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  let mouseX = 0, mouseY = 0;
  if (!isTouch) {
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.4;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.3;
    });
  }

  // Scroll progress
  let scrollProgress = 0;
  window.addEventListener('heroScroll', (e) => {
    scrollProgress = e.detail.progress;
  });

  // Animate
  const clock = new THREE.Clock();
  function animate() {
    const delta = clock.getDelta();
    const t = clock.getElapsedTime();

    // Minute hand: full rotation every 4 seconds (fast, attention-grabbing)
    minuteHand.rotation.z = -t * (Math.PI * 2 / 4);

    // Hour hand: ticks slowly (full rotation every 60s) — represents the slow "2-3 day" arc
    hourHand.rotation.z = -t * (Math.PI * 2 / 60);

    // Subtle tilt: clock face looks slightly toward viewer
    clockGroup.rotation.x = -0.15 + mouseY * 0.3;
    clockGroup.rotation.y = mouseX * 0.3;

    // Scroll-driven: hour hand winds forward as user scrolls past hero
    hourHand.rotation.z -= scrollProgress * Math.PI * 2 * 0.3;

    // Camera dolly: subtle push in
    const targetZ = 8 - scrollProgress * 0.6;
    camera.position.z += (targetZ - camera.position.z) * 0.05;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}

// Bootstrap (only if WebGL + reduced motion off)
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => initHero(THREE), { timeout: 1500 });
} else {
  setTimeout(() => initHero(THREE), 200);
}
