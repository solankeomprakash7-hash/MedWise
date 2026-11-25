// MedWise landing: the module previews, the nav links that open a module tab, and the email list.
// Every number shown follows the published rule it names.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- radio groups ---------- */
function radios(group, onPick) {
  const btns = $$('[role="radio"]', group);
  const pick = b => {
    btns.forEach(x => x.setAttribute('aria-checked', String(x === b)));
    onPick(b);
  };
  btns.forEach((b, i) => {
    b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
    b.addEventListener('click', () => { pick(b); btns.forEach(x => (x.tabIndex = x === b ? 0 : -1)); });
    b.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const n = btns[(i + d + btns.length) % btns.length];
      n.click(); n.focus();
    });
  });
}

/* ---------- nav menu links open their module's tab ---------- */
$$('[data-open-tab]').forEach(a => a.addEventListener('click', () => {
  const t = document.getElementById(a.dataset.openTab);
  if (t) setTimeout(() => t.click(), 0);
}));

/* ---------- antibiotic stewardship ---------- */
const sources = {
  lung: ['Severe community-acquired pneumonia: a beta-lactam such as ceftriaxone plus a macrolide. Add MRSA or Pseudomonas cover only when risk factors are present.',
    'S. pneumoniae sensitive to ceftriaxone: stop the broader agents and plan a 5 to 7 day course if the patient is improving.'],
  urine: ['Urosepsis: ceftriaxone is a common empiric choice. Use a carbapenem when ESBL risk is high, guided by the local antibiogram.',
    'E. coli sensitive to ceftriaxone: keep the narrowest active agent and switch to oral once afebrile and haemodynamically stable.'],
  abdo: ['Source control first. Piperacillin-tazobactam is a common empiric choice for severe community-acquired intra-abdominal infection.',
    'Source controlled and improving: a fixed course of about 4 days after source control is often enough.'],
};
{
  const d = $('[data-demo="abx"]');
  radios($('.mw-seg', d), b => {
    const [e, r] = sources[b.dataset.src];
    $('[data-out="empiric"]', d).textContent = e;
    $('[data-out="review"]', d).textContent = r;
  });
}

/* ---------- hypertension: 2017 ACC/AHA ---------- */
{
  const d = $('[data-demo="htn"]');
  const sys = $('#sys'), dia = $('#dia'), cells = $$('.mw-scale span', d);
  const cat = (s, di) =>
    s > 180 || di > 120 ? [4, 'Hypertensive crisis range.', 'Look for acute target-organ damage first.'] :
    s >= 140 || di >= 90 ? [3, 'Stage 2 hypertension.', 'Usually lifestyle change plus drug therapy.'] :
    s >= 130 || di >= 80 ? [2, 'Stage 1 hypertension.', 'Treatment depends on cardiovascular risk.'] :
    s >= 120 ? [1, 'Elevated.', 'Lifestyle change and a recheck.'] : [0, 'Normal.', 'Recheck at routine visits.'];
  const draw = () => {
    const [i, name, note] = cat(+sys.value, +dia.value);
    $('[data-out="bp"]', d).textContent = `${sys.value}/${dia.value}`;
    cells.forEach((c, n) => c.classList.toggle('is-on', n === i));
    $('[data-out="bpv"]', d).innerHTML = `<b>${name}</b> ${note}`;
  };
  sys.addEventListener('input', draw); dia.addEventListener('input', draw); draw();
}

/* ---------- diabetes: ADA ranges, ADAG eAG = 28.7 x A1c - 46.7 ---------- */
{
  const d = $('[data-demo="dm"]');
  const a = $('#a1c'), cells = $$('.mw-scale span', d);
  const draw = () => {
    const v = +a.value, eag = 28.7 * v - 46.7;
    const i = v >= 6.5 ? 2 : v >= 5.7 ? 1 : 0;
    $('[data-out="a1c"]', d).textContent = `${v.toFixed(1)}%`;
    cells.forEach((c, n) => c.classList.toggle('is-on', n === i));
    const name = ['Normal range.', 'Prediabetes range.', 'Diabetes range.'][i];
    $('[data-out="a1cv"]', d).innerHTML = `<b>${name}</b> Estimated average glucose ${Math.round(eag)} mg/dL (${(eag / 18).toFixed(1)} mmol/L).` +
      (v >= 7 ? ' Above the under-7% target that suits many non-pregnant adults.' : '');
  };
  a.addEventListener('input', draw); draw();
}

/* ---------- pre-op: RCRI, risk per Duceppe 2017 ---------- */
{
  const d = $('[data-demo="preop"]');
  const boxes = $$('input[type="checkbox"]', d), risk = ['3.9%', '6.0%', '10.1%', '15.0%'];
  const draw = () => {
    const n = boxes.filter(b => b.checked).length;
    $('[data-out="rcri"]', d).textContent = n;
    $('[data-out="risk"]', d).textContent = risk[Math.min(n, 3)];
  };
  boxes.forEach(b => b.addEventListener('change', draw)); draw();
}

