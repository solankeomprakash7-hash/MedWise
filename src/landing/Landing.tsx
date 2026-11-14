import { useEffect, useRef, useState, type ComponentType, type FormEvent, type KeyboardEvent } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { Activity, ClipboardCheck, Droplet, Gauge, Pill, type LucideIcon } from 'lucide-react';
import { brand, courses, interests, modules, type ModuleId } from './brand';
import { AbxDemo, BpDemo, DmDemo, EcgDemo, PreopDemo } from './demos';
import './landing.css';

const icons: Record<ModuleId, LucideIcon> = {
  ecg: Activity,
  abx: Pill,
  htn: Gauge,
  dm: Droplet,
  preop: ClipboardCheck,
};
const demos: Record<ModuleId, ComponentType> = {
  ecg: EcgDemo,
  abx: AbxDemo,
  htn: BpDemo,
  dm: DmDemo,
  preop: PreopDemo,
};

/* ---------- logo ---------- */

function Logo({ light = false }: { light?: boolean }) {
  if (brand.logo) {
    return <img src={brand.logo} alt="MedWise" className="logo-img" />;
  }
  return (
    <span className={`logo ${light ? 'logo-light' : ''}`}>
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <rect width="28" height="28" rx="8" className="logo-bg" />
        <path d="M7 20V8l7 8 7-8v12" className="logo-m" />
      </svg>
      <span>MedWise</span>
    </span>
  );
}

function ScrollBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.4 });
  return <motion.div className="scroll-bar" style={{ scaleX }} aria-hidden="true" />;
}

/* ---------- nav ---------- */

function Nav() {
  return (
    <header className="nav">
      <div className="nav-inner wrap">
        <a href="#top" aria-label="MedWise home">
          <Logo />
        </a>
        <nav aria-label="Main">
          <a href="#platform">Platform</a>
          <a href="#courses">Courses</a>
          <a href="#about">About</a>
        </nav>
        <a href={brand.appUrl} className="btn btn-small">
          Open MedWise
        </a>
      </div>
      <ScrollBar />
    </header>
  );
}

/* ---------- hero + platform window ---------- */

const CYCLE_MS = 9000;

