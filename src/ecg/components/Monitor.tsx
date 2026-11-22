import * as React from 'react';
import TRACE from '../data/monitorTrace.json';

/** A bedside-monitor sweep of a real lead II (PTB-XL record 00441), drawn on ECG paper at 25 mm/s.
 *  Rests as a full still trace under reduced motion. */
export default function Monitor({ className = '' }: { className?: string }) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const cv = ref.current!; const ctx = cv.getContext('2d')!;
    const data = TRACE.mv as number[], hz = TRACE.hz, secs = data.length / hz, show = 5; // 5 s window, 125 mm wide
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, t0 = performance.now(), W = 0, H = 0;
    const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    const draw = (now: number) => {
      const mm = W / (show * 25), base = H * 0.62, gain = mm * 10;           // 10 mm per mV
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = Math.max(1.6, mm * 0.45); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      const head = still ? show : ((now - t0) / 1000) % show;                  // sweep position in seconds
      const lap = still ? 0 : Math.floor(((now - t0) / 1000) / show);
      const val = (s: number) => data[Math.floor(((s % secs) + secs) % secs * hz)];
      const plot = (from: number, to: number, offset: number, alpha: number) => {
        ctx.strokeStyle = `rgba(26,28,73,${alpha})`; ctx.beginPath();
        for (let s = from; s <= to; s += 1 / hz) { const x = s * 25 * mm, y = base - val(s + offset) * gain; s === from ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke();
      };
      plot(0, head, lap * show, 1);                                             // this sweep
      if (!still && head + 0.25 < show) plot(head + 0.25, show, (lap - 1) * show, 0.28); // last sweep, fading behind the gap
      if (!still) { const x = head * 25 * mm, y = base - val(head + lap * show) * gain;
        ctx.fillStyle = '#18ab97'; ctx.beginPath(); ctx.arc(x, y, Math.max(3, mm * 0.9), 0, 7); ctx.fill(); }
      if (!still) raf = requestAnimationFrame(draw);
    };
    const ro = new ResizeObserver(() => { size(); if (still) draw(0); }); ro.observe(cv);
    size(); raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} className={`block w-full ${className}`} role="img" aria-label="Lead II rhythm strip from a real patient ECG, sinus rhythm" />;
}
