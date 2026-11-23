// POST /.netlify/functions/sepsis-analyze: the AI suggestion for /app, for signed-in, verified users only.
// Needs in Netlify: GEMINI_API_KEY (Google AI Studio key) and FIREBASE_SERVICE_ACCOUNT (already used by payments).
import { json, uidFrom } from './_ecgShared';
import { analyzeSepsisTherapy, type PatientData } from './_sepsisModel';

const FIELDS = ['age', 'sex', 'weight', 'icuDay', 'diagnosis', 'infectionSource', 'ventilated', 'hemodynamics', 'mdrRisk',
  'recentHospitalization', 'priorAntibiotics', 'priorAntibioticsDetails', 'immunocompromised', 'indwellingDevices', 'travelHistory',
  'comorbidities', 'wbcTrend', 'procalcitonin', 'lactate', 'creatinine', 'cultureStatus', 'organism', 'sensitivity', 'selectedAntibiotic'] as const;

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!process.env.GEMINI_API_KEY || !process.env.FIREBASE_SERVICE_ACCOUNT) return json({ error: 'The analysis service is not configured yet.' }, 501);
  const uid = await uidFrom(req); if (!uid) return json({ error: 'Sign in again to get a suggestion.' }, 401);
  const raw = await req.json().catch(() => null);
  if (!raw || typeof raw !== 'object') return json({ error: 'Send the patient details as JSON.' }, 400);
  // Only known fields, as short strings: nothing else reaches the prompt.
  const data = Object.fromEntries(FIELDS.map(k => [k, String((raw as Record<string, unknown>)[k] ?? '').slice(0, 500)])) as unknown as PatientData;
  try {
    return json(await analyzeSepsisTherapy(data));
  } catch (e) {
    console.error('sepsis-analyze failed', e);
    return json({ error: 'The model did not return a suggestion. Try again.' }, 502);
  }
};