function Platform() {
  const [active, setActive] = useState<ModuleId>(modules[0].id);
  const [auto, setAuto] = useState(true);
  const reduced = useReducedMotion();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Walk through the modules until the visitor touches anything.
  useEffect(() => {
    if (!auto || reduced) return;
    const t = setTimeout(() => {
      const i = modules.findIndex((m) => m.id === active);
      setActive(modules[(i + 1) % modules.length].id);
    }, CYCLE_MS);
    return () => clearTimeout(t);
  }, [active, auto, reduced]);

  const choose = (id: ModuleId) => {
    setAuto(false);
    setActive(id);
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const n = (i + dir + modules.length) % modules.length;
    choose(modules[n].id);
    tabRefs.current[n]?.focus();
  };

  const m = modules.find((x) => x.id === active)!;
  const Demo = demos[active];

  return (
    <div
      className={`platform mod-${active}`}
      id="platform"
      onPointerDown={() => setAuto(false)}
      onFocusCapture={() => setAuto(false)}
    >
      <div className="platform-bar" aria-hidden="true">
        <span />
        <span />
        <span />
        <p>medwise / {m.short.toLowerCase()}</p>
      </div>
      <div className="platform-body">
        <div className="tabs" role="tablist" aria-label="MedWise modules" aria-orientation="vertical">
          {modules.map((x, i) => {
            const Icon = icons[x.id];
            const on = x.id === active;
            return (
              <button
                key={x.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`tab-${x.id}`}
                aria-selected={on}
                aria-controls="panel"
                tabIndex={on ? 0 : -1}
                className={`tab tab-${x.id} ${on ? 'on' : ''}`}
                onClick={() => choose(x.id)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <Icon size={18} strokeWidth={2} aria-hidden="true" />
                <span className="tab-name">{x.name}</span>
                <span className={`tab-status st-${x.status.split(' ')[0].toLowerCase()}`}>{x.status}</span>
                {on && auto && !reduced && <span className="tab-timer" key={active} />}
              </button>
            );
          })}
        </div>

        <div className="panel" role="tabpanel" id="panel" aria-labelledby={`tab-${active}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.2, 0.7, 0.1, 1] }}
            >
              <div className="panel-head">
                <h3>{m.name}</h3>
                <p>{m.summary}</p>
                <p className="basis">Based on {m.basis}</p>
              </div>
              <Demo />
              <div className="panel-foot">
                <span>Illustrative example for education. Not a substitute for clinical judgement.</span>
                <a href={m.href} className="text-link">
                  {m.status === 'Live' ? `Open ${m.short.toLowerCase()} in the app` : 'Get notified when it opens'}
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const lines = ['Clinical decisions,', 'with the reasoning', 'on the screen.'];
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div className="hero-grid">
          <h1 className="hero-title">
            {lines.map((l, i) => (
              <span className="line" key={l}>
                <motion.span
                  initial={{ y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.11, ease: [0.2, 0.7, 0.1, 1] }}
                >
                  {l}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.div
            className="hero-side"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          >
            <p>
              MedWise is a clinical decision support platform for the ward and the ICU. ECG
              interpretation, antibiotic stewardship, hypertension, diabetes and pre-operative
              evaluation sit in one place, and every suggestion shows the guideline behind it.
            </p>
            <div className="cta-row">
              <a href={brand.appUrl} className="btn">
                Open MedWise
              </a>
              <a href="#join" className="btn btn-ghost">
                Get early access
              </a>
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.45, ease: [0.2, 0.7, 0.1, 1] }}
        >
          <Platform />
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- principles ---------- */

function Principles() {
  const items = [
    {
      t: 'Reasoning you can check',
      d: 'Each suggestion names the guideline and the patient findings it used, so you can agree, adjust or overrule it.',
    },
    {
      t: 'Built for the bedside',
      d: 'Short inputs, fast answers and layouts that work on a phone in a corridor as well as on a ward computer.',
    },
    {
      t: 'Written by a clinician',
      d: 'Modules are designed around the questions doctors actually ask on rounds and on call, not around a textbook index.',
    },
  ];
  return (
    <section className="principles">
      <div className="wrap principles-grid">
        <h2>Support, not a black box</h2>
        <dl>
          {items.map((x) => (
            <div key={x.t}>
              <dt>{x.t}</dt>
              <dd>{x.d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ---------- courses ---------- */

function Courses() {
  return (
    <section className="courses" id="courses">
      <div className="wrap">
        <div className="section-head">
          <h2>Courses</h2>
          <p>
            Learn the reasoning behind each module. Short, case-based courses that start with the
            question you will face, then give you what you need to answer it.
          </p>
        </div>
        <ul className="course-list">
          {courses.map((c) => (
            <li key={c.id} className="course">
              <div className="course-main">
                <h3>{c.title}</h3>
                <p>{c.summary}</p>
              </div>
              <dl className="course-meta">
                <div>
                  <dt>For</dt>
                  <dd>{c.audience}</dd>
                </div>
                <div>
                  <dt>Format</dt>
                  <dd>{c.format}</dd>
                </div>
              </dl>
              <div className="course-cta">
                <span className={`status status-${c.status.split(' ')[0].toLowerCase()}`}>{c.status}</span>
                <a href="#join" className="btn btn-ghost btn-small">
                  Notify me
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- about ---------- */

function About() {
  const initials = brand.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
  return (
    <section className="about" id="about">
      <div className="wrap about-grid">
        <div className="portrait">
          {brand.photo ? <img src={brand.photo} alt={`Portrait of ${brand.name}`} /> : <span aria-hidden="true">{initials}</span>}
        </div>
        <div className="about-copy">
          <h2>{brand.name}</h2>
          <p className="role">{brand.role}</p>
          <p>
            I started MedWise because the decisions that matter most on a shift are often made in a
            hurry, with the guideline somewhere else. Which antibiotic, and for how long. Whether
            this blood pressure needs treatment today. Whether this patient is fit for theatre.
          </p>
          <p>
            MedWise puts that reasoning next to the patient, and the courses teach it properly so
            you can do it without the app too.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- join ---------- */

type Status = 'idle' | 'sending' | 'done' | 'error';

function Join() {
  const [email, setEmail] = useState('');
  const [picked, setPicked] = useState<string[]>(['platform']);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus('error');
      setError('Enter an email address like name@example.com.');
      return;
    }
    setStatus('sending');
    try {
      const [{ db }, fs] = await Promise.all([import('../lib/firebase'), import('firebase/firestore')]);
      await fs.addDoc(fs.collection(db, 'waitlist'), {
        email: email.trim().toLowerCase(),
        interests: picked,
        createdAt: fs.serverTimestamp(),
        source: 'landing',
      });
      setStatus('done');
    } catch (err) {
      console.error('Waitlist signup failed', err);
      setStatus('error');
      setError('Your email was not saved. Check your connection and try again.');
    }
  };

  return (
    <section className="join" id="join">
      <div className="wrap join-grid">
        <div>
          <h2>Get early access</h2>
          <p>
            New modules open to the list first. You will also get one short note a week on a real
            clinical decision, worked through. Unsubscribe whenever you like.
          </p>
        </div>
        {status === 'done' ? (
          <div className="join-done" role="status">
            <p className="join-done-title">You're on the list.</p>
            <p>I'll write to {email} as each module opens.</p>
          </div>
        ) : (
          <form className="join-form" onSubmit={submit} noValidate>
            <label htmlFor="email">Email</label>
            <div className="join-row">
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={status === 'error'}
                aria-describedby={status === 'error' ? 'join-err' : undefined}
                placeholder="name@example.com"
              />
              <button className="btn btn-light" disabled={status === 'sending'}>
                {status === 'sending' ? 'Joining…' : 'Join the list'}
              </button>
            </div>
            {status === 'error' && (
              <p className="join-err" id="join-err" role="alert">
                {error}
              </p>
            )}
            <fieldset>
              <legend>I'm interested in</legend>
              <div className="chips">
                {interests.map((i) => (
                  <label key={i.id} className="chip">
                    <input type="checkbox" checked={picked.includes(i.id)} onChange={() => toggle(i.id)} />
                    <span>{i.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </form>
        )}
      </div>
    </section>
  );
}

function Footer() {
  const socials = brand.socials.filter((s) => s.href);
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <Logo light />
        <p className="disclaimer">
          MedWise is a clinical decision support and education resource. It does not replace
          clinical judgement or local guidelines.
        </p>
        <div className="footer-links">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
          {brand.contactEmail && <a href={`mailto:${brand.contactEmail}`}>Email</a>}
          <span>
            © {new Date().getFullYear()} {brand.name}
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  useEffect(() => {
    document.title = 'MedWise | Clinical decision support';
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <div className="landing">
        <a href="#main" className="skip">
          Skip to content
        </a>
        <Nav />
        <main id="main">
          <Hero />
          <Principles />
          <Courses />
          <About />
          <Join />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
