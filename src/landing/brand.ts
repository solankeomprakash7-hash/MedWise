// Everything a visitor reads about you lives here, so you can edit copy
// without touching layout code.

export const brand = {
  name: 'Omprakash Solanke',
  firstName: 'Omprakash',
  role: 'Doctor, educator and founder of MedWise',
  // Drop your logo into /public (e.g. /public/logo.png or /public/logo.svg)
  // and set the path here. Leave empty to show the temporary monogram.
  logo: '',
  // Put a portrait in /public and set the path. Empty shows initials.
  photo: '',
  appUrl: '/app',
  socials: [
    { label: 'Instagram', href: '' },
    { label: 'YouTube', href: '' },
    { label: 'LinkedIn', href: '' },
    { label: 'X', href: '' },
  ],
  contactEmail: '',
};

export type ModuleId = 'ecg' | 'abx' | 'htn' | 'dm' | 'preop';
export type ModuleStatus = 'Live' | 'In development' | 'Coming soon';

export interface ModuleInfo {
  id: ModuleId;
  name: string;
  short: string;
  status: ModuleStatus;
  summary: string;
  basis: string;
  href: string;
}

export const modules: ModuleInfo[] = [
  {
    id: 'abx',
    name: 'Antibiotic stewardship',
    short: 'Antibiotics',
    status: 'Live',
    summary:
      'Empiric choices for septic ICU patients by source and risk, then a de-escalation plan once cultures return.',
    basis: 'Surviving Sepsis Campaign and IDSA guidance',
    href: '/app',
  },
  {
    id: 'ecg',
    name: 'ECG lab',
    short: 'ECG',
    status: 'In development',
    summary:
      'Read rhythm strips step by step: rate, rhythm, axis, intervals and ischaemia, with a worked answer for every tracing.',
    basis: 'a structured 12-lead approach',
    href: '#join',
  },
  {
    id: 'htn',
    name: 'Hypertension',
    short: 'Hypertension',
    status: 'Coming soon',
    summary:
      'Classify blood pressure, work out cardiovascular risk and choose first-line therapy for the patient in front of you.',
    basis: 'the ACC/AHA 2017 classification',
    href: '#join',
  },
  {
    id: 'dm',
    name: 'Diabetes management',
    short: 'Diabetes',
    status: 'Coming soon',
    summary:
      'Interpret HbA1c and glucose, set individual targets, and step therapy up or down with comorbidities in mind.',
    basis: 'the ADA Standards of Care',
    href: '#join',
  },
  {
    id: 'preop',
    name: 'Pre-operative evaluation',
    short: 'Pre-op',
    status: 'Coming soon',
    summary:
      'A pre-anaesthetic work-up for patients posted for surgery: cardiac risk, investigations, and which medicines to hold or continue.',
    basis: 'the RCRI and ASA physical status',
    href: '#join',
  },
];

export interface Course {
  id: string;
  title: string;
  summary: string;
  audience: string;
  format: string;
  status: 'Enrolling soon' | 'In production' | 'Waitlist open';
}

// Placeholder line-up. Swap in your real courses.
export const courses: Course[] = [
  {
    id: 'ecg-properly',
    title: 'ECG, properly',
    summary:
      'From rate and axis to blocks, ischaemia and arrhythmias, taught on real tracings and drilled on practice strips.',
    audience: 'Final-year students, interns, residents',
    format: 'Self-paced video + practice strips',
    status: 'Enrolling soon',
  },
  {
    id: 'icu-antibiotics',
    title: 'Antibiotics in the ICU',
    summary:
      'Sepsis bundles, empiric choices by source, reading cultures and de-escalating with confidence.',
    audience: 'Residents, ICU and emergency teams',
    format: 'Case-based modules',
    status: 'In production',
  },
  {
    id: 'periop',
    title: 'Fit for surgery?',
    summary:
      'The pre-operative assessment from history to sign-off: risk scores, which tests matter and peri-operative medicines.',
    audience: 'Interns, anaesthesia and medicine residents',
    format: 'Case-based modules',
    status: 'Waitlist open',
  },
];

export const interests = [
  { id: 'platform', label: 'Early access to MedWise' },
  { id: 'courses', label: 'Courses' },
  { id: 'notes', label: 'Weekly clinical notes' },
] as const;
