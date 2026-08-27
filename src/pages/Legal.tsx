import { useApp } from '../context';
import type { Page } from '../types';

const TERMS_SECTIONS = [
  {
    title: 'Eligibility & Registration',
    body: 'Access to wholesale pricing and the ability to place orders on Singh Medical Stores is restricted to registered retail pharmacy licence holders in India. By registering, you confirm that you hold a valid retail drug licence (Form 20B/21B) and are legally authorised to purchase and dispense pharmaceutical products.',
  },
  {
    title: 'Ordering & Pricing',
    body: 'All prices listed are exclusive of GST and are subject to change without prior notice. The final invoice price may differ from the catalogue price displayed at the time of browsing due to stock revisions. Orders are confirmed only after explicit confirmation from our team via the platform or WhatsApp.',
  },
  {
    title: 'Delivery & Risk of Loss',
    body: 'Delivery timelines are indicative and not guaranteed. Singh Medical Stores shall not be liable for delays caused by logistics partners, natural events, or circumstances beyond our reasonable control. Risk of loss transfers to the buyer upon handover to the delivery partner.',
  },
  {
    title: 'Returns & Refunds',
    body: 'Returns are accepted for damaged, expired, or incorrectly supplied products reported within 48 hours of delivery, accompanied by photographic evidence. Opened or partially used products are not eligible for return. Refunds are processed within 5–7 working days after verification.',
  },
  {
    title: 'Intellectual Property',
    body: 'All content on this platform, including product data, pricing, images, and trademarks, is the property of Singh Medical Stores or its licensors. Unauthorised copying, redistribution, or commercial use of any content is prohibited.',
  },
  {
    title: 'Governing Law',
    body: 'These terms are governed by the laws of India and the state of Uttar Pradesh. Any disputes arising shall be subject to the exclusive jurisdiction of courts in Kushinagar District, Uttar Pradesh.',
  },
];

const PRIVACY_SECTIONS = [
  {
    title: 'Information We Collect',
    body: 'We collect information you provide during registration (pharmacy name, drug licence number, phone number, address) and information generated through your use of the platform (order history, browsing data, communication records). We do not collect payment card data; all payments are handled through secure third-party processors.',
  },
  {
    title: 'How We Use Your Information',
    body: 'Your information is used to process and deliver your orders, verify your drug licence, send order updates via SMS/WhatsApp, improve our platform, and comply with applicable legal and regulatory requirements. We do not sell your personal data to third parties.',
  },
  {
    title: 'Data Sharing',
    body: 'We share your delivery address and contact details with our logistics partners solely for the purpose of delivering your orders. We may share anonymised, aggregated data with business analytics providers. We disclose personal information to law enforcement or regulatory authorities when required by law.',
  },
  {
    title: 'Data Retention',
    body: 'Account and order data is retained for a minimum of 7 years to comply with pharmaceutical distribution regulations and GST record-keeping requirements. You may request deletion of non-regulatory data by contacting our support team.',
  },
  {
    title: 'Your Rights',
    body: 'You have the right to access, correct, or delete your personal data, subject to regulatory retention requirements. To exercise these rights, contact us at privacy@singhmedical.in or via WhatsApp. We will respond within 10 working days.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this privacy policy periodically. Material changes will be communicated via a notice on the platform or by SMS/WhatsApp. Continued use of the platform after such notice constitutes acceptance of the updated policy.',
  },
];

interface LegalProps {
  type: 'terms' | 'privacy';
}

export default function Legal({ type }: LegalProps) {
  const { navigate } = useApp();
  const isTerms = type === 'terms';

  const title = isTerms ? 'Terms & Conditions' : 'Privacy Policy';
  const sections = isTerms ? TERMS_SECTIONS : PRIVACY_SECTIONS;
  const intro = isTerms
    ? 'By accessing and using the Singh Medical Stores wholesale ordering platform, you agree to be bound by these terms and conditions. Please read them carefully before placing any order.'
    : 'This policy describes how Singh Medical Stores collects, uses, and protects the personal information of registered retail pharmacy users and visitors of this platform.';

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-white border-b border-black/[0.06]">
        <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#0D9A55]/10 to-transparent blur-3xl -top-20 -right-20 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => navigate('home')}
              className="text-xs text-[#9CA3AF] hover:text-[#0D9A55] transition-colors"
            >Home</button>
            <span className="text-[#D1D5DB]">/</span>
            <span className="text-xs text-[#1C1C1E]">{title}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1C1E] mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>{title}</h1>
          <p className="text-sm text-[#9CA3AF]">Last updated: 1 November 2024 · Singh Medical Stores, Padrauna UP</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-[#E8F5EE] rounded-2xl p-5 mb-8">
          <p className="text-sm text-[#374151] leading-relaxed">{intro}</p>
        </div>

        <div className="space-y-6">
          {sections.map((sec, i) => (
            <div key={sec.title} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6">
              <h2 className="font-extrabold text-[#1C1C1E] mb-3 flex items-center gap-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <span className="w-7 h-7 rounded-full bg-[#E8F5EE] text-[#0D9A55] text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                {sec.title}
              </h2>
              <p className="text-sm text-[#6B7280] leading-relaxed">{sec.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#9CA3AF]">
            <p>Drug Licence: UP-19-000123 · GSTIN: 09XXXXX1234X1Z5</p>
            <p className="mt-0.5">© 2024 Singh Medical Stores, Padrauna, Kushinagar, UP — 274304</p>
          </div>
          <div className="flex gap-3 text-sm">
            <button
              onClick={() => navigate(isTerms ? 'privacy' : 'terms')}
              className="text-[#0D9A55] hover:text-[#0A7A43] font-semibold transition-colors"
            >
              {isTerms ? 'Privacy Policy' : 'Terms & Conditions'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TermsPage() { return <Legal type="terms" />; }
export function PrivacyPage() { return <Legal type="privacy" />; }
