// 12-question placement test. Questions 1–4 test Level 1 ideas, 5–8 Level 2 reading on real ECGs,
// 9–12 Level 3 recognition and action. The section scores decide the starting level.
import type { Question } from './curriculum';

export type PQ = Question & { section: 1 | 2 | 3 };
const img = (id: string) => `/ecg/real/${id}.webp`;

export const PLACEMENT: PQ[] = [
  { section: 1, q: 'At standard paper speed, one small square equals…', o: ['20 ms', '40 ms', '100 ms', '200 ms'], a: 1, why: '25 mm/s: 1 mm = 40 ms.' },
  { section: 1, q: 'Which wave represents ventricular repolarisation?', o: ['P', 'QRS', 'T', 'Q'], a: 2, why: 'The T wave is ventricular recovery.' },
  { section: 1, q: 'Normal PR interval is…', o: ['40–80 ms', '120–200 ms', '200–300 ms', 'Over 300 ms'], a: 1, why: '3 to 5 small squares.' },
  { section: 1, q: 'Which leads look at the inferior wall?', o: ['I, aVL', 'II, III, aVF', 'V1, V2', 'V5, V6'], a: 1, why: 'Their positive poles are on the left leg.' },
  { section: 2, img: img('ptbxl-12147'), q: 'What is the rhythm?', o: ['Sinus rhythm', 'Atrial fibrillation', 'Atrial flutter', 'Sinus with ectopics'], a: 1, why: 'No P waves and irregularly irregular R–R intervals.' },
  { section: 2, img: img('ptbxl-2400'), q: 'What is the heart rate, roughly?', o: ['About 40/min', 'About 57/min', 'About 90/min', 'About 120/min'], a: 1, why: 'About 5 big squares between R waves: 300 ÷ 5 ≈ 60, and 9–10 beats on the 10-second strip.' },
  { section: 2, img: img('ptbxl-11474'), q: 'What is the QRS axis?', o: ['Normal', 'Left axis deviation', 'Right axis deviation', 'Extreme axis'], a: 1, why: 'Positive in I, negative in aVF and II: beyond −30°.' },
  { section: 2, img: img('ptbxl-4051'), q: 'What conduction abnormality is shown?', o: ['Left bundle branch block', 'Right bundle branch block', 'First-degree AV block', 'None'], a: 1, why: 'Wide QRS with rSR′ in V1 and a wide S in I and V6.' },
  { section: 3, img: img('ptbxl-8620'), q: 'How are the P waves related to the QRS complexes?', o: ['Each P is followed by a QRS', 'PR lengthens then a beat drops', 'No relationship: complete heart block', 'There are no P waves'], a: 2, why: 'P waves march at their own rate; a slow escape rhythm runs separately.' },
  { section: 3, q: 'For the ECG in the previous question, the next step is…', o: ['Reassure and discharge', 'Pacing pads on and arrange pacing', 'IV verapamil', 'Repeat in a week'], a: 1, why: 'Complete heart block with a slow escape rhythm needs pacing.' },
  { section: 3, q: 'Chest pain with ST elevation in II, III and aVF and depression in aVL. First priority?', o: ['Wait for troponin', 'Reperfusion: cath lab or thrombolysis', 'Echo first', 'Stress test'], a: 1, why: 'An inferior STEMI is diagnosed on the ECG; time is muscle.' },
  { section: 3, q: 'Tall, narrow, peaked T waves and a widening QRS in a dialysis patient. First drug?', o: ['IV calcium gluconate', 'Oral potassium binder', 'IV furosemide', 'Amiodarone'], a: 0, why: 'Stabilise the membrane first, then shift and remove potassium.' },
];

export function placeLevel(answers: number[]) {
  const sec = [0, 0, 0];
  PLACEMENT.forEach((q, i) => { if (answers[i] === q.a) sec[q.section - 1]++; });
  const level = sec[0] < 3 ? 1 : sec[1] < 3 ? 2 : sec[2] < 3 ? 2 : sec[0] + sec[1] + sec[2] === 12 ? 4 : 3;
  return { level, sec, total: sec[0] + sec[1] + sec[2] };
}
