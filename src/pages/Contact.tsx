import { useState } from 'react';
import { useApp } from '../context';

export default function Contact() {
  const { addToast } = useApp();
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    addToast('Message sent! We will get back to you shortly.', 'success');
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white border-b border-black/[0.06]">
        <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#0D9A55]/12 to-transparent blur-3xl -top-24 -right-24 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-xs font-semibold text-[#0D9A55] uppercase tracking-widest mb-3">Get In Touch</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1C1C1E] leading-tight mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Contact Us
          </h1>
          <p className="text-lg text-[#6B7280] max-w-xl">
            Have a question, want to register, or need help with an order? Reach out and we will get back to you the same day.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact details */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-6">
              <h2 className="font-extrabold text-[#1C1C1E] text-lg mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>Contact Details</h2>
              <div className="space-y-4">
                {[
                  {
                    icon: <svg className="w-5 h-5 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
                    label: 'Address',
                    value: 'Singh Medical Complex, Station Road,\nPadrauna, Kushinagar, UP — 274304',
                  },
                  {
                    icon: <svg className="w-5 h-5 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>,
                    label: 'Phone',
                    value: '+91 98765 43210',
                  },
                  {
                    icon: <svg className="w-5 h-5 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
                    label: 'Email',
                    value: 'orders@singhmedical.in',
                  },
                  {
                    icon: <svg className="w-5 h-5 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                    label: 'Business Hours',
                    value: 'Mon–Sat: 9:00 AM – 7:00 PM\nSunday: 10:00 AM – 2:00 PM',
                  },
                ].map(item => (
                  <div key={item.label} className="flex gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E8F5EE] flex items-center justify-center shrink-0">{item.icon}</div>
                    <div>
                      <p className="text-xs font-semibold text-[#9CA3AF] mb-0.5">{item.label}</p>
                      <p className="text-sm text-[#1C1C1E] whitespace-pre-line">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="https://wa.me/919876543210?text=Hi%20Singh%20Medical%20Stores%2C%20I%20have%20a%20query."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2.5 w-full py-3 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1da851] transition-colors text-sm shadow-[0_4px_12px_rgba(37,211,102,0.3)]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            {/* Map placeholder */}
            <div className="bg-[#E8F5EE] rounded-2xl overflow-hidden h-48 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-10 h-10 text-[#0D9A55] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
                <p className="text-sm font-medium text-[#0D9A55]">Padrauna, Kushinagar UP</p>
                <p className="text-xs text-[#6B7280] mt-0.5">Map integration coming soon</p>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-6">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in-up">
                <div className="w-16 h-16 rounded-full bg-[#E8F5EE] flex items-center justify-center mb-4">
                  <svg className="w-9 h-9 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-extrabold text-[#1C1C1E] mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Message Sent!
                </h3>
                <p className="text-[#6B7280] text-sm mb-6 max-w-xs">
                  Thank you for reaching out. Our team will get back to you within a few hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', message: '' }); }}
                  className="px-5 py-2.5 border-2 border-[#0D9A55] text-[#0D9A55] rounded-xl font-semibold text-sm hover:bg-[#E8F5EE] transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-extrabold text-[#1C1C1E] text-lg mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>Send a Message</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1C1C1E] mb-1.5">Your Name <span className="text-red-400">*</span></label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Rajesh Kumar"
                      className="w-full px-4 py-3 bg-[#F5F7F5] border border-black/[0.08] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all placeholder:text-[#9CA3AF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1C1C1E] mb-1.5">Phone Number <span className="text-red-400">*</span></label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 bg-[#F5F7F5] border border-black/[0.08] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all placeholder:text-[#9CA3AF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1C1C1E] mb-1.5">Message <span className="text-red-400">*</span></label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="I would like to register my pharmacy and start ordering..."
                      className="w-full px-4 py-3 bg-[#F5F7F5] border border-black/[0.08] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all placeholder:text-[#9CA3AF] resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="py-3.5 bg-[#0D9A55] text-white font-bold rounded-xl hover:bg-[#0A7A43] transition-all shadow-[0_4px_16px_rgba(13,154,85,0.3)] text-sm"
                  >
                    Send Message →
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
