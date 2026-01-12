
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-navy">
      {/* High-End Background Image with Adjusted Filters for Clarity */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('https://i.ibb.co/dw5Wh8HD/hunyuan-image-3-0-a-Replace-the-current.png')`,
          filter: 'brightness(0.55) contrast(1.1) saturate(1.1)'
        }}
      >
        {/* Adjusted Overlay for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/30 to-navy/90"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-2.5 mb-10 rounded-full border-2 border-orange-500/40 bg-orange-500/20 text-orange-400 text-sm font-black tracking-[0.2em] uppercase backdrop-blur-md shadow-2xl">
          <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></span>
          GTA Service Dispatch Pilot v2.5
        </div>
        {/* Smaller font size as requested */}
        <h1 className="text-5xl lg:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          The Future of <br />
          <span className="text-orange-500 underline decoration-orange-500/30">After-Hours Dispatching.</span>
        </h1>
        <p className="text-lg md:text-2xl text-slate-100 max-w-4xl mx-auto mb-14 font-bold leading-relaxed drop-shadow-[0_5px_15px_rgba(0,0,0,0.6)]">
          The first AI safety-compliance lab for GTA HVAC operators. 
          Scaling <span className="text-orange-400 font-extrabold">Emergency Response</span> and <span className="text-orange-400 font-extrabold">Rebate Revenue</span> across Ontario.
        </p>
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
          <a 
            href="#demo"
            className="w-full sm:w-auto px-14 py-7 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl font-black transition-all shadow-[0_20px_40px_-10px_rgba(249,115,22,0.6)] hover:shadow-[0_25px_50px_-10px_rgba(249,115,22,0.7)] uppercase tracking-widest text-2xl border-b-8 border-orange-700 active:translate-y-1 active:border-b-4"
          >
            Launch Dispatch Agent
          </a>
          <a 
            href="#overview"
            className="w-full sm:w-auto px-14 py-7 bg-white text-navy hover:bg-slate-100 rounded-2xl font-black transition-all uppercase tracking-widest text-2xl shadow-2xl border-b-8 border-slate-300 active:translate-y-1 active:border-b-4"
          >
            Pilot Details
          </a>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-12 w-full px-6 hidden lg:block z-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-4 gap-12 bg-navy/80 backdrop-blur-2xl p-12 rounded-[3rem] border-2 border-white/20 max-w-6xl mx-auto shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
            <div className="text-left border-l-2 border-orange-500/50 pl-8 first:border-0 first:pl-0">
              <div className="text-5xl font-black text-white">4H</div>
              <div className="text-slate-300 text-sm font-black uppercase tracking-[0.2em] mt-2">Ontario-Wide SLA</div>
            </div>
            <div className="text-left border-l-2 border-orange-500/50 pl-8">
              <div className="text-5xl font-black text-white">$7.5K</div>
              <div className="text-slate-300 text-sm font-black uppercase tracking-[0.2em] mt-2">Max Rebate Yield</div>
            </div>
            <div className="text-left border-l-2 border-orange-500/50 pl-8">
              <div className="text-5xl font-black text-white">100%</div>
              <div className="text-slate-300 text-sm font-black uppercase tracking-[0.2em] mt-2">TSSA Compliant</div>
            </div>
            <div className="text-left border-l-2 border-orange-500/50 pl-8">
              <div className="text-5xl font-black text-white">24/7</div>
              <div className="text-slate-300 text-sm font-black uppercase tracking-[0.2em] mt-2">Always Active</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