/* ---------- ECG: a sweeping lead II trace from summed gaussians ---------- */
{
  const d = $('[data-demo="ecg"]');
  const canvas = $('canvas', d), ctx = canvas.getContext('2d'), hr = $('[data-out="hr"]', d);
  const g = (t, c, w, a) => a * Math.exp(-((t - c) ** 2) / (2 * w * w));
  const sig = x => 1 / (1 + Math.exp(-x));
  const qrsT = (t, ta = 0.3) => g(t, .215, .009, -.12) + g(t, .24, .011, 1.15) + g(t, .266, .011, -.3) + g(t, .48, .05, ta);
  const beat = (r, t) => {
    if (t < -.05 || t > 1.3) return 0;
    if (r === 'sinus') return g(t, .1, .025, .14) + qrsT(t);
    if (r === 'stemi') return g(t, .1, .025, .14) + qrsT(t, .32) - g(t, .266, .011, -.2) + .32 * sig((t - .272) / .005) * (1 - sig((t - .5) / .035));
    if (r === 'af') return qrsT(t, .22);
    return g(t, .08, .034, 1.05) + g(t, .17, .04, -.75) + g(t, .27, .05, -.12);
  };
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const rrFor = r => r === 'sinus' ? (60 / 72) * (.98 + rand() * .04) : r === 'stemi' ? (60 / 92) * (.98 + rand() * .04) : r === 'af' ? .4 + rand() * .52 : 60 / 176;
  const s = { r: 'sinus', t: 0, start: 0, prev: -10 };
  s.rr = rrFor(s.r);
  const advance = dt => {
    s.t += dt;
    while (s.t - s.start >= s.rr) {
      s.prev = s.start; s.start += s.rr;
      hr.textContent = Math.round(60 / s.rr);
      s.rr = rrFor(s.r);
    }
  };
  const value = () => {
    let v = beat(s.r, s.t - s.start) + beat(s.r, s.t - s.prev);
    if (s.r === 'af') v += .045 * Math.sin(2 * Math.PI * 6.3 * s.t) + .03 * Math.sin(2 * Math.PI * 8.9 * s.t + 1.1);
    return v;
  };
  let w = 0, h = 0, x = 0, lastY = null;
  const speed = 160;
  const setup = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2), r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineJoin = ctx.lineCap = 'round'; ctx.lineWidth = 2;
    ctx.strokeStyle = getComputedStyle(canvas).color;
    x = 0; lastY = null;
    if (reduced()) still();
  };
  const seg = (x0, x1) => {
    const y = h * .62 - value() * h * .26;
    if (lastY !== null) { ctx.beginPath(); ctx.moveTo(x0, lastY); ctx.lineTo(x1, y); ctx.stroke(); }
    lastY = y;
  };
  const still = () => {
    ctx.clearRect(0, 0, w, h); lastY = null;
    for (let px = 0; px < w; px += speed / 400) { advance(1 / 400); seg(px, px + speed / 400); }
  };
  let prev = performance.now(), visible = false;
  const frame = now => {
    requestAnimationFrame(frame);
    const dt = Math.min((now - prev) / 1000, .05); prev = now;
    if (!visible || reduced() || !w) return;
    const steps = Math.ceil(dt * 500), sdt = dt / steps;
    ctx.clearRect(x, 0, speed * dt + 18, h);
    for (let i = 0; i < steps; i++) {
      advance(sdt);
      let nx = x + speed * sdt;
      if (nx > w) { x = 0; nx = speed * sdt; lastY = null; ctx.clearRect(0, 0, 18 + speed * dt, h); }
      seg(x, nx); x = nx;
    }
  };
  new ResizeObserver(setup).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; prev = performance.now(); }).observe(canvas);
  requestAnimationFrame(frame);
  radios($('.mw-seg', d), b => { s.r = b.dataset.rhythm; if (reduced()) still(); });
}

/* ---------- the email list: Firestore REST, collection "waitlist" ---------- */
{
  // The web app config of the Firebase project medwise-ecg (public by design; firestore.rules limit writes).
  const PROJECT = 'medwise-ecg';
  const DB = '(default)';
  const KEY = 'AIzaSyDokxhZi3IFo94JabdMAnv7DFQxBsBwFSo';
  const form = $('form[data-firestore]');
  const input = $('#join-email', form), err = $('#join-err', form), status = $('[data-join-status]', form);
  const btn = $('button[type="submit"]', form);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = input.value.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      err.hidden = false; input.setAttribute('aria-invalid', 'true'); input.focus(); status.textContent = '';
      return;
    }
    err.hidden = true; input.removeAttribute('aria-invalid');
    btn.disabled = true; status.textContent = 'Joining the list…';
    try {
      const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/${DB}/documents/waitlist?key=${KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: {
          email: { stringValue: email },
          source: { stringValue: 'landing' },
          createdAt: { timestampValue: new Date().toISOString() },
        } }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      status.textContent = `You're on the list. We'll write to ${email} when the next module opens.`;
    } catch {
      status.textContent = 'Your email was not saved. Check your connection and try again.';
    } finally {
      btn.disabled = false;
    }
  });
}
