/* =====================================================
   Rapport de stage SISR — interactions (Liquid Glass)
   ===================================================== */

/* ---------- Nav : état au scroll + burger ---------- */
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const links = document.querySelector('.nav__links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

burger.addEventListener('click', () => {
  const open = burger.classList.toggle('open');
  links.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});
links.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    links.classList.remove('open');
  })
);

/* ---------- Barre de progression ---------- */
const progress = document.querySelector('.scroll-progress');
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (window.scrollY / h) * 100 + '%';
}, { passive: true });

/* ---------- Reveal au scroll ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = (e.target.dataset.delay || (i % 4) * 60) + 'ms';
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------- Compteurs animés ---------- */
const counters = document.querySelectorAll('.stat__num, .kpi__num');
const cio = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
    cio.unobserve(el);
  });
}, { threshold: 0.6 });
counters.forEach(c => cio.observe(c));

/* ---------- Scrollspy : lien actif ---------- */
(function scrollspy() {
  const navLinks = [...document.querySelectorAll('.nav__links a[href^="#"]')];
  const map = new Map();
  navLinks.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    const sec = document.getElementById(id);
    if (sec) map.set(sec, a);
  });
  if (!map.size) return;

  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const link = map.get(e.target);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  map.forEach((_, sec) => spy.observe(sec));
})();

/* =====================================================
   Lightbox — agrandissement des photos
   ===================================================== */
(function lightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const lbImg = document.getElementById('lb-img');
  const lbCap = document.getElementById('lb-cap');
  const btnClose = document.getElementById('lb-close');
  const btnPrev = document.getElementById('lb-prev');
  const btnNext = document.getElementById('lb-next');
  const triggers = [...document.querySelectorAll('.zoomable')];

  const items = triggers.map(el => {
    const img = el.querySelector('img');
    const fc = el.querySelector('figcaption');
    const tag = el.querySelector('.feature__tag');
    const cap = fc ? fc.textContent : (tag ? tag.textContent : (img.getAttribute('alt') || ''));
    return { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '', cap };
  });
  let idx = 0, lastFocus = null;

  function show(i) {
    idx = (i + items.length) % items.length;
    const it = items[idx];
    lbImg.src = it.src; lbImg.alt = it.alt; lbCap.textContent = it.cap;
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }
  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  triggers.forEach((el, i) => {
    el.addEventListener('click', () => open(i));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', e => { e.stopPropagation(); show(idx - 1); });
  btnNext.addEventListener('click', e => { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener('click', e => {
    if (e.target === lb || e.target.classList.contains('lightbox__fig')) close();
  });

  // Piège de focus : Tab boucle sur les boutons de la lightbox
  const focusables = [btnPrev, btnClose, btnNext];
  window.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowLeft') { show(idx - 1); return; }
    if (e.key === 'ArrowRight') { show(idx + 1); return; }
    if (e.key === 'Tab') {
      const i = focusables.indexOf(document.activeElement);
      const next = e.shiftKey
        ? (i <= 0 ? focusables.length - 1 : i - 1)
        : (i === focusables.length - 1 ? 0 : i + 1);
      e.preventDefault();
      focusables[next].focus();
    }
  });

  // Swipe mobile
  let tx = 0;
  lb.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
