/* =========================================================
   J K VISWAS — Portfolio Script
   ========================================================= */

'use strict';

/* ── HELPERS ──────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* =========================================================
   1. PARTICLE / STAR CANVAS BACKGROUND
   ========================================================= */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], mouseX = -9999, mouseY = -9999;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const PARTICLE_COUNT = 130;
  const COLOR_BASE = 'rgba(255, 0, 85,';
  const COLOR_BLUE = 'rgba(0, 212, 255,';

  function randomParticle(i) {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.5 + 0.15,
      isBlue: i % 7 === 0,
      twinkleOffset: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.02 + 0.008,
    };
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(randomParticle(i));
  }

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    frame++;

    particles.forEach((p, i) => {
      // Twinkle
      const twinkle = 0.5 + 0.5 * Math.sin(frame * p.twinkleSpeed + p.twinkleOffset);
      const a = p.alpha * twinkle;
      const col = p.isBlue ? COLOR_BLUE : COLOR_BASE;

      // Mouse repulsion
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100;
        p.vx += (dx / dist) * force * 0.15;
        p.vy += (dy / dist) * force * 0.15;
      }

      // Damping
      p.vx *= 0.98;
      p.vy *= 0.98;

      p.x += p.vx;
      p.y += p.vy;

      // Wrap
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = col + a + ')';
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const ex = p.x - q.x, ey = p.y - q.y;
        const ed = Math.sqrt(ex * ex + ey * ey);
        if (ed < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          const lineAlpha = (1 - ed / 100) * 0.12;
          ctx.strokeStyle = 'rgba(255, 0, 85,' + lineAlpha + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* =========================================================
   2. CUSTOM CURSOR
   ========================================================= */
(function initCursor() {
  const glow = document.getElementById('cursorGlow');
  const dot  = document.getElementById('cursorDot');
  if (!glow || !dot) return;

  let glowX = 0, glowY = 0, dotX = 0, dotY = 0;
  let targetX = 0, targetY = 0;

  document.addEventListener('mousemove', e => {
    targetX = e.clientX;
    targetY = e.clientY;
    dotX = targetX;
    dotY = targetY;
    dot.style.left = dotX + 'px';
    dot.style.top  = dotY + 'px';
  });

  (function animGlow() {
    glowX += (targetX - glowX) * 0.08;
    glowY += (targetY - glowY) * 0.08;
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    requestAnimationFrame(animGlow);
  })();
})();

/* =========================================================
   3. NAVBAR — SCROLL & MOBILE TOGGLE
   ========================================================= */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const links    = $$('.nav-link');

  // Scroll class
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    highlightActive();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile toggle
  toggle && toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Close on link click (mobile)
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle && toggle.classList.remove('active');
    });
  });

  // Active section highlight
  function highlightActive() {
    const scrollY = window.scrollY + 120;
    const sections = links.map(l => document.getElementById(l.dataset.section)).filter(Boolean);

    let current = sections[0];
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollY) current = sec;
    });

    links.forEach(l => l.classList.toggle('active', l.dataset.section === (current && current.id)));
  }
  highlightActive();
})();

/* =========================================================
   4. TYPING ANIMATION
   ========================================================= */
(function initTyping() {
  const el = document.getElementById('typedText');
  if (!el) return;

  const phrases = ['Developer', 'Tech Enthusiast', 'Problem Solver'];
  let phraseIdx = 0, charIdx = 0, isDeleting = false;

  function tick() {
    const phrase = phrases[phraseIdx];
    el.textContent = isDeleting
      ? phrase.slice(0, charIdx--)
      : phrase.slice(0, charIdx++);

    let delay = isDeleting ? 60 : 110;

    if (!isDeleting && charIdx > phrase.length) {
      isDeleting = true;
      delay = 1800; // pause before delete
    } else if (isDeleting && charIdx < 0) {
      isDeleting = false;
      charIdx = 0;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      delay = 400;
    }
    setTimeout(tick, delay);
  }
  tick();
})();

/* =========================================================
   5. SCROLL REVEAL
   ========================================================= */
