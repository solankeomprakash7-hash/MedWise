import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { beatShape } from './ecg';

// A fixed 4-second lead II strip at 75 bpm (R–R 800 ms).
const SECONDS = 4;
const RR = 0.8;
const VW = 1000; // viewBox width -> 250 units per second
const VH = 240;
const PX_PER_S = VW / SECONDS;
const PX_PER_MV = 80; // 10 mm/mV on a 40-unit large box
const BASE = 150;

function stripPath() {
  const pts: string[] = [];
  for (let i = 0; i <= SECONDS * 250; i++) {
    const t = i / 250;
    const local = t % RR;
    const v = beatShape('sinus', local) + beatShape('sinus', local + RR);
    pts.push(`${(t * PX_PER_S).toFixed(1)},${(BASE - v * PX_PER_MV).toFixed(1)}`);
  }
  return 'M' + pts.join(' L');
}

const R1 = 0.24;
const clamp = (v: number) => Math.min(SECONDS, Math.max(0, v));

export default function Calipers() {
  const path = useMemo(stripPath, []);
  const svg = useRef<SVGSVGElement>(null);
  const [a, setA] = useState(R1);
  const [b, setB] = useState(R1 + RR);
  const drag = useRef<null | 'a' | 'b'>(null);

  const toSec = (clientX: number) => {
    const r = svg.current!.getBoundingClientRect();
    return clamp(((clientX - r.left) / r.width) * SECONDS);
  };

  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    const t = toSec(e.clientX);
    const target = (e.target as Element).getAttribute('data-handle') as 'a' | 'b' | null;
    svg.current!.setPointerCapture(e.pointerId);
    if (target) {
      drag.current = target;
    } else {
      setA(t);
      setB(t);
      drag.current = 'b';
    }
  };
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const t = toSec(e.clientX);
    (drag.current === 'a' ? setA : setB)(t);
  };
  const onUp = () => {
    drag.current = null;
  };

  const onKey = (which: 'a' | 'b') => (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.04 : 0.004;
    const set = which === 'a' ? setA : setB;
    if (e.key === 'ArrowRight') set((v) => clamp(v + step));
    else if (e.key === 'ArrowLeft') set((v) => clamp(v - step));
    else return;
    e.preventDefault();
  };

  const ms = Math.round(Math.abs(b - a) * 1000);
  const bpm = ms > 150 ? Math.round(60000 / ms) : null;
  const xa = a * PX_PER_S;
  const xb = b * PX_PER_S;
  const lo = Math.min(xa, xb);
  const hi = Math.max(xa, xb);

  const handle = (which: 'a' | 'b', x: number) => (
    <g
      className="cal-handle"
      tabIndex={0}
      role="slider"
      aria-label={which === 'a' ? 'Left caliper' : 'Right caliper'}
      aria-valuemin={0}
      aria-valuemax={SECONDS * 1000}
      aria-valuenow={Math.round((which === 'a' ? a : b) * 1000)}
      aria-valuetext={`${Math.round((which === 'a' ? a : b) * 1000)} milliseconds`}
      onKeyDown={onKey(which)}
    >
      <line x1={x} x2={x} y1={14} y2={VH} />
      <rect data-handle={which} x={x - 14} y={0} width={28} height={VH} fill="transparent" />
      <circle data-handle={which} cx={x} cy={14} r={9} />
    </g>
  );

  return (
    <div className="calipers">
      <div className="cal-readout" aria-live="polite">
        <div>
          <span className="cal-num">{ms}</span>
          <span className="cal-unit">ms</span>
        </div>
        <p>
          {bpm ? (
            <>
              As an R–R interval that is <strong>{bpm} bpm</strong>.
            </>
          ) : ms >= 60 ? (
            <>A QRS under 120 ms is narrow. A PR of 120 to 200 ms is normal.</>
          ) : (
            <>Drag across the strip to measure.</>
          )}
        </p>
      </div>
      <svg
        ref={svg}
        className="cal-strip"
        viewBox={`0 0 ${VW} ${VH}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        aria-label="Lead II rhythm strip with two measuring calipers"
      >
        <defs>
          <pattern id="cal-minor" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M8 0H0V8" className="grid-minor" />
          </pattern>
          <pattern id="cal-major" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="url(#cal-minor)" />
            <path d="M40 0H0V40" className="grid-major" />
          </pattern>
        </defs>
        <rect width={VW} height={VH} fill="url(#cal-major)" />
        <rect className="cal-span" x={lo} y={14} width={hi - lo} height={VH - 14} />
        <path d={path} className="cal-trace" />
        <text x={12} y={VH - 14} className="cal-lead">
          II
        </text>
        <line className="cal-bridge" x1={lo} x2={hi} y1={14} y2={14} />
        {handle('a', xa)}
        {handle('b', xb)}
      </svg>
    </div>
  );
}
