// MedWise landing, glass edition: the aurora behind the panes, the module tabs, the phone menu,
// and the note under the hero monitor. The demos and the email list live in landing.js.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const still = matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- aurora: brand-coloured light fields drifting behind the glass ---------- */
// Each rhythm on the hero monitor gives the light a mood: calm teal, uneasy gold, alarm rose, ischaemic amber.
const MOODS = {
  sinus: [[24, 171, 151], [90, 96, 200], [226, 169, 70], [120, 200, 230]],
  af:    [[226, 169, 70], [24, 171, 151], [240, 150, 90], [140, 120, 210]],
  vt:    [[232, 96, 120], [120, 80, 200], [226, 120, 70], [90, 96, 200]],
  stemi: [[240, 140, 70], [200, 80, 110], [226, 169, 70], [90, 96, 200]],
};
const cv = $('#aurora'), cx = cv.getContext('2d');
const blobs = [
  { x: .14, y: .18, r: .55, sp: .00011, ph: 0 },
  { x: .86, y: .14, r: .5, sp: .00009, ph: 2 },
  { x: .72, y: .86, r: .6, sp: .00013, ph: 4 },
  { x: .18, y: .82, r: .45, sp: .00008, ph: 1 },
];
let W = 0, H = 0, cur = MOODS.sinus.map(c => [...c]), target = MOODS.sinus;
const dark = () => { const t = document.documentElement.dataset.theme; return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; };
function size() { const d = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); }
function paint(now) {
  cur = cur.map((c, i) => c.map((v, j) => v + (target[i][j] - v) * 0.03));
  cx.globalCompositeOperation = 'source-over';
  cx.fillStyle = getComputedStyle(document.body).backgroundColor; cx.fillRect(0, 0, W, H);
  const d = dark();
  cx.globalCompositeOperation = d ? 'screen' : 'multiply';
  const a = d ? .34 : .42;
  blobs.forEach((b, i) => {
    const t = now * b.sp + b.ph;
    const x = (b.x + Math.sin(t) * .06) * W, y = (b.y + Math.cos(t * 1.3) * .05) * H, r = b.r * Math.max(W, H);
    const c = cur[i].map(Math.round), g = cx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  });
}
let raf = 0;
const loop = now => { paint(now); raf = requestAnimationFrame(loop); };
const settle = () => { for (let i = 0; i < 120; i++) cur = cur.map((c, k) => c.map((v, j) => v + (target[k][j] - v) * 0.05)); paint(0); };
function run() { cancelAnimationFrame(raf); if (still.matches) settle(); else raf = requestAnimationFrame(loop); }
addEventListener('resize', () => { size(); if (still.matches) settle(); });
still.addEventListener('change', run);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => still.matches && settle());
size(); run();

/* ---------- hero monitor: a note for each rhythm, and the aurora follows it ---------- */
const NOTES = {
  sinus: '<b>Sinus rhythm.</b> A P wave before every QRS, a regular rate between 60 and 100.',
  af: '<b>Atrial fibrillation.</b> No P waves, a wavy baseline and an irregularly irregular rhythm.',
  vt: '<b>Ventricular tachycardia.</b> Broad, fast and regular. Treat a broad-complex tachycardia as VT until proven otherwise.',
  stemi: '<b>Anterior STEMI.</b> ST elevation from the J point. In V1 to V4 this calls for reperfusion now.',
};
const mon = $('[data-demo="ecg"]'), note = $('[data-rhythm-note]');
$$('[data-rhythm]', mon).forEach(b => b.addEventListener('click', () => {
  const r = b.dataset.rhythm; note.innerHTML = NOTES[r]; target = MOODS[r];
  mon.dataset.mood = r; if (still.matches) settle();
}));

/* ---------- module tabs (arrow keys move between tabs) ---------- */
$$('[role="tablist"]').forEach(list => {
  const tabs = $$('[role="tab"]', list);
  const select = (tab, focus) => {
    tabs.forEach(t => {
      const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      const p = document.getElementById(t.getAttribute('aria-controls')); if (p) p.hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
    });
  });
});

/* ---------- phone menu ---------- */
const btn = $('.menu-btn'), menu = $('#menu');
const setOpen = open => { btn.setAttribute('aria-expanded', String(open)); document.body.classList.toggle('menu-open', open); };
btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); } });
