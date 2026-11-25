import * as React from 'react';
import { Check, Lock } from 'lucide-react';

/** A small score ring: teal while in progress, green when complete, gold lock when the plan does not open it.
 *  The arc grows from its previous value (CSS transition), and sits still under reduced motion. */
export default function ProgressRing({ pct, size = 44, done, locked, label, children }: {
  pct: number; size?: number; done?: boolean; locked?: boolean; label?: string; children?: React.ReactNode;
}) {
  const sw = Math.max(3, size / 11), r = (size - sw) / 2, c = 2 * Math.PI * r;
  const [shown, setShown] = React.useState(0);
  React.useEffect(() => { const id = requestAnimationFrame(() => setShown(pct)); return () => cancelAnimationFrame(id); }, [pct]);
  return (
    <span className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }} role="img"
      aria-label={label ?? (locked ? 'Locked' : done ? 'Complete' : `${pct}% done`)}>
      <svg width={size} height={size} className="-rotate-90 absolute inset-0" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill={done ? 'var(--color-ok)' : locked ? 'var(--color-gold-soft)' : 'none'} stroke="var(--color-line)" strokeWidth={done ? 0 : sw} />
        {!locked && !done && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-accent)" strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, shown) / 100)} style={{ transition: 'stroke-dashoffset 700ms var(--ease)' }} />}
      </svg>
      <span className={`relative font-mono text-[11px] tabular-nums leading-none ${done ? 'text-white' : locked ? 'text-gold-ink' : 'text-ink'}`}>
        {done ? <Check size={size * 0.42} strokeWidth={2.5} /> : locked ? <Lock size={size * 0.34} /> : children}
      </span>
    </span>
  );
}