(function initScrollReveal() {
  const revealEls = $$('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
})();

/* =========================================================
   6. SKILL BARS — ANIMATE ON SCROLL
   ========================================================= */
(function initSkillBars() {
  const bars = $$('.skill-bar-item');
  if (!bars.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const item = entry.target;
        const fill = item.querySelector('.skill-bar-fill');
        const pct  = item.dataset.percent || '0';
        if (fill) {
          // Small delay so reveal animation runs first
          setTimeout(() => {
            fill.style.width = pct + '%';
          }, 300);
        }
        observer.unobserve(item);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(b => observer.observe(b));
})();

/* =========================================================
   7. COUNTER ANIMATION (STATS)
   ========================================================= */
(function initCounters() {
  const counters = $$('.stat-number[data-target]');
  if (!counters.length) return;

  const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  function animateCounter(el, target) {
    const duration = 1800;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.floor(ease(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* =========================================================
   8. CONTACT FORM
   ========================================================= */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const btn     = document.getElementById('submitBtn');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name  = $('#contactName', form).value.trim();
    const email = $('#contactEmail', form).value.trim();
    const msg   = $('#contactMsg', form).value.trim();

    if (!name || !email || !msg) {
      shakeForm();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      shakeEmailField();
      return;
    }

    // Simulate send
    const btnText    = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');
    btn.disabled = true;
    btnText.style.display    = 'none';
    btnLoading.style.display = 'inline';

    setTimeout(() => {
      btn.disabled = false;
      btnText.style.display    = 'inline';
      btnLoading.style.display = 'none';
      success.style.display    = 'block';
      form.reset();
      setTimeout(() => { success.style.display = 'none'; }, 5000);
    }, 1800);
  });

  function shakeForm() {
    form.style.animation = 'none';
    form.offsetHeight; // reflow
    form.style.animation = 'shake 0.4s ease';
  }
  function shakeEmailField() {
    const emailInput = $('#contactEmail', form);
    emailInput.style.borderColor = '#ff0055';
    emailInput.style.boxShadow   = '0 0 0 3px rgba(255,0,85,0.2)';
    setTimeout(() => {
      emailInput.style.borderColor = '';
      emailInput.style.boxShadow   = '';
    }, 2000);
  }

  // Inject shake keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-8px)}
      40%{transform:translateX(8px)}
      60%{transform:translateX(-5px)}
      80%{transform:translateX(5px)}
    }
  `;
  document.head.appendChild(style);
})();

/* =========================================================
   9. BACK TO TOP
   ========================================================= */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* =========================================================
   10. PROJECT CARD TILT EFFECT
   ========================================================= */
(function initCardTilt() {
  const cards = $$('.project-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;
      const rotY = ((x - cx) / cx) * 6;
      const rotX = -((y - cy) / cy) * 4;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-10px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* =========================================================
   11. SMOOTH ANCHOR SCROLL OVERRIDE
   ========================================================= */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* =========================================================
   12. HERO BADGE CURSOR TRAIL
   ========================================================= */
(function initHeroGlow() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    hero.style.setProperty('--mx', x + 'px');
    hero.style.setProperty('--my', y + 'px');
  });
})();

/* =========================================================
   13. SECTION GLOW DIVIDERS (subtle pulse)
   ========================================================= */
(function initDividerPulse() {
  const style = document.createElement('style');
  style.textContent = `
    .section::after {
      content: '';
      display: block;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,0,85,0.3), transparent);
      position: absolute;
      bottom: 0; left: 0; right: 0;
      animation: divider-pulse 4s ease-in-out infinite;
    }
    @keyframes divider-pulse {
      0%,100% { opacity: 0.4; }
      50%      { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
})();

/* ─── All done ─────────────────────────────────────────── */
console.log('%c J K VISWAS PORTFOLIO ', 'background:#ff0055;color:#fff;font-size:14px;padding:6px 12px;border-radius:4px;font-weight:bold;');
console.log('%c Built with HTML · CSS · JavaScript ', 'color:#ff0055;font-size:11px;');
