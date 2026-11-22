import * as React from 'react';
import { Ruler, ZoomIn, ZoomOut } from 'lucide-react';

// A real 12-lead drawn at 25 mm/s and 10 mm/mV on a 262 × 126 mm sheet.
const W_MM = 262, H_MM = 126;
type Pt = { x: number; y: number };

export default function EcgViewer({ src, alt }: { src: string; alt: string }) {
  const [zoom, setZoom] = React.useState(false);
  const [cal, setCal] = React.useState(false);
  const [pts, setPts] = React.useState<Pt[]>([]);
  React.useEffect(() => { setPts([]); }, [src]);

  const onClick = (ev: React.MouseEvent<SVGSVGElement>) => {
    if (!cal) { setZoom(z => !z); return; }
    const r = ev.currentTarget.getBoundingClientRect();
    const p = { x: (ev.clientX - r.left) / r.width * W_MM, y: (ev.clientY - r.top) / r.height * H_MM };
    setPts(prev => (prev.length >= 2 ? [p] : [...prev, p]));
  };
  const read = pts.length === 2 ? (() => {
    const dt = Math.abs(pts[1].x - pts[0].x) * 40, dv = Math.abs(pts[1].y - pts[0].y);
    return `Δt ${Math.round(dt)} ms (${(dt / 40).toFixed(1)} small squares) · Δv ${dv.toFixed(1)} mm (${(dv / 10).toFixed(2)} mV)${dt >= 200 ? ` · ${Math.round(60000 / dt)}/min if R–R` : ''}`;
  })() : cal ? (pts.length ? 'Tap a second point' : 'Tap two points on the tracing to measure') : 'Tap the tracing to zoom';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-muted tabular-nums" aria-live="polite">{read}</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => { setCal(c => !c); setPts([]); }} aria-pressed={cal}
            className={`rounded-sm flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border ${cal ? 'bg-ink text-white border-ink' : 'bg-white border-line text-ink'}`}>
            <Ruler size={14} /> Calipers
          </button>
          <button type="button" onClick={() => setZoom(z => !z)} className="rounded-sm flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border bg-white border-line text-ink">
            {zoom ? <ZoomOut size={14} /> : <ZoomIn size={14} />} {zoom ? 'Fit' : 'Zoom'}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto border border-line bg-paper rounded-md">
        <div className="relative" style={{ width: zoom ? 1500 : '100%' }}>
          <img src={src} alt={alt} className="block w-full h-auto select-none" draggable={false} style={{ maxWidth: 'none' }} />
          <svg viewBox={`0 0 ${W_MM} ${H_MM}`} className={`absolute inset-0 w-full h-full ${cal ? 'cursor-crosshair' : 'cursor-zoom-in'}`} onClick={onClick} role="img" aria-label="Measurement layer">
            {pts.map((p, i) => <g key={i}><line x1={p.x} x2={p.x} y1={Math.max(0, p.y - 14)} y2={Math.min(H_MM, p.y + 14)} stroke="#1a1c49" strokeWidth={0.35} strokeDasharray="1.2 0.8" />
              <line x1={p.x - 1.5} x2={p.x + 1.5} y1={p.y} y2={p.y} stroke="#1a1c49" strokeWidth={0.4} /></g>)}
            {pts.length === 2 && <polyline points={`${pts[0].x},${pts[0].y} ${pts[1].x},${pts[0].y} ${pts[1].x},${pts[1].y}`} fill="none" stroke="#1a1c49" strokeWidth={0.5} />}
          </svg>
        </div>
      </div>
    </div>
  );
}
