/* ============================================================
   QUELTO — V12 — interactions
   - Hero card 3D parallax (requestAnimationFrame, vrai lerp)
   - Magnetic CTAs (subtle)
   - Reveal on scroll
   - Count-up stats
   - Header shrink on scroll
   - Mobile menu
   ============================================================ */

(() => {
  'use strict';

  const isTouch = matchMedia('(hover: none)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  // --- Header shrink on scroll --------------------------------
  const header = $('#siteHeader');
  if (header) {
    let lastY = 0;
    const onScroll = () => {
      const y = scrollY;
      header.classList.toggle('is-scrolled', y > 12);
      lastY = y;
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Mobile menu --------------------------------------------
  const toggle = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', open);
      mobileMenu.setAttribute('aria-hidden', String(!open));
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', mobileMenu).forEach(a => a.addEventListener('click', () => {
      toggle.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      document.body.style.overflow = '';
    }));
  }

  // --- Reveal on scroll ---------------------------------------
  if ('IntersectionObserver' in window) {
    const targets = $$('.section .section-head, .bento-card, .step, .no-card, .contact-card, .qui-text, .qui-visu, .tarif-inner, .big-price, .contact-inner');
    targets.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(el => io.observe(el));
  }

  // --- Count-up stats -----------------------------------------
  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const animate = el => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur = 1400;
      const start = performance.now();
      const fmt = v => {
        return Number.isInteger(target) ? Math.round(v).toString() : v.toFixed(1);
      };
      const step = now => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        el.textContent = fmt(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      // Optional: fade in a sibling currency/follow-up element once count finishes
      const followSel = el.dataset.follow;
      if (followSel) {
        const follow = document.querySelector(followSel);
        if (follow) {
          follow.style.opacity = '0';
          follow.style.transition = 'opacity .5s var(--ease)';
          setTimeout(() => { follow.style.opacity = '1'; }, dur);
        }
      }
    };
    const io2 = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animate(e.target);
          io2.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(c => io2.observe(c));
  }

  // --- Hero card 3D parallax (vrai rAF, pas CSS) -------------
  if (!reduceMotion && !isTouch) {
    const card = $('#heroCard');
    if (card) {
      const window3d = card.querySelector('.card-window');
      const glow = card.querySelector('.card-glow');
      let tx = 0, ty = 0, tz = 0; // target
      let cx = 0, cy = 0, cz = 0; // current (lerped)

      // 3D scroll-tilt for the big hero glow too
      const heroGlow = $('.hero-glow');
      const sectionOff = () => {
        const r = card.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      };

      addEventListener('mousemove', e => {
        const c = sectionOff();
        // map distance to ±1
        const dx = (e.clientX - c.x) / innerWidth;
        const dy = (e.clientY - c.y) / innerHeight;
        tx = -dx * 12; // rotateY
        ty = -dy * 10; // rotateX
        tz = 1;        // scale hint
      }, { passive: true });

      const tickCard = () => {
        cx += (tx - cx) * 0.08;
        cy += (ty - cy) * 0.08;
        if (window3d) {
          window3d.style.transform = `rotateY(${cx}deg) rotateX(${cy}deg)`;
        }
        if (glow) {
          glow.style.transform = `translate(${cx * 1.5}px, ${cy * 1.5}px)`;
        }
        requestAnimationFrame(tickCard);
      };
      tickCard();
    }

    // Subtle mouse parallax on hero glow
    const glow = $('.hero-glow');
    if (glow) {
      let gx = 0, gy = 0, cx = 0, cy = 0;
      addEventListener('mousemove', e => {
        gx = (e.clientX / innerWidth - 0.5) * 30;
        gy = (e.clientY / innerHeight - 0.5) * 30;
      }, { passive: true });
      const tickGlow = () => {
        cx += (gx - cx) * 0.04;
        cy += (gy - cy) * 0.04;
        glow.style.translate = `${cx}px ${cy}px`;
        requestAnimationFrame(tickGlow);
      };
      tickGlow();
    }
  }

  // --- Magnetic CTAs ------------------------------------------
  if (!reduceMotion && !isTouch) {
    const magneticStrength = 0.25;
    $$('[data-magnetic]').forEach(el => {
      let tx = 0, ty = 0, cx = 0, cy = 0;
      const onMove = e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        tx = x * magneticStrength;
        ty = y * magneticStrength;
      };
      const onLeave = () => { tx = 0; ty = 0; };
      const tick = () => {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        el.style.translate = `${cx}px ${cy}px`;
        requestAnimationFrame(tick);
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      tick();
    });
  }

  // --- 3D tilt on bento/step/no cards -------------------------
  if (!reduceMotion && !isTouch) {
    const tiltMax = 6; // degrees
    const tiltEls = $$('.bento-card, .step, .no-card, .project-detail');
    tiltEls.forEach(el => {
      // Set up perspective on parent
      el.style.transformStyle = 'preserve-3d';
      el.style.transition = 'transform .15s var(--ease), border-color .25s var(--ease), background .25s var(--ease)';
      el.style.willChange = 'transform';

      // Inject a shine element
      const shine = document.createElement('div');
      shine.className = 'tilt-shine';
      shine.style.cssText = 'position:absolute; inset:0; border-radius: inherit; pointer-events:none; opacity:0; background: radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(249,115,22,0.15) 0%, transparent 50%); transition: opacity .3s var(--ease); z-index: 0;';
      el.style.position = el.style.position || 'relative';
      el.style.overflow = 'hidden';
      el.appendChild(shine);

      let tx = 0, ty = 0, cx = 0, cy = 0, mx = 50, my = 50;

      const onMove = e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        tx = (y - 0.5) * -tiltMax;  // rotateX
        ty = (x - 0.5) *  tiltMax;  // rotateY
        mx = x * 100;
        my = y * 100;
        el.style.setProperty('--mx', `${mx}%`);
        el.style.setProperty('--my', `${my}%`);
        shine.style.opacity = '1';
      };
      const onLeave = () => {
        tx = 0; ty = 0;
        shine.style.opacity = '0';
      };
      const tick = () => {
        cx += (tx - cx) * 0.12;
        cy += (ty - cy) * 0.12;
        el.style.transform = `perspective(800px) rotateX(${cx}deg) rotateY(${cy}deg) translateY(${cx !== 0 || cy !== 0 ? -2 : 0}px)`;
        requestAnimationFrame(tick);
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      tick();
    });
  }

  // --- Smooth scroll for in-page anchors -----------------------
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = $(id);
      if (!t) return;
      e.preventDefault();
      const top = t.getBoundingClientRect().top + scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
