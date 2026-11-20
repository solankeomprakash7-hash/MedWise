// Shared helpers for the ECG payment functions. Needs these environment variables in Netlify:
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET  - from the Razorpay dashboard
//   FIREBASE_SERVICE_ACCOUNT              - the Firebase service-account JSON, as one line
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export const PRICES: Record<string, Record<string, number>> = { student: { month: 19900, year: 149900 }, pro: { month: 49900, year: 299900 } }; // paise
export const configured = () => !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.FIREBASE_SERVICE_ACCOUNT);

export function admin() {
  if (!getApps().length) initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)) });
  return { auth: getAuth(), db: getFirestore(firebaseConfig.firestoreDatabaseId) };
}
export async function uidFrom(req: Request) {
  const t = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
  if (!t) return null;
  try { const d = await admin().auth.verifyIdToken(t); return d.email_verified ? d.uid : null; } catch { return null; }
}
export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
