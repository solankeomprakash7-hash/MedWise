// Client side of /app's analysis: posts the patient details to the sepsis-analyze Netlify function,
// which calls the model with a server-held key. Nothing secret is bundled into the browser.
import { auth } from '../lib/firebase';

export interface PatientData {
  age: string;
  sex: string;
  weight: string;
  icuDay: string;
  diagnosis: string;
  infectionSource: string;
  ventilated: string;
  hemodynamics: string;
  mdrRisk: string;
  recentHospitalization: string;
  priorAntibiotics: string;
  priorAntibioticsDetails: string;
  immunocompromised: string;
  indwellingDevices: string;
  travelHistory: string;
  comorbidities: string;
  wbcTrend: string;
  procalcitonin: string;
  lactate: string;
  creatinine: string;
  cultureStatus: string;
  organism: string;
  sensitivity: string;
  selectedAntibiotic?: string;
}

export const analyzeSepsisTherapy = async (data: PatientData): Promise<any> => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('auth: Sign in again to get a suggestion.');
  const r = await fetch('/.netlify/functions/sepsis-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${r.status}: ${body.error || 'The analysis service failed.'}`);
  return body;
};
