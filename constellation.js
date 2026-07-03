/* ============================================================
   QUELTO — Constellation (footer background)
   - ~50 particles drifting slowly
   - Lines between close particles
   - Subtle orange tint on close pairs
   - 2D canvas, no library
   ============================================================ */

(() => {
  'use strict';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;
  if (reduceMotion || isTouch) return;

  // Inject canvas at the end of body, fixed low z-index
  const canvas = document.createElement('canvas');
  canvas.id = 'constellation';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position: fixed; left:0; right:0; bottom:0; height: 320px; pointer-events:none; z-index: 0; opacity: 0.6;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w, h, particles;

  function resize() {
    w = window.innerWidth;
    h = 320;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    seed();
  }

  function seed() {
    const count = Math.min(60, Math.floor(w / 22));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.4 + 0.4
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    // Move
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
    });
    // Connect
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          const alpha = (1 - d / maxDist) * 0.35;
          ctx.strokeStyle = `rgba(249,115,22,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    // Dots
    particles.forEach(p => {
      ctx.fillStyle = 'rgba(232,232,235,0.4)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(step);
  }

  resize();
  addEventListener('resize', resize);
  step();
})();
