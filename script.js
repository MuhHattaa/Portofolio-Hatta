// Circuit Board LED Background Animation + Interactive Features
(() => {
  // Navbar Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navMenuItems = document.querySelectorAll('.nav-menu-item');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Close menu when clicking on a nav item
  navMenuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const href = item.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    const isToggle = navToggle && navToggle.contains(e.target);
    const isMenu = navMenu && navMenu.contains(e.target);
    if (!isToggle && !isMenu) {
      navMenu.classList.remove('active');
    }
  });

  // Button handlers for "Tentang Saya" and "Lihat Project"
  const aboutBtn = document.getElementById('about-btn');
  if(aboutBtn){
    aboutBtn.addEventListener('click', () => {
      const target = document.getElementById('about');
      if(target){
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  const projectsBtn = document.getElementById('projects-btn');
  if(projectsBtn){
    projectsBtn.addEventListener('click', () => {
      const target = document.getElementById('projects');
      if(target){
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Parallax layers (mouse + scroll) — smooth interpolation
  (function initParallaxLayers(){
    const layers = Array.from(document.querySelectorAll('.parallax-layer'));
    if(!layers.length) return;

    const state = { mx: 0, my: 0, tx: 0, ty: 0, sy: window.scrollY };

    window.addEventListener('mousemove', (e) => {
      state.mx = (e.clientX / window.innerWidth - 0.5);
      state.my = (e.clientY / window.innerHeight - 0.5);
    }, {passive:true});
    window.addEventListener('touchmove', (e) => {
      if(!e.touches || !e.touches[0]) return;
      const t0 = e.touches[0];
      state.mx = (t0.clientX / window.innerWidth - 0.5);
      state.my = (t0.clientY / window.innerHeight - 0.5);
    }, {passive:true});

    window.addEventListener('scroll', () => { state.sy = window.scrollY; }, {passive:true});

    function depthFor(el){
      if(el.classList.contains('layer-grid')) return 0.03;
      if(el.classList.contains('layer-circuits')) return 0.07;
      if(el.classList.contains('layer-dust')) return 0.12;
      return 0.05;
    }

    const depths = layers.map(l => depthFor(l));

    function raf(){
      // smooth towards target
      state.tx += (state.mx - state.tx) * 0.08;
      state.ty += (state.my - state.ty) * 0.08;

      const scroll = state.sy;
      const base = Math.min(1, window.innerWidth / 1200);

      layers.forEach((el, i) => {
        const d = depths[i] * base;
        const x = state.tx * d * 80; // horizontal parallax
        const y = state.ty * d * 80 + scroll * d * 0.06; // vertical + scroll offset
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });

      requestAnimationFrame(raf);
    }

    raf();
  })();

  // scroll-down chevron/button in hero -> scroll to about
  const sd = document.getElementById('scroll-down');
  if(sd){
    sd.addEventListener('click', ()=>{
      const node = document.getElementById('about');
      node && node.scrollIntoView({behavior:'smooth', block:'start'});
    });
    // allow Enter/Space to activate
    sd.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sd.click(); } });
  }

  // Modals
  document.querySelectorAll('.info-btn, .card-project .btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const modalId = btn.dataset.modal || (btn.dataset.project && 'arch-modal');
      if(!modalId) return;
      const modal = document.getElementById(modalId);
      if(modal){ modal.setAttribute('aria-hidden','false'); }
    });
  });
  document.querySelectorAll('.modal .modal-close').forEach(b=>{
    b.addEventListener('click', ()=> b.closest('.modal').setAttribute('aria-hidden','true'))
  });
  document.querySelectorAll('.modal').forEach(m=>{
    m.addEventListener('click', e=>{ if(e.target===m) m.setAttribute('aria-hidden','true') })
  });

  // Terminal typing effect
  const terminal = document.getElementById('terminal');
  if(terminal){
    const lines = ['JavaScript • Node.js • TS','Clean Architecture','CI/CD • Docker • GH Actions','Testing • Observability'];
    let i=0, j=0;
    const tick = ()=>{
      const text = lines[i].slice(0, j++);
      terminal.textContent = '~ ' + text;
      if(j>lines[i].length){ j=0; i=(i+1)%lines.length; setTimeout(tick,800); }
      else setTimeout(tick,80);
    }
    tick();
  }

  // Animated gradient (CSS) + Starfield parallax background (canvas)
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let DPR = Math.max(1, devicePixelRatio || 1);
    let w = canvas.width = Math.floor(innerWidth * DPR);
    let h = canvas.height = Math.floor(innerHeight * DPR);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';

    let stars = [];
    let starCount = 0;
    // code-token particles (moving tokens like </>, JS, 0101, {}, <> etc.)
    let tokens = [];
    let tokenCount = 0;
    const tokenStrings = [
      '</>', 'JS', 'TS', '0101', '{ }', '<>', 'API', 'CLI', 'fn',
      'const', 'let', 'var', '=>', '() =>', 'if', 'for', 'while', 'npm', 'git', 'push', 'pull', 'dev',
      'console.log', 'HTTP', 'JSON', 'XML', 'CSS', 'HTML', '<main>', '</main>', 'async', 'await', 'try', 'catch',
      'Promise', 'argv', 'stdin', 'stdout', 'docker', 'kubectl', 'lambda', 'handler', 'render', 'bind'
    ];
    const reducedMotion = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    function initStars() {
      stars = [];
      const area = innerWidth * innerHeight;
      starCount = Math.min(700, Math.max(160, Math.floor(area / 1600)));
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: Math.random(), // depth 0..1 (0 front, 1 back)
          r: (Math.random() * 1.6 + 0.2) * DPR,
          baseAlpha: 0.4 + Math.random() * 0.6,
          tw: Math.random() * Math.PI * 2
        });
      }

      // init tokens: reduce density/visibility so background is subtler
      tokens = [];
      const maxTokens = reducedMotion || innerWidth < 720 ? Math.min(36, Math.floor(area / 6500)) : Math.min(180, Math.floor(area / 3500));
      tokenCount = Math.max(8, maxTokens);
      for (let i = 0; i < tokenCount; i++) {
        const z = Math.random();
        // slightly increased base movement so tokens remain visible (but still subtle)
        const speedBase = reducedMotion || innerWidth < 720 ? 0.005 : 0.06;
        const angle = Math.random() * Math.PI * 2;
        const sp = (0.12 + Math.random() * 0.6) * speedBase * DPR;
        // slightly larger sizes so tokens are more legible
        const rawSize = Math.floor((1.0 - z) * (5 + Math.random() * 6));
        const cappedSize = Math.min(Math.max(rawSize, 7), 14);
        tokens.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: z,
          txt: tokenStrings[Math.floor(Math.random() * tokenStrings.length)],
          alpha: 0.28 + Math.random() * 0.44,
          tw: Math.random() * Math.PI * 2,
          rot: (Math.random() - 0.5) * 0.12,
          size: cappedSize * DPR,
          vx: Math.cos(angle) * sp,
          vy: Math.sin(angle) * sp
        });
      }
    }

    function resize() {
      DPR = Math.max(1, devicePixelRatio || 1);
      w = canvas.width = Math.floor(innerWidth * DPR);
      h = canvas.height = Math.floor(innerHeight * DPR);
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      initStars();
    }
    addEventListener('resize', resize);

    // mouse / touch state for parallax
    const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0 };
    addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.nx = (e.clientX / innerWidth - 0.5);
      mouse.ny = (e.clientY / innerHeight - 0.5);
    });
    addEventListener('touchmove', (e) => {
      if (!e.touches || !e.touches[0]) return;
      const t0 = e.touches[0];
      mouse.x = t0.clientX;
      mouse.y = t0.clientY;
      mouse.nx = (t0.clientX / innerWidth - 0.5);
      mouse.ny = (t0.clientY / innerHeight - 0.5);
    }, {passive:true});

    initStars();

    let t = 0;
    // color helpers for green-blue gradient (matching buttons)
    const COL_A = {r: 0x00, g: 0xe6, b: 0xa8}; // #00e6a8
    const COL_B = {r: 0x00, g: 0xbc, b: 0xd4}; // #00bcd4
    function lerp(a, b, v){ return a + (b - a) * v; }
    function mixColor(a, b, v){ return { r: Math.round(lerp(a.r,b.r,v)), g: Math.round(lerp(a.g,b.g,v)), b: Math.round(lerp(a.b,b.b,v)) }; }
    function loop() {
      ctx.clearRect(0, 0, w, h);
      // render only code tokens (starfield removed)

      // draw code tokens on top of stars but below glow; tokens behave like larger, slower particles
      if (tokens && tokens.length) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let k = 0; k < tokens.length; k++) {
          const tkn = tokens[k];
          // twinkle timer
          tkn.tw += 0.008 + (0.006 * Math.random());
          const alpha = Math.max(0.05, Math.min(1, tkn.alpha * (0.6 + 0.4 * Math.sin(tkn.tw + t * 0.01))));
          const depth = 1 - tkn.z; // near -> larger

          // integrate velocity — tokens move freely, smoothly affected by mouse parallax
          // add interpolation for soft easing
          tkn.mx = (tkn.mx || 0) + ((mouse.nx * 35 * depth) - (tkn.mx || 0)) * 0.15;
          tkn.my = (tkn.my || 0) + ((mouse.ny * 25 * depth) - (tkn.my || 0)) * 0.15;
          tkn.x += tkn.vx + tkn.mx;
          tkn.y += tkn.vy + tkn.my + (0.02 * depth);

          // wrap around bounds
          if (tkn.x < -40) tkn.x += w + 80;
          if (tkn.x > w + 40) tkn.x -= w + 80;
          if (tkn.y < -40) tkn.y += h + 80;
          if (tkn.y > h + 40) tkn.y -= h + 80;

          // gentle per-token oscillation
          const px = (tkn.x + Math.sin(tkn.tw * 0.6) * (3 + depth * 6)) % w;
          const py = (tkn.y + Math.cos(tkn.tw * 0.4) * (2 + depth * 5) + (t * 0.015 * depth)) % h;

          // set font and color (keep tokens legible but subtle)
          // use Fira Code for a technology/programmer feel, fall back to monospace
          ctx.font = `${Math.max(10, Math.min(16, tkn.size))}px 'Fira Code', 'Courier New', monospace`;
          ctx.fillStyle = `rgba(${COL_A.r},${COL_A.g},${COL_A.b},${(alpha * 0.95).toFixed(3)})`;
          ctx.fillText(tkn.txt, (px + w) % w, (py + h) % h);

          // brighter halo for more visibility
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = `rgba(${COL_A.r},${COL_A.g},${COL_A.b},${(alpha * 0.22).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc((px + w) % w, (py + h) % h, Math.max(6, tkn.size * 0.42), 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        }
        ctx.restore();
      }

      t++;
      requestAnimationFrame(loop);
    }

    loop();
  }
  // Skill bars animation on scroll
  function initSkillBars(){
    const bars = document.querySelectorAll('.skill-bar');
    bars.forEach(b => {
      const fill = b.querySelector('.skill-bar-fill');
      fill.style.width = '0%';
    });

    if('IntersectionObserver' in window){
      const obs = new IntersectionObserver((entries, o) => {
        entries.forEach(en => {
          if(en.isIntersecting){
            document.querySelectorAll('.skill-bar').forEach(b => {
              const fill = b.querySelector('.skill-bar-fill');
              const pct = b.dataset.percent || 0;
              fill.style.width = pct + '%';
            });
            o.disconnect();
          }
        });
      }, {threshold: 0.25});
      const node = document.getElementById('skills');
      if(node) obs.observe(node);
    } else {
      // fallback: set immediately
      document.querySelectorAll('.skill-bar').forEach(b => {
        const fill = b.querySelector('.skill-bar-fill');
        const pct = b.dataset.percent || 0;
        fill.style.width = pct + '%';
      });
    }
  }

  initSkillBars();

})();
