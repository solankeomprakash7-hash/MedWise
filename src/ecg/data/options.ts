// Answer options shared by the real-ECG read drill, the placement test and grading.

export type Opt = readonly [key: string, label: string];

export const RHYTHMS: Opt[] = [
  ['sinus', 'Sinus rhythm'],
  ['ectopic', 'Sinus with ectopic beats'],
  ['avb', 'Sinus with 2nd- or 3rd-degree AV block'],
  ['af', 'Atrial fibrillation'],
  ['flutter', 'Atrial flutter'],
  ['svt', 'Regular narrow tachycardia (SVT)'],
  ['junc', 'Junctional rhythm'],
  ['vent', 'Ventricular or paced rhythm'],
];

export const AXES: Opt[] = [
  ['normal', 'Normal'],
  ['left', 'Left'],
  ['right', 'Right'],
  ['extreme', 'Extreme'],
];

export const TAGS: Opt[] = [
  ['ste', 'ST elevation'],
  ['std', 'ST depression'],
  ['twi', 'T inversion'],
  ['peakT', 'Tall / peaked T'],
  ['q', 'Pathological Q'],
  ['delta', 'Delta wave'],
  ['u', 'Prominent U'],
  ['nop', 'No visible P'],
  ['highv', 'High QRS voltage'],
  ['rv1', 'Dominant R in V1'],
  ['spike', 'Pacing spikes'],
  ['none', 'No ST–T change'],
];

export const ACTS: Opt[] = [
  ['reperf', 'Reperfuse now: cath lab or thrombolysis'],
  ['shock', 'Shock or pace now'],
  ['pace', 'Pacing pads on; admit for pacing'],
  ['bedside', 'Treat now at the bedside (drug, electrolyte, vagal)'],
  ['admit', 'Call a senior; admit for urgent work-up'],
  ['routine', 'No emergency: treat the cause, routine follow-up'],
  ['repeat', 'Fix the electrodes and repeat the ECG'],
];

export const label = (list: Opt[], key?: string | null) => (list.find(o => o[0] === key) || [null, '—'])[1];

export const axisCat = (a: number) =>
  a >= -30 && a <= 90 ? 'normal' : a < -30 && a >= -90 ? 'left' : a > 90 && a <= 180 ? 'right' : 'extreme';
