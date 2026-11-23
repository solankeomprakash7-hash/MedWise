// Business details shown on the policy and contact pages. Razorpay checks these pages before
// activating live payments. Fill in the empty fields; empty lines are simply not shown.
export const BUSINESS = {
  brand: 'MedWise ECG',
  legalName: 'MedWise Private Limited', // registered business name, as on the Razorpay account
  email: 'medwiseee@gmail.com', // support email learners can write to
  phone: '+91 83789 76204', // support phone (optional)
  address: 'Chhatrapati Sambhajinagar, Maharashtra, India', // registered address (Razorpay asks for it)
  jurisdiction: 'India',
  refundDays: 7,      // full refund window after the first purchase of a plan
  updated: '23 November 2026',
};
