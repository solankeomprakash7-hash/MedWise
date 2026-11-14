// Synthetic ECG and pleth signals, built from summed gaussians.
// Units: time in seconds, amplitude in millivolts (pleth is unitless 0..1).

export type Rhythm = 'sinus' | 'af' | 'vt' | 'stemi';

export const rhythms: { id: Rhythm; label: string }[] = [
  { id: 'sinus', label: 'Sinus rhythm' },
  { id: 'af', label: 'Atrial fibrillation' },
  { id: 'vt', label: 'Ventricular tachycardia' },
  { id: 'stemi', label: 'Anterior STEMI' },
];

const g = (t: number, c: number, w: number, a: number) =>
  a * Math.exp(-((t - c) ** 2) / (2 * w * w));
const sig = (x: number) => 1 / (1 + Math.exp(-x));

function qrsT(t: number, tAmp = 0.3) {
  return (
    g(t, 0.215, 0.009, -0.12) +
    g(t, 0.24, 0.011, 1.15) +
    g(t, 0.266, 0.011, -0.3) +
    g(t, 0.48, 0.05, tAmp)
  );
}

export function beatShape(r: Rhythm, t: number): number {
  if (t < -0.05 || t > 1.3) return 0;
  switch (r) {
    case 'sinus':
      return g(t, 0.1, 0.025, 0.14) + qrsT(t);
    case 'stemi': {
      // ST segment lifts off the J point and merges into a tall T wave.
      const st = 0.32 * sig((t - 0.272) / 0.005) * (1 - sig((t - 0.5) / 0.035));
      return g(t, 0.1, 0.025, 0.14) + qrsT(t, 0.32) - g(t, 0.266, 0.011, -0.2) + st;
    }
    case 'af':
      return qrsT(t, 0.22);
    case 'vt':
      return g(t, 0.08, 0.034, 1.05) + g(t, 0.17, 0.04, -0.75) + g(t, 0.27, 0.05, -0.12);
  }
}

function plethShape(t: number, amp: number) {
  if (t < 0 || t > 1.4) return 0;
  return amp * (g(t, 0.46, 0.085, 1) + g(t, 0.7, 0.07, 0.38));
}

function fibrillation(T: number) {
  return (
    0.045 * Math.sin(2 * Math.PI * 6.3 * T) +
    0.03 * Math.sin(2 * Math.PI * 8.9 * T + 1.1) +
    0.02 * Math.sin(2 * Math.PI * 4.7 * T + 2.3)
  );
}

// Deterministic PRNG so static strips render the same every time.
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class EcgStream {
  rhythm: Rhythm;
  t = 0;
  private beatStart = 0;
  private prevStart = -10;
  private rr: number;
  lastRR: number;
  onBeat?: (rr: number) => void;
  private rand: () => number;

  constructor(rhythm: Rhythm = 'sinus', seed = 7) {
    this.rhythm = rhythm;
    this.rand = mulberry32(seed);
    this.rr = this.nextRR();
    this.lastRR = this.rr;
  }

  setRhythm(r: Rhythm) {
    this.rhythm = r;
  }

  private nextRR() {
    const j = this.rand();
    switch (this.rhythm) {
      case 'sinus':
        return (60 / 72) * (0.98 + j * 0.04);
      case 'stemi':
        return (60 / 92) * (0.98 + j * 0.04);
      case 'af':
        return 0.4 + j * 0.52;
      case 'vt':
        return 60 / 176;
    }
  }

  advance(dt: number) {
    this.t += dt;
    while (this.t - this.beatStart >= this.rr) {
      this.prevStart = this.beatStart;
      this.beatStart += this.rr;
      this.lastRR = this.rr;
      this.rr = this.nextRR();
      this.onBeat?.(this.lastRR);
    }
  }

  ecg() {
    const a = this.t - this.beatStart;
    const b = this.t - this.prevStart;
    let v = beatShape(this.rhythm, a) + beatShape(this.rhythm, b);
    if (this.rhythm === 'af') v += fibrillation(this.t);
    return v + (this.rand() - 0.5) * 0.012;
  }

  pleth() {
    const amp = this.rhythm === 'vt' ? 0.35 : 1;
    const a = this.t - this.beatStart;
    const b = this.t - this.prevStart;
    return plethShape(a, amp) + plethShape(b, amp);
  }
}

// One static strip, sampled at `hz`, for SVG rendering.
export function staticStrip(r: Rhythm, seconds: number, hz = 250, seed = 3) {
  const s = new EcgStream(r, seed);
  const pts: number[] = [];
  const dt = 1 / hz;
  for (let i = 0; i <= seconds * hz; i++) {
    pts.push(s.ecg());
    s.advance(dt);
  }
  return pts;
}
