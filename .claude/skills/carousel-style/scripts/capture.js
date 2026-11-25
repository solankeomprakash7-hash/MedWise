// node capture.js <slides.html> <outdir> <framesdir> [slides=1..9] [fps=30] [secs=7] [stillsOnly]
// Renders each <section id="sN"> by stepping every CSS animation in headless Chromium, one loop
// from t=secs to t=2*secs (all animations already running, so frame 0 is finished and the loop is seamless).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const [html, outDir, frDir, list = '1,2,3,4,5,6,7,8,9', fps = '30', secs = '7', stillsOnly = ''] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  fs.mkdirSync(outDir, { recursive: true });
  const T0 = +secs * 1000;
  for (const n of list.split(',')) {
    await page.goto('file://' + path.resolve(html) + '?s=' + n);
    await page.evaluate(() => document.fonts.ready);
    const el = await page.$('#s' + n);
    const setT = ms => page.evaluate(ms => document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms; }), ms);
    const nn = String(n).padStart(2, '0');
    await setT(T0); await el.screenshot({ path: path.join(outDir, `${nn}.png`) });
    if (stillsOnly) continue;
    const d = path.join(frDir, 's' + n); fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true });
    const N = Math.round(+fps * +secs);
    for (let i = 0; i < N; i++) {
      await setT(T0 + i * 1000 / +fps);
      await el.screenshot({ path: path.join(d, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 95 });
    }
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', fps, '-i', path.join(d, 'f%04d.jpg'),
      '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100', '-shortest',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', '-c:a', 'aac', '-b:a', '64k',
      '-movflags', '+faststart', path.join(outDir, `${nn}.mp4`)]);
    console.log('slide', n, 'done');
  }
  await browser.close();
})();
