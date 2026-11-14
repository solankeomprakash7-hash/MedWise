import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { MotionConfig, motion, useScroll, useSpring } from 'motion/react';
import { EcgStream, rhythms, staticStrip, type Rhythm } from './ecg';
import SweepCanvas, { type Channel } from './SweepCanvas';
import Calipers from './Calipers';
import { brand, courses, interests } from './brand';
import './landing.css';

/* ---------- small pieces ---------- */

function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true" className="mark">
      <rect x="0.5" y="0.5" width="27" height="27" rx="7" />
      <path d="M3 15h5l2-4 2.5 9L16 5l2.5 13 1.5-3h5" />
    </svg>
  );
}

// A path of repeated beats for the reading-progress line under the nav.
function progressPath(width: number, height: number) {
  const pts = staticStrip('sinus', 9, 120, 11);
  const step = width / (pts.length - 1);
  return (
    'M' +
    pts
      .map((v, i) => `${(i * step).toFixed(1)},${(height * 0.7 - v * height * 0.5).toFixed(1)}`)
      .join(' L')
  );
}

function ScrollTrace() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const d = useMemo(() => progressPath(1200, 22), []);
  return (
    <svg className="scroll-trace" viewBox="0 0 1200 22" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} className="scroll-trace-ghost" />
      <motion.path d={d} style={{ pathLength: p }} className="scroll-trace-ink" />
    </svg>
  );
}

const ink: Channel = {
  color: '#1b2238',
  gain: 62,
  baseline: 0.62,
  width: 2.2,
  read: (s) => s.ecg(),
};

/* ---------- sections ---------- */

function Nav() {
  return (
    <header className="nav">
      <div className="nav-inner wrap">
        <a href="#top" className="brand" aria-label="MedWise home">
          <Mark />
          <span>MedWise</span>
        </a>
        <nav aria-label="Main">
          <a href="#lab">ECG lab</a>
          <a href="#courses">Courses</a>
          <a href="#app">App</a>
          <a href="#about">About</a>
        </nav>
        <a href="#join" className="btn btn-small">
          Join the list
        </a>
      </div>
      <ScrollTrace />
    </header>
  );
}

