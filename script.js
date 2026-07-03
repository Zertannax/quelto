/* =========================================================
   QUELTO — interactions
   - Custom cursor (desktop)
   - Magnetic CTAs
   - Scroll reveal with stagger
   - Count-up on hero numbers
   - Header scrolled state
   - Mobile menu
   - Parallax scroll (data-parallax attribute)
   ========================================================= */

(function () {
  'use strict';

  // ----- Year -----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ----- Custom cursor (desktop) -----
  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (cursor && cursorDot && isFinePointer) {
    let cx = 0, cy = 0;
    let tx = 0, ty = 0;
    const ringSpeed = 0.18;

    document.body.classList.add('cursor-ready');
    document.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      cursorDot.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
    });

    function tickRing() {
      cx += (tx - cx) * ringSpeed;
      cy += (ty - cy) * ringSpeed;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(tickRing);
    }
    tickRing();

    const interactiveSel = 'a, button, .magnetic, .tag-tech, [role="button"]';
    document.querySelectorAll(interactiveSel).forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  // ----- Magnetic CTAs -----
  if (isFinePointer) {
    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  // ----- Header scrolled state -----
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- Mobile menu -----
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      if (open) {
        mobileMenu.setAttribute('hidden', '');
      } else {
        mobileMenu.removeAttribute('hidden');
      }
    });
    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('hidden', '');
      });
    });
  }

  // ----- Reveal on scroll -----
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.revealDelay || '0', 10);
            setTimeout(() => el.classList.add('is-visible'), delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // ----- Count-up -----
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

  // ----- Parallax on data-parallax elements -----
  // Each element gets transform: translateY(scrollDelta * factor)
  // factor ranges from 0.05 to 0.3, slower than scroll for "depth" feel
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (parallaxEls.length && !prefersReducedMotion) {
    let scrollY = window.scrollY;
    let ticking = false;

    const updateParallax = () => {
      parallaxEls.forEach((el) => {
        const factor = parseFloat(el.dataset.parallax) || 0.1;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        const distance = elCenter - viewportCenter;
        // Translate opposite to scroll for "depth"
        const offset = distance * factor * -0.1;
        el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      scrollY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(() => {
          updateParallax();
        });
        ticking = true;
      }
    }, { passive: true });

    // Initial
    updateParallax();
  }

  // ----- Scroll-driven 3D hero rotation (rotation sent via custom event) -----
  if (!prefersReducedMotion) {
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      let lastScrollY = 0;
      window.addEventListener('scroll', () => {
        const rect = heroSection.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
        // Dispatch custom event for three-hero.js to pick up
        window.dispatchEvent(new CustomEvent('heroScroll', { detail: { progress } }));
        lastScrollY = window.scrollY;
      }, { passive: true });
    }
  }

  // ----- Smooth anchor scroll with header offset -----
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
