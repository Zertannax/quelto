/* =========================================================
   QUELTO — Three.js hero (icosahedron + depth parallax + scroll camera)
   - Imports three (importmap)
   - Listens to 'heroScroll' custom event for scroll-driven rotation
   ========================================================= */

import * as THREE from 'three';

function initHero(THREE) {
  'use strict';

  const canvas = document.getElementById('heroCanvas');
  const heroVisual = canvas ? canvas.closest('.hero-visual') : null;
  if (!canvas || !heroVisual) return;

  heroVisual.classList.add('has-webgl');
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // Renderer
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Scene + camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Colors (theme-aware, here dark)
  const colors = {
    primary: new THREE.Color(0x5B6CFF),
    secondary: new THREE.Color(0xA78BFA),
    accent: new THREE.Color(0x00E5FF),
    highlight: new THREE.Color(0xF0FF4D),
    warm: new THREE.Color(0xFF7AC6),
  };

  // === 3-layer depth parallax background ===
  function makeLayer(count, spread, sizeBase, opacity, drift, color) {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * spread.x;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread.y;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread.z;
      velocities[i] = drift * (0.5 + Math.random() * 0.5);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color, size: sizeBase, transparent: true, opacity, sizeAttenuation: true,
    });
    return { points: new THREE.Points(geo, mat), mat, positions, velocities, count, spread };
  }
  const far  = makeLayer(60,  {x:20,y:12,z:8},  0.018, 0.18, 0.0008, colors.accent);
  const mid  = makeLayer(100, {x:16,y:10,z:4},  0.028, 0.30, 0.0015, colors.secondary);
  const near = makeLayer(40,  {x:12,y:8,z:1},   0.045, 0.50, 0.0025, colors.highlight);
  scene.add(far.points, mid.points, near.points);

  // === Object group: icosahedron + ghost sphere + 12 vertex points + 2 orbit rings ===
  const objectGroup = new THREE.Group();
  scene.add(objectGroup);

  // Wireframe icosahedron
  const icoGeo = new THREE.IcosahedronGeometry(1.4, 1);
  const icoEdges = new THREE.EdgesGeometry(icoGeo);
  const icoMat = new THREE.LineBasicMaterial({ color: colors.primary, transparent: true, opacity: 0.7 });
  const icoLines = new THREE.LineSegments(icoEdges, icoMat);
  objectGroup.add(icoLines);

  // Solid icosahedron (faint fill, gives the wireframe a body)
  const solidMat = new THREE.MeshBasicMaterial({
    color: colors.primary, transparent: true, opacity: 0.08, side: THREE.DoubleSide,
  });
  const solidIco = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 1), solidMat);
  objectGroup.add(solidIco);

  // Ghost sphere (atmospheric halo)
  const ghostMat = new THREE.MeshBasicMaterial({
    color: colors.secondary, transparent: true, opacity: 0.05, wireframe: true,
  });
  const ghost = new THREE.Mesh(new THREE.SphereGeometry(2.0, 16, 12), ghostMat);
  objectGroup.add(ghost);

  // 12 vertex points (icosahedron has 12 vertices)
  const vp = icoGeo.attributes.position;
  const seen = new Set();
  const uniqueVerts = [];
  for (let i = 0; i < vp.count; i++) {
    const x = vp.getX(i).toFixed(3);
    const y = vp.getY(i).toFixed(3);
    const z = vp.getZ(i).toFixed(3);
    const key = `${x},${y},${z}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueVerts.push(new THREE.Vector3(parseFloat(x), parseFloat(y), parseFloat(z)));
    }
  }
  const pointsGeo = new THREE.BufferGeometry().setFromPoints(uniqueVerts);
  const pointsMat = new THREE.PointsMaterial({
    color: colors.accent, size: 0.09, transparent: true, opacity: 0.95, sizeAttenuation: true,
  });
  const vertexPoints = new THREE.Points(pointsGeo, pointsMat);
  objectGroup.add(vertexPoints);

  // Orbit ring 1 (large)
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(2.05, 0.005, 8, 128),
    new THREE.MeshBasicMaterial({ color: colors.accent, transparent: true, opacity: 0.5 })
  );
  ring1.rotation.x = Math.PI / 2.3;
  objectGroup.add(ring1);

  // Orbit ring 2 (smaller, tilted)
  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(1.75, 0.004, 8, 128),
    new THREE.MeshBasicMaterial({ color: colors.secondary, transparent: true, opacity: 0.4 })
  );
  ring2.rotation.x = Math.PI / 1.6;
  ring2.rotation.y = Math.PI / 4;
  objectGroup.add(ring2);

  // === Resize ===
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
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);

  // === Mouse parallax (desktop only) ===
  let mouseX = 0, mouseY = 0;
  if (!isTouch) {
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5);
      mouseY = (e.clientY / window.innerHeight - 0.5);
    });
  }

  // === Scroll progress (from script.js custom event) ===
  let scrollProgress = 0;
  window.addEventListener('heroScroll', (e) => {
    scrollProgress = e.detail.progress;
  });

  // === Animate ===
  const clock = new THREE.Clock();
  const bgLayers = [far, mid, near];
  const bgDepths = [0.3, 0.6, 1.0];

  function animate() {
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Idle rotation + scroll-driven additional rotation
    objectGroup.rotation.y += delta * 0.15;
    objectGroup.rotation.x = Math.sin(time * 0.4) * 0.08;

    // Scroll rotation (extra spin as user scrolls past hero)
    const scrollRot = scrollProgress * Math.PI * 1.2;
    objectGroup.rotation.y += scrollRot * delta * 0.5;

    // Mouse parallax
    if (!isTouch) {
      const targetY = mouseX * 0.4;
      const targetX = mouseY * 0.2;
      objectGroup.rotation.y += (targetY - objectGroup.rotation.y) * 0.04;
      objectGroup.rotation.x += (targetX - objectGroup.rotation.x) * 0.04;
    }

    // Pulse opacities
    icoMat.opacity = 0.55 + Math.sin(time * 1.5) * 0.2;
    solidMat.opacity = 0.06 + Math.sin(time * 1.2) * 0.04;
    ghostMat.opacity = 0.04 + Math.sin(time * 0.8) * 0.02;
    vertexPoints.material.opacity = 0.7 + Math.sin(time * 2) * 0.25;

    // Ring rotation (counter-rotating)
    ring1.rotation.z += delta * 0.18;
    ring2.rotation.z -= delta * 0.22;

    // Background depth layers — drift
    bgLayers.forEach((layer, idx) => {
      const depth = bgDepths[idx];
      const pos = layer.positions;
      const vel = layer.velocities;
      for (let i = 0; i < layer.count; i++) {
        pos[i * 3 + 1] += vel[i] * delta * depth;
        if (pos[i * 3 + 1] > layer.spread.y / 2) {
          pos[i * 3 + 1] = -layer.spread.y / 2;
          pos[i * 3]     = (Math.random() - 0.5) * layer.spread.x;
          pos[i * 3 + 2] = (Math.random() - 0.5) * layer.spread.z;
        }
      }
      layer.points.geometry.attributes.position.needsUpdate = true;
      // Slow rotation per layer (creates parallax illusion)
      layer.points.rotation.y += delta * 0.02 * depth;
      layer.points.rotation.x += delta * 0.01 * depth;
    });

    // Camera dolly on scroll (subtle)
    const targetZ = 5 + scrollProgress * 0.8;
    camera.position.z += (targetZ - camera.position.z) * 0.05;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  if (isTouch) canvas.style.opacity = '0.85';
}

// Bootstrap: defer init via requestIdleCallback so it doesn't block page load
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => initHero(THREE), { timeout: 2000 });
} else {
  setTimeout(() => initHero(THREE), 300);
}