function Hero() {
  const stream = useMemo(() => new EcgStream('sinus', 5), []);
  const [rhythm, setRhythm] = useState<Rhythm>('sinus');
  const hrRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    stream.onBeat = (rr) => {
      if (hrRef.current) hrRef.current.textContent = String(Math.round(60 / rr));
      const dot = dotRef.current;
      if (dot) {
        dot.classList.remove('beat');
        void dot.offsetWidth;
        dot.classList.add('beat');
      }
    };
    return () => {
      stream.onBeat = undefined;
    };
  }, [stream]);

  const pick = (r: Rhythm) => {
    setRhythm(r);
    stream.setRhythm(r);
  };

  const lines = ['Medicine that', 'makes sense', 'at 3 a.m.'];
  const label = rhythms.find((r) => r.id === rhythm)!.label;

  return (
    <section className="hero ecg-paper" id="top">
      <div className="wrap hero-grid">
        <h1 className="hero-title">
          {lines.map((l, i) => (
            <span className="line" key={l}>
              <motion.span
                initial={{ y: '105%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.2, 0.7, 0.1, 1] }}
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
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <p>
            I'm {brand.firstName}. MedWise is where I teach ECGs and ICU medicine the way they are
            used on the ward: courses, an interactive ECG lab, and an app that helps with antibiotic
            decisions in sepsis.
          </p>
          <div className="cta-row">
            <a href="#courses" className="btn">
              See the courses
            </a>
            <a href="#lab" className="btn btn-ghost">
              Try the ECG lab
            </a>
          </div>
        </motion.div>
      </div>

      <div className="hero-strip">
        <SweepCanvas
          stream={stream}
          channels={[ink]}
          speed={200}
          className="hero-canvas"
          label={`Live lead II trace showing ${label}`}
          version={rhythm}
        />
        <span className="lead-label" aria-hidden="true">
          II
        </span>
        <div className="hr-box" aria-live="off">
          <span className="hr-dot" ref={dotRef} />
          <span className="hr-num" ref={hrRef}>
            72
          </span>
          <span className="hr-unit">bpm</span>
        </div>
      </div>

      <div className="wrap rhythm-row">
        <span id="rhythm-q">Change the rhythm</span>
        <div className="seg" role="radiogroup" aria-labelledby="rhythm-q">
          {rhythms.map((r) => (
            <button
              key={r.id}
              role="radio"
              aria-checked={rhythm === r.id}
              className={rhythm === r.id ? 'on' : ''}
              onClick={() => pick(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Lab() {
  return (
    <section className="lab" id="lab">
      <div className="wrap lab-grid">
        <div className="lab-copy">
          <h2>The ECG lab</h2>
          <p className="lede">
            Most people learn ECGs from pictures. In the lab you work on the strip itself: measure
            intervals, march out P waves, and check your read against a worked answer.
          </p>
          <p>
            The calipers on the right are the real thing. Drag across the strip, or move each arm
            with the arrow keys. Start with one R–R interval, then try the PR and the QRS.
          </p>
          <a href="#join" className="text-link">
            Get early access to the full lab
          </a>
        </div>
        <Calipers />
      </div>
    </section>
  );
}

function Courses() {
  return (
    <section className="courses" id="courses">
      <div className="wrap">
        <div className="section-head">
          <h2>Courses</h2>
          <p>
            Short, practical and built around cases. Each course starts with the question you will
            actually face, then gives you what you need to answer it.
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
                <span className={`status status-${c.status.split(' ')[0].toLowerCase()}`}>
                  {c.status}
                </span>
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

function AppSection() {
  const stream = useMemo(() => new EcgStream('sinus', 21), []);
  const hrRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    stream.onBeat = (rr) => {
      if (hrRef.current) hrRef.current.textContent = String(Math.round(60 / rr));
    };
  }, [stream]);

  const channels: Channel[] = [
    { color: '#45e39a', gain: 46, baseline: 0.36, width: 1.8, glow: true, read: (s) => s.ecg() },
    { color: '#5ad1f5', gain: 52, baseline: 0.9, width: 1.8, glow: true, read: (s) => s.pleth() },
  ];

  return (
    <section className="app" id="app">
      <div className="wrap app-grid">
        <div className="app-copy">
          <h2>The MedWise app</h2>
          <p className="lede">
            A decision-support tool for antibiotic stewardship in septic ICU patients. Enter the
            source, risk factors, labs and cultures; MedWise returns an empiric plan, a
            de-escalation path and the guideline reasoning behind each step.
          </p>
          <ul className="app-points">
            <li>Aligned with the Surviving Sepsis Campaign and IDSA guidance</li>
            <li>Adjusts for MDR risk, renal function and culture results</li>
            <li>Every suggestion shows its reasoning, so you can disagree with it</li>
          </ul>
          <div className="cta-row">
            <a href={brand.appUrl} className="btn btn-light">
              Open the app
            </a>
            <a href="#join" className="btn btn-ghost-light">
              Request access
            </a>
          </div>
        </div>

        <div className="monitor" aria-label="Example bedside monitor and MedWise suggestion">
          <div className="monitor-screen">
            <SweepCanvas
              stream={stream}
              channels={channels}
              speed={150}
              className="monitor-canvas"
              label="Animated monitor showing an ECG and a pulse oximetry waveform"
            />
            <div className="numerics">
              <div className="num num-hr">
                <span>HR</span>
                <strong ref={hrRef}>72</strong>
              </div>
              <div className="num num-spo2">
                <span>SpO₂</span>
                <strong>94</strong>
              </div>
              <div className="num num-map">
                <span>MAP</span>
                <strong>66</strong>
              </div>
            </div>
          </div>
          <motion.div
            className="suggestion"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: [0.2, 0.7, 0.1, 1] }}
          >
            <p className="sugg-case">Example case: ICU day 3, community-acquired pneumonia</p>
            <p className="sugg-body">
              Cultures grew <em>Streptococcus pneumoniae</em>, susceptible to ceftriaxone, and
              procalcitonin is falling. Consider de-escalating from piperacillin-tazobactam to
              ceftriaxone and planning a 5 to 7 day total course.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function About() {
  const initials = brand.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
  return (
    <section className="about ecg-paper" id="about">
      <div className="wrap about-grid">
        <div className="portrait">
          {brand.photo ? (
            <img src={brand.photo} alt={`Portrait of ${brand.name}`} />
          ) : (
            <span aria-hidden="true">{initials}</span>
          )}
        </div>
        <div className="about-copy">
          <h2>{brand.name}</h2>
          <p className="role">{brand.role}</p>
          <p>
            I started MedWise because the gap between what textbooks teach and what you need on a
            night shift is enormous. ECGs feel impossible until someone shows you how to read them
            in order. Antibiotic choices feel arbitrary until you can see the reasoning.
          </p>
          <p>
            Everything here is made to close that gap: teaching built on real cases, and tools you
            can use with a patient in front of you.
          </p>
        </div>
      </div>
    </section>
  );
}

type Status = 'idle' | 'sending' | 'done' | 'error';

function Join() {
  const [email, setEmail] = useState('');
  const [picked, setPicked] = useState<string[]>(['courses']);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

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
          <h2>Be first in when things open</h2>
          <p>
            One email when a course opens or the ECG lab goes live, plus short weekly notes on ECGs
            and ICU medicine. Unsubscribe whenever you like.
          </p>
        </div>
        {status === 'done' ? (
          <div className="join-done" role="status">
            <p className="join-done-title">You're on the list.</p>
            <p>I'll write to {email} when there's something to open.</p>
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
                    <input
                      type="checkbox"
                      checked={picked.includes(i.id)}
                      onChange={() => toggle(i.id)}
                    />
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
        <a href="#top" className="brand">
          <Mark size={24} />
          <span>MedWise</span>
        </a>
        <p className="disclaimer">
          MedWise is an educational and decision-support resource. It does not replace clinical
          judgement or local guidelines.
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
    document.title = 'MedWise | ECG courses, ECG lab and ICU tools';
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
          <Lab />
          <Courses />
          <AppSection />
          <About />
          <Join />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
