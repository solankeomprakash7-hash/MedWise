// Everything a visitor reads about you lives here, so you can edit copy
// without touching layout code.

export const brand = {
  name: 'Omprakash Solanke',
  firstName: 'Omprakash',
  // Shown under your name in the About section. Replace with your real
  // degree / role / institution.
  role: 'Doctor, educator and builder of MedWise',
  // Put a square photo in /public (e.g. /public/portrait.jpg) and set the path.
  // Leave empty to show a monogram instead.
  photo: '',
  appUrl: '/app',
  // Social profiles. Empty entries are hidden.
  socials: [
    { label: 'Instagram', href: '' },
    { label: 'YouTube', href: '' },
    { label: 'LinkedIn', href: '' },
    { label: 'X', href: '' },
  ],
  contactEmail: '',
};

export type CourseStatus = 'Enrolling soon' | 'In production' | 'Waitlist open';

export interface Course {
  id: string;
  title: string;
  summary: string;
  audience: string;
  format: string;
  status: CourseStatus;
}

// Placeholder line-up. Swap in your real courses, audiences and formats.
export const courses: Course[] = [
  {
    id: 'ecg-properly',
    title: 'ECG, properly',
    summary:
      'From rate and axis to blocks, ischaemia and arrhythmias. Every concept is taught on real tracings, then drilled on practice strips until it is automatic.',
    audience: 'Final-year students, interns, residents',
    format: 'Self-paced video + 300 practice strips',
    status: 'Enrolling soon',
  },
  {
    id: 'icu-antibiotics',
    title: 'Antibiotics in the ICU',
    summary:
      'Sepsis bundles, empiric choices by source, reading cultures and de-escalating with confidence. Built on the same guidelines that power the MedWise app.',
    audience: 'Residents, ICU and emergency teams',
    format: 'Case-based modules',
    status: 'In production',
  },
  {
    id: 'arrhythmia-clinic',
    title: 'Arrhythmia clinic',
    summary:
      'A small live cohort. We read difficult strips together every week, from wide-complex tachycardias to pacemaker rhythms.',
    audience: 'Anyone who has finished ECG, properly',
    format: 'Live cohort, 6 weeks',
    status: 'Waitlist open',
  },
];

export const interests = [
  { id: 'courses', label: 'Courses' },
  { id: 'ecg-lab', label: 'ECG lab' },
  { id: 'app', label: 'MedWise app' },
  { id: 'notes', label: 'Weekly notes' },
] as const;
