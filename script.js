/* =========================================================
   QUELTO — interactions (sobriety + life)
   - Cursor (small dot, grows on interactive)
   - Magnetic CTAs (10% translate)
   - Header scrolled state
   - Reveal on scroll (with stagger)
   - Count-up on hero stats
   - Scroll-driven 3D clock (custom event)
   - Smooth anchor scroll
   ========================================================= */

(function () {
  'use strict';

  // Year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // ----- Custom cursor (desktop) -----
  const cursor = document.getElementById('cursor');
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (cursor && isFinePointer) {
    document.body.classList.add('cursor-ready');
    let tx = 0, ty = 0;
    document.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      cursor.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
    });
    const interactiveSel = 'a, button, .magnetic, [role="button"]';
    document.querySelectorAll(interactiveSel).forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  // ----- Magnetic CTAs (gentle, 10% max) -----
  if (isFinePointer) {
    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  // ----- Header scrolled state -----
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 8) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ----- Reveal on scroll (with stagger) -----
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.revealDelay || '0', 10);
            setTimeout(() => {
              el.classList.add('is-visible');
              // Trigger step line draw if it's a step li
              if (el.classList.contains('step')) el.classList.add('is-visible');
            }, delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // ----- Count-up on hero stats -----
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const duration = 1400;
          const start = performance.now();
          const ease = (t) => 1 - Math.pow(1 - t, 3);
          const step = (now) => {
            const p = Math.min((now - start) / duration, 1);
            el.textContent = Math.round(ease(p) * target).toString();
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          cio.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = c.dataset.count));
  }

  // ----- Scroll progress for 3D -----
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    window.addEventListener('scroll', () => {
      const rect = heroSection.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
      window.dispatchEvent(new CustomEvent('heroScroll', { detail: { progress } }));
    }, { passive: true });
  }

  // ----- Smooth anchor scroll -----
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
