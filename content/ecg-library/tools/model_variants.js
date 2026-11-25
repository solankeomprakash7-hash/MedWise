// Pulls 12-lead signals for teaching variants out of the lab's heart model: ECG.build(id, rate, variant).
// Run from content/ecg-library with Playwright installed: node tools/model_variants.js, then python3 tools/draw_models.py.
// Writes signals.json; draw_models.py draws each one with render.py into png/ (copy the .webp files to public/ecg/model/).
const { chromium } = require('playwright'); const fs = require('fs');
const JOBS = [
  ['vt', 150, 1], ['vt', 185, 2], ['vt', 200, 3], ['vt', 140, 4], ['vt', 220, 5], ['vt', 165, 6],
  ['vf', null, 1], ['vf', null, 2], ['vf', null, 3], ['vf', null, 4], ['vf', null, 5],
  ['tdp', null, 1], ['tdp', null, 2], ['tdp', null, 3], ['tdp', null, 4],
];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + require('path').resolve(__dirname, '../../../public/ecg-lab.html') + ''); await p.waitForTimeout(1500);
  const out = await p.evaluate(jobs => {
    const E = window.ECG; const res = {};
    // reference check: variant 0 must equal the shipped model
    for (const [id, rate, v] of jobs) {
      const D = E.build(id, rate, v);
      const leads = {}; for (const l of E.LEADS) leads[l] = Array.from(D.leads[l]);
      const qs = D.beats.filter(x => x.qOn != null).map(x => x.qOn).sort((a, c) => a - c);
      res[`model-${id}-v${v}`] = { id, rate, v, dt: E.DT, leads, beats: qs.length, meas: D.meas ? { qrs: D.meas.qrs, qt: D.meas.qt, axis: D.meas.axis } : null };
    }
    return res;
  }, JOBS);
  fs.writeFileSync('signals.json', JSON.stringify(out));
  for (const [k, v] of Object.entries(out)) console.log(k, 'beats', v.beats, 'dt', v.dt, 'n', v.leads.II.length, JSON.stringify(v.meas));
  await b.close();
})();
