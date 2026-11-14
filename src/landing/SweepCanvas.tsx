import { useEffect, useRef } from 'react';
import { EcgStream } from './ecg';

export interface Channel {
  color: string;
  /** pixels per signal unit */
  gain: number;
  /** vertical position of the isoelectric line, 0..1 of height */
  baseline: number;
  read: (s: EcgStream) => number;
  width?: number;
  glow?: boolean;
}

interface Props {
  stream: EcgStream;
  channels: Channel[];
  /** pixels per second (25 mm/s on the drawn grid) */
  speed: number;
  className?: string;
  label?: string;
  /** change to force a redraw when motion is reduced (e.g. new rhythm) */
  version?: string;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A bedside-monitor style sweep: the trace writes left to right and erases a
 * short gap ahead of itself, like a real monitor.
 */
export default function SweepCanvas({ stream, channels, speed, className, label, version }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const channelsRef = useRef(channels);
  const reduced = prefersReducedMotion();
  channelsRef.current = channels;

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let w = 0;
    let h = 0;
    let x = 0;
    let lastY: (number | null)[] = [];
    let raf = 0;
    let prev = performance.now();
    let visible = true;

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      x = 0;
      lastY = channelsRef.current.map(() => null);
      if (reduced) drawStatic();
    };

    const segment = (x0: number, x1: number) => {
      channelsRef.current.forEach((c, i) => {
        const y = c.baseline * h - c.read(stream) * c.gain;
        const ly = lastY[i];
        if (ly !== null) {
          ctx.strokeStyle = c.color;
          ctx.lineWidth = c.width ?? 2;
          ctx.shadowBlur = c.glow ? 8 : 0;
          ctx.shadowColor = c.color;
          ctx.beginPath();
          ctx.moveTo(x0, ly);
          ctx.lineTo(x1, y);
          ctx.stroke();
        }
        lastY[i] = y;
      });
    };

    function drawStatic() {
      ctx.clearRect(0, 0, w, h);
      const dt = 1 / 400;
      lastY = channelsRef.current.map(() => null);
      for (let px = 0; px < w; px += speed * dt) {
        stream.advance(dt);
        segment(px, px + speed * dt);
      }
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      if (!visible) return;
      const steps = Math.max(1, Math.ceil(dt * 500));
      const sdt = dt / steps;
      const gap = 18;
      ctx.clearRect(x, 0, speed * dt + gap, h);
      for (let i = 0; i < steps; i++) {
        stream.advance(sdt);
        let nx = x + speed * sdt;
        if (nx > w) {
          x = 0;
          nx = speed * sdt;
          lastY = channelsRef.current.map(() => null);
          ctx.clearRect(0, 0, gap + speed * dt, h);
        }
        segment(x, nx);
        x = nx;
      }
    };

    setup();
    const ro = new ResizeObserver(() => setup());
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      prev = performance.now();
    });
    io.observe(canvas);
    if (!reduced) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [stream, speed, reduced ? version : '']);

  return <canvas ref={ref} className={className} role="img" aria-label={label} />;
}
