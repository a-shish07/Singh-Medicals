import { useState } from 'react';

interface FAQItem { q: string; a: string; }
interface FAQGroup { topic: string; items: FAQItem[]; }

const FAQ_DATA: FAQGroup[] = [
  {
    topic: 'Ordering',
    items: [
      { q: 'Do I need to register to place an order?', a: 'Yes. A one-time registration with your valid drug licence number is required before placing your first order. Registration is free and takes under 2 minutes via OTP verification.' },
      { q: 'What is the minimum order value or quantity?', a: 'There is no minimum order value for registered retailers. You can order any quantity at the listed wholesale net rate.' },
      { q: 'Can I modify or cancel my order after placing it?', a: 'Orders can be modified or cancelled within 2 hours of placement, as long as they have not moved to Packed status. Contact us on WhatsApp immediately for urgent changes.' },
      { q: 'Can I order via WhatsApp instead of the website?', a: 'Yes. Use the "Order via WhatsApp" button in your cart to send your order list directly to our WhatsApp. Our team will confirm and process it manually.' },
    ],
  },
  {
    topic: 'Pricing & Discounts',
    items: [
      { q: 'How often are net rates updated?', a: 'Net rates are revised every Monday based on current company price lists and availability. You always see the latest rates on the catalogue.' },
      { q: 'Are scheme offers like 10+1 Free applied automatically?', a: 'Yes, all active scheme offers are shown in the catalogue with a badge and are applied automatically at checkout. No coupon code is needed.' },
      { q: 'Do I get better rates for larger orders?', a: 'Yes. Regular retailers with monthly order volumes above ₹50,000 qualify for an additional trade discount. Contact our sales team to discuss your account terms.' },
      { q: 'Is GST included in the net rate shown?', a: 'No. The net rates shown are exclusive of GST. GST as applicable to each product under the pharmaceutical schedule will be shown separately at the invoice stage.' },
    ],
  },
  {
    topic: 'Delivery',
    items: [
      { q: 'How soon will my order be dispatched?', a: 'Orders confirmed before 12:00 PM are dispatched the same day from our Padrauna warehouse. Orders placed after 12 PM are dispatched the next morning.' },
      { q: 'Which areas do you deliver to?', a: 'We currently serve pharmacies in Kushinagar, Gorakhpur, Deoria, Basti, Mau, Azamgarh, and surrounding districts of Eastern Uttar Pradesh. Contact us for delivery to other areas.' },
      { q: 'What are the delivery charges?', a: 'Delivery is free for orders above ₹2,000. A nominal ₹50 freight charge applies on orders below ₹2,000 for local delivery. Outstation charges vary by distance.' },
      { q: 'How do I track my order?', a: 'Use the Order Tracking page with your Order ID and registered phone number. You can also ask for real-time updates on our WhatsApp.' },
    ],
  },
  {
    topic: 'Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept UPI (GPay, PhonePe, Paytm), NEFT/RTGS bank transfer, and cheque for established accounts. Cash payment is accepted at our Padrauna counter.' },
      { q: 'When is payment due?', a: 'For new retailers, payment is due before dispatch. For established accounts with a clean payment history, we offer Net 7 credit terms at our discretion.' },
      { q: 'Can I get a GST invoice for my orders?', a: 'Yes, a GST invoice is generated for every order and sent via WhatsApp or email. You can also download it from your order history page.' },
    ],
  },
  {
    topic: 'Account & Registration',
    items: [
      { q: 'What documents are needed to register?', a: 'You need a valid retail drug licence (Form 20B/21B), GSTIN if applicable, and a mobile number for OTP verification. Upload or WhatsApp the copies to complete KYC.' },
      { q: 'Can I have multiple delivery addresses on one account?', a: 'Yes. You can save up to 3 delivery addresses in your account and choose the appropriate one at checkout.' },
      { q: 'What if I forget my registered phone number?', a: 'Contact our support team on WhatsApp with your shop name and drug licence number. We will verify and help you update your registered number.' },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/[0.06] last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start justify-between py-4 text-left gap-4 group"
      >
        <span className="font-semibold text-[#1C1C1E] text-sm leading-snug group-hover:text-[#0D9A55] transition-colors">{q}</span>
        <svg
          className={`w-5 h-5 shrink-0 text-[#0D9A55] transition-transform duration-200 mt-0.5 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="pb-4 text-sm text-[#6B7280] leading-relaxed animate-fade-in">{a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  const [activeGroup, setActiveGroup] = useState('Ordering');

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white border-b border-black/[0.06]">
        <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#0D9A55]/12 to-transparent blur-3xl -top-24 -right-24 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-xs font-semibold text-[#0D9A55] uppercase tracking-widest mb-3">Help Centre</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1C1C1E] mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Frequently Asked<br />Questions
          </h1>
          <p className="text-lg text-[#6B7280] max-w-xl">
            Quick answers to the most common questions about ordering, pricing, delivery, and your account.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Topic sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 sticky top-24">
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-3 px-2">Topics</p>
              {FAQ_DATA.map(group => (
                <button
                  key={group.topic}
                  onClick={() => setActiveGroup(group.topic)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 flex items-center justify-between ${activeGroup === group.topic ? 'bg-[#E8F5EE] text-[#0D9A55] font-semibold' : 'text-[#6B7280] hover:bg-[#F5F7F5] hover:text-[#1C1C1E]'}`}
                >
                  {group.topic}
                  <span className="text-[10px] bg-current/10 px-1.5 py-0.5 rounded-full opacity-60">{group.items.length}</span>
                </button>
              ))}
            </div>
          </div>

          {/* FAQ content */}
          <div className="lg:col-span-3">
            {FAQ_DATA.map(group => (
              <div key={group.topic} className={activeGroup === group.topic ? '' : 'hidden'}>
                <h2 className="text-2xl font-extrabold text-[#1C1C1E] mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>{group.topic}</h2>
                <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] px-6 divide-y divide-black/[0.06]">
                  {group.items.map(item => <AccordionItem key={item.q} q={item.q} a={item.a} />)}
                </div>
              </div>
            ))}

            <div className="mt-8 bg-[#E8F5EE] rounded-2xl p-6 text-center">
              <p className="font-semibold text-[#1C1C1E] mb-1">Did not find your answer?</p>
              <p className="text-sm text-[#6B7280] mb-4">Our team is available Mon–Sat, 9 AM–7 PM on WhatsApp.</p>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D9A55] text-white font-bold rounded-xl text-sm hover:bg-[#0A7A43] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
