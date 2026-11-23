// Deterministic cross-checks for /app. The model writes the plan; these rules read the doctor's own inputs and
// flag cover the inputs call for, so the page never shows "no gaps" on the model's word alone.
// They are conservative prompts to check, not a replacement for the guideline.

export type Inputs = {
  infectionSource: string; hemodynamics: string; ventilated: string; mdrRisk: string; recentHospitalization: string;
  priorAntibiotics: string; immunocompromised: string; indwellingDevices: string; travelHistory: string;
};

/** For each pathogen category the inputs point to, the reasons (input names) that point to it. */
export function expectedNeeds(f: Inputs): Record<string, string[]> {
  const yes = (v: string) => v === 'Yes';
  const n: Record<string, string[]> = {};
  const add = (k: string, why: string) => { (n[k] ||= []).push(why); };

  add('gram_positive', 'sepsis: core empiric cover');
  add('gram_negative', 'sepsis: core empiric cover');
  if (yes(f.mdrRisk)) { add('esbl', 'MDR risk: Yes'); add('pseudomonas', 'MDR risk: Yes'); add('mrsa', 'MDR risk: Yes'); }
  if (yes(f.priorAntibiotics)) { add('esbl', 'prior antibiotics: Yes'); add('pseudomonas', 'prior antibiotics: Yes'); }
  if (yes(f.recentHospitalization)) { add('esbl', 'recent hospitalisation: Yes'); add('pseudomonas', 'recent hospitalisation: Yes'); }
  if (yes(f.ventilated)) { add('pseudomonas', 'ventilated: Yes'); add('mrsa', 'ventilated: Yes'); }
  if (yes(f.immunocompromised)) add('pseudomonas', 'immunocompromised: Yes');
  if (yes(f.indwellingDevices)) add('mrsa', 'indwelling devices: Yes');
  if (yes(f.travelHistory)) { add('esbl', 'recent travel: Yes'); add('tropical_rickettsial', 'recent travel: Yes'); }
  if (/skin|bloodstream|line/i.test(f.infectionSource)) add('mrsa', `source: ${f.infectionSource}`);
  if (/intra-abdominal/i.test(f.infectionSource)) add('anaerobes', 'source: intra-abdominal');
  if (/lung/i.test(f.infectionSource)) add('atypicals', 'source: lung');
  return n;
}

/** The guidelines MedWise names, with their official publications. A citation is linked only when it matches one. */
export const KNOWN_GUIDELINES = [
  { name: 'Surviving Sepsis Campaign 2021', match: /surviving sepsis/i, url: 'https://doi.org/10.1097/CCM.0000000000005337' },
  { name: 'IDSA 2024 guidance on antimicrobial-resistant Gram-negative infections', match: /idsa/i, url: 'https://www.idsociety.org/practice-guideline/amr-guidance/' },
  { name: 'ATS/IDSA 2019 community-acquired pneumonia guideline', match: /community[- ]acquired pneumonia|\bCAP\b/i, url: 'https://doi.org/10.1164/rccm.201908-1581ST' },
];
export function knownGuideline(text: string) {
  // The pneumonia guideline is co-published by IDSA, so test it before the IDSA AMR guidance.
  const order = [KNOWN_GUIDELINES[2], KNOWN_GUIDELINES[0], KNOWN_GUIDELINES[1]];
  return order.find(g => g.match.test(text)) || null;
}
