// Business details shown on the policy and contact pages. Razorpay checks these pages before
// activating live payments. Fill in the empty fields; empty lines are simply not shown.
export const BUSINESS = {
  brand: 'MedWise ECG',
  legalName: '',      // registered business or proprietor name, as on the Razorpay account
  email: '',          // support email learners can write to
  phone: '',          // support phone (optional)
  address: '',        // registered address (Razorpay asks for it)
  jurisdiction: 'India',
  refundDays: 7,      // full refund window after the first purchase of a plan
  updated: '20 November 2026',
};
