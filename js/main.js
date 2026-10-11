/* Rápido's Auto Socorro — interações */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Serviços: lista + prévia (funciona sem GSAP) ---------- */
  const rows = $$('.svc__row');
  const previews = $$('.pv');
  const activateService = (i) => {
    rows.forEach((r, k) => {
      const on = k === i;
      r.classList.toggle('is-active', on);
      r.setAttribute('aria-pressed', on);
    });
    previews.forEach((p, k) => p.classList.toggle('is-active', k === i));
  };
  rows.forEach((r, i) => {
    r.addEventListener('mouseenter', () => finePointer && activateService(i));
    r.addEventListener('focus', () => activateService(i));
    r.addEventListener('click', () => activateService(i));
  });

  /* ---------- Lightbox ---------- */
  const lb = $('#lb');
  let lenis = null;
  if (lb) {
    const lbImg = $('img', lb);
    $$('[data-lightbox]').forEach((b) => b.addEventListener('click', () => {
      lbImg.src = b.dataset.lightbox;
      lbImg.alt = b.dataset.alt || '';
      lb.showModal();
      lenis && lenis.stop();
    }));
    const close = () => lb.close();
    $('.lb__close', lb).addEventListener('click', close);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    lb.addEventListener('close', () => lenis && lenis.start());
  }

  if (!window.gsap || !window.ScrollTrigger) return; // conteúdo segue legível sem animação
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Scroll suave integrado ao ScrollTrigger ---------- */
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id.length > 1 && $(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: id === '#como' ? 0 : -10 });
    }));
  }

  /* ---------- Barra de progresso + nav ---------- */
  const bar = $('.progress i');
  gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.2 } });

  const nav = $('#nav');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('is-solid', y > 40);
      nav.classList.toggle('is-hidden', self.direction === 1 && y > 500);
    },
  });

  /* ---------- Hero ---------- */
  $$('[data-split] .line').forEach((line) => {
    line.innerHTML = line.textContent.trim().split(/\s+/)
      .map((w) => `<span class="word">${w}</span>`).join(' ');
  });
  if (!reduce) {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.1 });
    tl.from('.hero__title .word', { yPercent: 115, duration: 1.1, stagger: 0.09 })
      .from('[data-hero-in]', { y: 28, opacity: 0, duration: 0.9, stagger: 0.1 }, '-=0.7')
      .from('.hero__media img', { scale: 1.12, duration: 1.8, ease: 'power3.out' }, 0);
    gsap.to('[data-hero-media]', {
      yPercent: 9, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  /* ---------- Reveal genérico ---------- */
  if (!reduce) {
    $$('.reveal').forEach((el) => {
      gsap.from(el, {
        y: 38, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  }

  /* ---------- Responsivo: pin + parallax só em telas largas ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 760px)', () => {
    const steps = $$('[data-step]');
    const fill = $('[data-how-bar]');
    const setStep = (p) => {
      const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
      steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    };
    if (reduce) { steps.forEach((s) => s.classList.add('is-active')); return; }
    gsap.to('[data-how-road]', {
      xPercent: -40.5, ease: 'none',
      scrollTrigger: {
        trigger: '.how', start: 'top top', end: '+=240%', pin: '.how__stage', scrub: 0.6, anticipatePin: 1,
        onUpdate: (self) => { setStep(self.progress); gsap.set(fill, { scaleX: Math.max(0.02, self.progress) }); },
      },
    });
    $$('[data-parallax]').forEach((img) => {
      const k = parseFloat(img.dataset.parallax) * 100 * 0.5;
      gsap.fromTo(img, { yPercent: -k }, {
        yPercent: k, ease: 'none',
        scrollTrigger: { trigger: img.closest('.shot'), start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  });

  mm.add('(max-width: 759px)', () => {
    if (reduce) return;
    // dock de WhatsApp aparece depois do hero
    const dock = $('.dock');
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => dock.classList.toggle('is-on', self.scroll() > innerHeight * 0.75),
    });
    // leve movimento horizontal na foto lateral
    gsap.fromTo('[data-how-road] img', { xPercent: 4 }, {
      xPercent: -4, ease: 'none',
      scrollTrigger: { trigger: '.how', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  if (reduce) $('.dock')?.classList.add('is-on');

  /* ---------- Cursor custom + botões magnéticos (só mouse) ---------- */
  if (finePointer && !reduce) {
    const root = document.documentElement;
    const cur = $('.cursor');
    const dot = $('.cursor__dot');
    const ring = $('.cursor__ring');
    const label = $('.cursor__label');
    root.classList.add('has-cursor');
    cur.style.opacity = 0;
    addEventListener('mousemove', () => (cur.style.opacity = 1), { once: true });

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { x: pos.x, y: pos.y };
    addEventListener('mousemove', (e) => { pos.x = e.clientX; pos.y = e.clientY; }, { passive: true });

    gsap.ticker.add(() => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      dot.style.transform = `translate3d(${pos.x}px,${pos.y}px,0)`;
      ring.style.transform = `translate3d(${ringPos.x}px,${ringPos.y}px,0)`;
    });

    const states = ['is-link', 'is-button', 'is-view'];
    const setState = (name) => {
      cur.classList.remove(...states);
      label.textContent = '';
      if (name) {
        cur.classList.add('is-' + name);
        if (name === 'view') label.textContent = 'VER';
      }
    };
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-cursor]');
      setState(t ? t.dataset.cursor : null);
    });
    document.addEventListener('mouseleave', () => (cur.style.opacity = 0));
    document.addEventListener('mouseenter', () => (cur.style.opacity = 1));

    $$('[data-magnetic]').forEach((el) => {
      const qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
      const qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * 0.28);
        qy((e.clientY - (r.top + r.height / 2)) * 0.4);
      });
      el.addEventListener('mouseleave', () => { qx(0); qy(0); });
    });
  }

  /* ---------- Recalcular quando fontes/imagens terminarem ---------- */
  const refresh = () => ScrollTrigger.refresh();
  addEventListener('load', refresh);
  document.fonts && document.fonts.ready.then(refresh);
})();
