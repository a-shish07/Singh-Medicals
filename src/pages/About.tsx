import { useApp } from '../context';

export default function About() {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white border-b border-black/[0.06]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#0D9A55]/15 to-transparent blur-3xl -top-32 -right-32" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E8F5EE] rounded-full mb-5">
              <span className="text-xs font-semibold text-[#0D9A55]">Since 1998 · Padrauna, UP</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1C1C1E] leading-tight mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Built on trust.<br /><span className="text-[#0D9A55]">Grown through service.</span>
            </h1>
            <p className="text-lg text-[#6B7280] leading-relaxed">
              Singh Medical Stores has been the wholesale pharmaceutical partner of choice for retail pharmacies across Eastern Uttar Pradesh for over 25 years.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold text-[#0D9A55] uppercase tracking-widest mb-3">Our Story</p>
            <h2 className="text-3xl font-extrabold text-[#1C1C1E] mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              A family business,<br />a community institution.
            </h2>
            <div className="space-y-4 text-[#6B7280] text-sm leading-relaxed">
              <p>
                Founded in 1998 in Padrauna, Kushinagar by Mr. Harpal Singh, Singh Medical Stores started as a small wholesale pharmaceutical outlet serving local pharmacies with a handful of essential medicines. Over the decades, through honest dealings and reliable supply, we grew to become the most trusted distributor in the region.
              </p>
              <p>
                Today, we supply over 500 pharmaceutical products from more than 50 leading brands to 200+ registered retail pharmacy outlets across Kushinagar, Gorakhpur, Deoria, Basti, Mau, and Azamgarh districts. Every product we supply is sourced from authorised C&F agents, guaranteeing genuine stock at every transaction.
              </p>
              <p>
                We continue to operate with the same values Mr. Singh instilled from the start: fair pricing, reliable supply, and a relationship-first approach. For us, your pharmacy is not just an account number — it is a partnership.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#E8F5EE] to-[#F5F7F5] rounded-3xl p-8">
            <div className="grid grid-cols-2 gap-6">
              {[
                { num: '1998', label: 'Year Founded' },
                { num: '500+', label: 'Products Listed' },
                { num: '200+', label: 'Partner Pharmacies' },
                { num: '25+', label: 'Years of Service' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
                  <p className="text-3xl font-extrabold text-[#0D9A55] mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.num}</p>
                  <p className="text-xs text-[#6B7280] font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="bg-white border-y border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#0D9A55] uppercase tracking-widest mb-2">What We Stand For</p>
            <h2 className="text-3xl font-extrabold text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Our Mission & Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                icon: '🔬',
                title: 'Quality Assurance',
                desc: 'Every product is sourced exclusively from authorised C&F agents of original manufacturers. We maintain a strict no-parallel-import policy.',
              },
              {
                icon: '🚚',
                title: 'Reliable Supply',
                desc: 'We maintain buffer stock on all fast-moving products. Your orders are not subject to supply disruptions caused by downstream chain gaps.',
              },
              {
                icon: '₹',
                title: 'Fair Pricing',
                desc: 'Net rates are revised every week based on current market. We do not inflate margins — you get the best wholesale price available in the region.',
              },
              {
                icon: '🤝',
                title: 'Strong Relationships',
                desc: 'We believe in long-term partnerships. Loyal retailers get priority dispatch, advance notice of scheme offers, and dedicated support.',
              },
            ].map(v => (
              <div key={v.title} className="flex gap-5 p-5 bg-[#F5F7F5] rounded-2xl hover:bg-[#E8F5EE] transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center text-xl shrink-0">
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[#1C1C1E] text-sm mb-1.5">{v.title}</h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[#0D9A55]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-64 h-64 rounded-full bg-white/5 blur-3xl -top-16 -right-16" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Become a partner retailer
          </h2>
          <p className="text-white/80 mb-7 max-w-lg mx-auto text-sm">
            Register your pharmacy and get instant access to 500+ products at wholesale net rates, with same-day dispatch.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate('login')} className="px-7 py-3.5 bg-white text-[#0D9A55] font-bold rounded-2xl hover:bg-[#F5F7F5] transition-all text-sm shadow-lg">
              Get Started →
            </button>
            <button onClick={() => navigate('contact')} className="px-7 py-3.5 border-2 border-white/50 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-sm">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
