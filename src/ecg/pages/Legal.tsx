import * as React from 'react';
import { BUSINESS as B } from '../data/business';

const owner = B.legalName || B.brand;
const contactLine = [B.email && `email ${B.email}`, B.phone && `phone ${B.phone}`].filter(Boolean).join(' or ');
const reach = contactLine ? `Contact us by ${contactLine}.` : 'Contact us through the details on the Contact page.';

type Doc = { title: string; body: [string, string[]][] };
const DOCS: Record<string, Doc> = {
  terms: { title: 'Terms of use', body: [
    ['The service', [`${B.brand} is an online course that teaches electrocardiogram (ECG) interpretation to medical students, interns, residents and other health professionals. It is run by ${owner}.`]],
    ['Education only', ['The content is for education and exam preparation. It is not medical advice and must not be used to diagnose or treat a patient. Always follow your hospital\'s protocols and senior advice in clinical care.',
      'Interactive tracings are teaching models. Real ECGs come from open research datasets and have been reviewed for teaching; measurements may differ from your own.']],
    ['Your account', ['You need a verified email or Google account to save progress across devices and to buy a plan. Keep your sign-in private; one account is for one person.']],
    ['Plans and payment', [`Paid plans (Student, Pro) give access for the period bought (one month or one year) from the date of payment. They do not renew automatically; you choose whether to buy again. Prices are in Indian rupees and include applicable taxes. Payments are processed by Razorpay.`,
      'We may add, change or improve content and features. If we remove a paid feature during your paid period, we will offer a pro-rata refund on request.']],
    ['Acceptable use', ['Do not copy, resell or redistribute the course content or questions, share your account, or try to break or overload the service.']],
    ['Content licences', ['Real ECGs are from PTB-XL and the Chapman–Shaoxing 12-lead ECG database, used under the Creative Commons Attribution 4.0 licence, with measurements from PTB-XL+ (CC BY 4.0), via PhysioNet. The rest of the course, including the text, questions and heart model, belongs to the service owner.']],
    ['Liability', ['The service is provided as is. To the extent the law allows, we are not liable for any loss arising from clinical decisions made using the content, or for interruptions to the service. Our total liability is limited to the amount you paid in the last 12 months.']],
    ['Changes and law', [`We may update these terms and will show the date of the latest version here. These terms are governed by the laws of ${B.jurisdiction}. ${reach}`]],
  ] },
  privacy: { title: 'Privacy policy', body: [
    ['What we collect', ['Account: your name and email address (or Google profile name and email) when you sign in.',
      'Learning data: placement result, units completed, quiz scores, ECGs read, answers and review schedule.',
      'Payments: plan, amount, date and Razorpay order and payment references. Card, UPI and bank details are handled by Razorpay; we never see or store them.']],
    ['Why', ['To run your account and save progress, to show your skills and schedule reviews, to give access to the plan you bought, and to improve the course using totals across learners.']],
    ['Where it is stored', ['Account and learning data are stored in Google Firebase (Authentication and Cloud Firestore). Before you sign in, progress is kept only in your browser\'s storage on your device.']],
    ['Sharing', ['We do not sell your data. We share it only with the services that run the product (Google Firebase, Razorpay, our hosting provider) and when the law requires it.']],
    ['Your choices', [`You can ask to see, correct or delete your account and learning data at any time. ${reach} Deleting the account removes your progress; payment records are kept as tax law requires.`]],
    ['Children', ['The service is for adults in medical education and is not directed at children under 18.']],
    ['Updates', ['We will post any change to this policy here with the date it took effect.']],
  ] },
  refunds: { title: 'Refunds and cancellation', body: [
    ['Refunds', [`If you are not satisfied, ask for a full refund within ${B.refundDays} days of your first purchase of a plan. We refund to the original payment method through Razorpay, usually within 5–7 working days.`,
      'Renewals and later purchases of the same plan are not refundable, except where a paid feature is withdrawn during the paid period.']],
    ['Cancellation', ['Plans do not renew automatically, so there is nothing to cancel: your access simply ends at the end of the period you paid for. You keep your progress and can continue on the free plan.']],
    ['How to ask', [reach + ' Include the email you signed in with and the payment date.']],
  ] },
  delivery: { title: 'Delivery of service', body: [
    ['Digital delivery', ['MedWise ECG is an online service. Nothing is shipped. Access to a paid plan starts as soon as the payment is confirmed, normally within a minute, on the account you were signed in with.',
      'If access has not started within 30 minutes of a successful payment, ' + reach.charAt(0).toLowerCase() + reach.slice(1)]],
  ] },
};

export default function Legal({ doc }: { doc: string }) {
  if (doc === 'contact') return (
    <article className="max-w-prose flex flex-col gap-4">
      <h1 className="text-3xl font-serif font-bold">Contact</h1>
      <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
        <dt className="font-semibold">Service</dt><dd>{B.brand}</dd>
        {B.legalName && <><dt className="font-semibold">Operated by</dt><dd>{B.legalName}</dd></>}
        {B.email && <><dt className="font-semibold">Email</dt><dd className="select-all">{B.email}</dd></>}
        {B.phone && <><dt className="font-semibold">Phone</dt><dd className="select-all">{B.phone}</dd></>}
        {B.address && <><dt className="font-semibold">Address</dt><dd>{B.address}</dd></>}
      </dl>
      <p className="text-sm text-slate-600">For help with your account, a payment or a refund, write from the email you signed in with. We reply within two working days.</p>
    </article>
  );
  const d = DOCS[doc] || DOCS.terms;
  return (
    <article className="max-w-prose flex flex-col gap-5">
      <div><h1 className="text-3xl font-serif font-bold">{d.title}</h1><p className="text-xs text-slate-500 mt-1">Last updated {B.updated}</p></div>
      {d.body.map(([h, ps]) => <section key={h} className="flex flex-col gap-2"><h2 className="text-lg font-serif font-bold">{h}</h2>{ps.map((t, i) => <p key={i} className="text-sm leading-relaxed">{t}</p>)}</section>)}
    </article>
  );
}

export const LEGAL_LINKS: [string, string][] = [['terms', 'Terms'], ['privacy', 'Privacy'], ['refunds', 'Refunds'], ['delivery', 'Delivery'], ['contact', 'Contact']];
