// The full module format. Each lab module can carry one of these; the module page then becomes a
// step-by-step lesson instead of the open lab.
export type Course = {
  moduleId: string;
  /** A short bedside case that says why the topic matters. */
  story: { setting: string; text: string[]; question: string; answer: string };
  /** What to look for in the embedded lab. */
  watch: { intro: string; look: string[] };
  /** The rule, plus look-alikes side by side. */
  rule: { sections: { h: string; body: string[] }[]; compare: { title: string; cols: [string, string, string]; rows: [string, string, string][] } };
  /** One real ECG read aloud, step by step. */
  worked: { ecg: string; steps: { title: string; text: string }[] };
  /** Real ECGs read with a hint on request and an explanation after. */
  guided: { ecg: string; hint: string }[];
  /** Pre-test and checkpoint pools. `sinus`: real-ECG ids of this module's patterns; `other`: patterns used as look-alikes. */
  pools: { sinus: string[]; other: string[]; pre: number; check: number; checkOther: number; pass: number };
  /** The answer choices for every item in this module. The last one means "none of these patterns". */
  options: [string, string][];
};
