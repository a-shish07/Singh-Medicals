import { useApp } from '../context';

export default function NotFound() {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-24 px-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-blob absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#0D9A55]/15 to-[#12B060]/5 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative">
        <div className="text-[120px] sm:text-[160px] font-extrabold leading-none text-[#E8F5EE] select-none" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center justify-center">
            <svg className="w-10 h-10 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .3 2.7-1.1 2.7H3.9c-1.4 0-2.1-1.7-1.1-2.7L4.2 15.3" />
            </svg>
          </div>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E] mt-4 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        Page not found
      </h1>
      <p className="text-[#6B7280] max-w-sm mb-8">
        The page you are looking for does not exist or has been moved. Head back to the homepage or browse our catalogue.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => navigate('home')}
          className="px-6 py-3 bg-[#0D9A55] text-white font-bold rounded-2xl hover:bg-[#0A7A43] transition-all shadow-[0_4px_16px_rgba(13,154,85,0.3)] text-sm"
        >
          Back to Home
        </button>
        <button
          onClick={() => navigate('catalogue')}
          className="px-6 py-3 border-2 border-[#0D9A55] text-[#0D9A55] font-bold rounded-2xl hover:bg-[#E8F5EE] transition-all text-sm"
        >
          Browse Catalogue
        </button>
      </div>
    </div>
  );
}
