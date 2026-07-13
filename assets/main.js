// ─── HERO TYPEWRITER (hacker terminal effect) ───
  (function() {
    const el = document.getElementById('heroTypewriter');
    if (!el) return;
    const text = "I analyze how technology evolves from engineering concepts into defensible products, standards, and systems.";
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*';
    function randChar() { return chars[Math.floor(Math.random() * chars.length)]; }
    let i = 0;
    function typeNext() {
      if (i > text.length) return;
      let out = '';
      for (let j = 0; j < i; j++) out += text[j];
      // brief scramble flicker on the character currently being typed
      if (i < text.length) out += `<span class="glitch-char" style="color:#fff;">${randChar()}</span>`;
      el.innerHTML = out;
      i++;
      setTimeout(typeNext, 18 + Math.random() * 28);
    }
    setTimeout(typeNext, 900);
  })();

  // ─── HERO NAME + TAGLINE STAGGERED DECODE ───
  (function() {
    const lines = document.querySelectorAll('.hero-line[data-final]');
    lines.forEach((el, i) => setTimeout(() => runGlitch(el), 350 + i * 260));

    const words = document.querySelectorAll('.hero-word[data-final]');
    words.forEach((el, i) => setTimeout(() => runGlitch(el), 950 + i * 130));
  })();

  // ─── CUSTOM CURSOR ───
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });
  function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();
  document.querySelectorAll('a, button, .area-card, .note-card, .work-item').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });

  // ─── GLITCH-STYLE METRIC DECODE (no counting, no libraries) ───
  const GLITCH_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$+,';
  function glitchRandomChar() { return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]; }

  function runGlitch(el) {
    const final = el.dataset.final;
    if (!final || el.dataset.glitching === 'true') return;
    el.dataset.glitching = 'true';

    // Text is treated as already "there" — static and readable from frame
    // one. What plays on top is a short burst of glitch noise: a handful of
    // characters intermittently flicker to a random glyph (with the RGB-split
    // jitter styling) and flicker back, like a display glitching — not a
    // cipher decoding. It never passes through a fully-scrambled state.
    el.textContent = final;

    const length = final.length;
    const duration = 450 + Math.random() * 250; // short glitch burst, ~0.45–0.7s
    const startTime = performance.now();
    const density = 0.14; // fraction of characters flickering at any instant

    function update(now) {
      const elapsed = now - startTime;

      if (elapsed >= duration) {
        el.textContent = final;       // settle — clean, static, final value
        el.dataset.glitching = 'false';
        return;
      }

      let out = '';
      for (let k = 0; k < length; k++) {
        const ch = final[k];
        out += (ch !== ' ' && Math.random() < density)
          ? `<span class="glitch-char">${glitchRandomChar()}</span>`
          : ch;
      }
      el.innerHTML = out;
      requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ─── SCROLL REVEAL ───
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        const metricNum = entry.target.querySelector('.metric-num[data-final]');
        if (metricNum) runGlitch(metricNum);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ─── HAMBURGER NAV ───
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileNav.style.display = isOpen ? 'flex' : 'none';
    setTimeout(() => { if (isOpen) mobileNav.classList.add('open'); }, 10);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      setTimeout(() => { mobileNav.style.display = 'none'; }, 400);
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (hamburger.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        setTimeout(() => { mobileNav.style.display = 'none'; }, 400);
        document.body.style.overflow = '';
      }
    }
  });

  // ─── COSMIC GRAVITY MESH + STARFIELD ───
  (function() {
    const canvas = document.getElementById('heroParticles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, nodes = [], stars = [], galaxies = [], nebulae = [], mouse = { x: -9999, y: -9999 };

    const NODE_COUNT = 110;
    const STAR_COUNT = 460;
    const GALAXY_COUNT = 4;
    const CONNECT_DIST = 160;
    const GRAVITY_STRENGTH = 0.012;
    const REPEL_RADIUS = 90;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    // ── Stars (static background layer) ──
    function buildStars() {
      stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.1 + 0.15,
        alpha: Math.random() * 0.8 + 0.3,
        twinkleSpeed: Math.random() * 0.015 + 0.004,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: Math.random() < 0.12 ? `rgba(180,210,255,` : Math.random() < 0.08 ? `rgba(255,220,180,` : `rgba(255,255,255,`
      }));
    }

    // ── Galaxies (soft smeared glows) ──
    function buildGalaxies() {
      galaxies = Array.from({ length: GALAXY_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        rx: Math.random() * 120 + 60,
        ry: Math.random() * 60 + 25,
        angle: Math.random() * Math.PI,
        alpha: Math.random() * 0.055 + 0.018,
        hue: Math.random() < 0.4 ? '200,190,255' : Math.random() < 0.5 ? '190,220,255' : '255,200,210'
      }));
    }

    // ── Nebula patches ──
    function buildNebulae() {
      nebulae = Array.from({ length: 3 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 200 + 100,
        alpha: Math.random() * 0.03 + 0.01,
        hue: Math.random() < 0.5 ? '120,80,200' : '60,120,200'
      }));
    }

    // ── Mesh nodes ──
    function buildNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        ox: 0, oy: 0,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.55 + 0.2,
        mass: Math.random() * 1.2 + 0.5
      }));
      nodes.forEach(n => { n.ox = n.x; n.oy = n.y; });
    }

    function init() {
      resize();
      buildStars();
      buildGalaxies();
      buildNebulae();
      buildNodes();
    }

    let tick = 0;
    function animate() {
      tick++;
      ctx.clearRect(0, 0, W, H);

      // ── Draw nebulae ──
      nebulae.forEach(n => {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, `rgba(${n.hue},${n.alpha})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // ── Draw galaxies ──
      galaxies.forEach(g => {
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(g.angle);
        ctx.scale(1, g.ry / g.rx);
        const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, g.rx);
        gr.addColorStop(0, `rgba(${g.hue},${g.alpha * 2.5})`);
        gr.addColorStop(0.3, `rgba(${g.hue},${g.alpha})`);
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(0, 0, g.rx, 0, Math.PI * 2);
        ctx.fillStyle = gr;
        ctx.fill();
        ctx.restore();
      });

      // ── Draw stars with twinkle ──
      stars.forEach(s => {
        const twinkle = 0.5 + 0.5 * Math.sin(tick * s.twinkleSpeed + s.twinkleOffset);
        const a = s.alpha * (0.5 + 0.5 * twinkle);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${a})`;
        ctx.fill();
        // Bright star cross flare
        if (s.r > 0.9 && twinkle > 0.8) {
          ctx.strokeStyle = `${s.color}${a * 0.35})`;
          ctx.lineWidth = 0.4;
          const fl = s.r * 4;
          ctx.beginPath(); ctx.moveTo(s.x - fl, s.y); ctx.lineTo(s.x + fl, s.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(s.x, s.y - fl); ctx.lineTo(s.x, s.y + fl); ctx.stroke();
        }
      });

      // ── Update mesh nodes ──
      nodes.forEach(n => {
        // Gentle drift back to origin + mouse interaction
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS && dist > 1) {
          // Repel from mouse
          n.vx -= (dx / dist) * GRAVITY_STRENGTH * 2.5;
          n.vy -= (dy / dist) * GRAVITY_STRENGTH * 2.5;
        }

        // Slow drift
        n.vx += (Math.random() - 0.5) * 0.005;
        n.vy += (Math.random() - 0.5) * 0.005;

        // Damping
        n.vx *= 0.985;
        n.vy *= 0.985;

        // Wrap at edges
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = W + 20;
        if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20;
        if (n.y > H + 20) n.y = -20;
      });

      // ── Draw mesh connections ──
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const strength = 1 - dist / CONNECT_DIST;
            // Gravity-well sag: midpoint slightly pulled toward center mass
            const mx = (nodes[i].x + nodes[j].x) / 2;
            const my = (nodes[i].y + nodes[j].y) / 2;
            const sagX = mx + (W / 2 - mx) * 0.01 * strength;
            const sagY = my + (H / 2 - my) * 0.01 * strength;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.quadraticCurveTo(sagX, sagY, nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(180,200,255,${strength * 0.13})`;
            ctx.lineWidth = strength * 0.8;
            ctx.stroke();
          }
        }
      }

      // ── Draw node dots ──
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,215,255,${n.alpha})`;
        ctx.fill();
        // Soft halo on larger nodes
        if (n.r > 1.2) {
          const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5);
          halo.addColorStop(0, `rgba(160,190,255,0.12)`);
          halo.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
          ctx.fillStyle = halo;
          ctx.fill();
        }
      });

      requestAnimationFrame(animate);
    }

    // Mouse interaction
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

    window.addEventListener('resize', () => {
      resize();
      buildStars();
      buildGalaxies();
      buildNebulae();
      buildNodes();
    });

    init();
    animate();
  })();
