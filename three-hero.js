/* =========================================================
   QUELTO — Three.js hero (sablier stylisé en wireframe + halo)
   - Inline ESM via importmap (Vercel/Geist style)
   - Loaded conditionally by the inline script in index.html
   - On no-WebGL the SVG fallback in the HTML is what users see
   ========================================================= */

import * as THREE from 'three';

function initHero(THREE) {
  'use strict';

  const canvas = document.getElementById('heroCanvas');
  const heroVisual = canvas ? canvas.closest('.hero-visual') : null;
  if (!canvas || !heroVisual) return;

  // Mark for CSS to hide fallback
  heroVisual.classList.add('has-webgl');

  // Touch detection (for parallax disable + opacity)
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // Renderer
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Scene + camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Colors
  const colors = {
    primary: new THREE.Color(0x5B6CFF),
    secondary: new THREE.Color(0xA78BFA),
    accent: new THREE.Color(0x00E5FF),
    highlight: new THREE.Color(0xF0FF4D),
  };

  // --- Object: icosahedron wireframe + inner ghost sphere + 12 vertex points + 2 orbit rings ---
  const objectGroup = new THREE.Group();
  scene.add(objectGroup);

  // Wireframe icosahedron
  const icoGeo = new THREE.IcosahedronGeometry(1.4, 1);
  const icoEdges = new THREE.EdgesGeometry(icoGeo);
  const icoMat = new THREE.LineBasicMaterial({
    color: colors.primary,
    transparent: true,
    opacity: 0.7,
  });
  const icoLines = new THREE.LineSegments(icoEdges, icoMat);
  objectGroup.add(icoLines);

  // Inner ghost sphere (faint fill)
  const sphereGeo = new THREE.IcosahedronGeometry(1.35, 2);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: colors.secondary,
    transparent: true,
    opacity: 0.08,
    wireframe: false,
  });
  const ghostSphere = new THREE.Mesh(sphereGeo, sphereMat);
  objectGroup.add(ghostSphere);

  // 12 vertex points (icosahedron has 12 vertices)
  const vertexPositions = icoGeo.attributes.position;
  const seen = new Set();
  const uniqueVerts = [];
  for (let i = 0; i < vertexPositions.count; i++) {
    const x = vertexPositions.getX(i);
    const y = vertexPositions.getY(i);
    const z = vertexPositions.getZ(i);
    const key = `${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueVerts.push(new THREE.Vector3(x, y, z));
    }
  }

  const pointsGeo = new THREE.BufferGeometry().setFromPoints(uniqueVerts);
  const pointsMat = new THREE.PointsMaterial({
    color: colors.accent,
    size: 0.08,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });
  const vertexPoints = new THREE.Points(pointsGeo, pointsMat);
  objectGroup.add(vertexPoints);

  // Orbit ring 1 (large horizontal)
  const ringGeo1 = new THREE.TorusGeometry(2.0, 0.005, 8, 128);
  const ringMat1 = new THREE.MeshBasicMaterial({
    color: colors.accent,
    transparent: true,
    opacity: 0.45,
  });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  ring1.rotation.x = Math.PI / 2.3;
  objectGroup.add(ring1);

  // Orbit ring 2 (smaller, tilted)
  const ringGeo2 = new THREE.TorusGeometry(1.7, 0.004, 8, 128);
  const ringMat2 = new THREE.MeshBasicMaterial({
    color: colors.secondary,
    transparent: true,
    opacity: 0.35,
  });
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
  ring2.rotation.x = Math.PI / 1.6;
  ring2.rotation.y = Math.PI / 4;
  objectGroup.add(ring2);

  // Tiny floating particles around the object
  const particlesCount = 80;
  const particlesGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 2.4 + Math.random() * 0.6;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particlesMat = new THREE.PointsMaterial({
    color: colors.highlight,
    size: 0.04,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(particlesGeo, particlesMat);
  objectGroup.add(particles);

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
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);

  // Mouse parallax (desktop only)
  let mouseX = 0, mouseY = 0;
  if (!isTouch) {
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5);
      mouseY = (e.clientY / window.innerHeight - 0.5);
    });
  }

  // Auto rotation
  const clock = new THREE.Clock();

  function animate() {
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Idle rotation + mouse parallax
    objectGroup.rotation.y += delta * 0.18;
    objectGroup.rotation.x = Math.sin(time * 0.4) * 0.08;
    if (!isTouch) {
      objectGroup.rotation.y += (mouseX * 0.5 - (objectGroup.rotation.y - Math.sin(time * 0.4) * 0.08)) * 0.05;
    }

    // Pulse opacity
    icoMat.opacity = 0.5 + Math.sin(time * 1.5) * 0.2;
    sphereMat.opacity = 0.06 + Math.sin(time * 1.2) * 0.04;

    // Ring rotation
    ring1.rotation.z += delta * 0.15;
    ring2.rotation.z -= delta * 0.22;

    // Particles drift
    particles.rotation.y += delta * 0.05;
    particles.rotation.x += delta * 0.03;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // Touch opacity
  if (isTouch) {
    canvas.style.opacity = '0.85';
  }
}

// Bootstrap: defer init via requestIdleCallback so it doesn't block page load
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => initHero(THREE), { timeout: 2000 });
} else {
  setTimeout(() => initHero(THREE), 300);
}
