
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-navy">
      {/* Updated High-End Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('https://i.ibb.co/dw5Wh8HD/hunyuan-image-3-0-a-Replace-the-current.png')`,
          filter: 'brightness(0.35) contrast(1.15)'
        }}
      >
        {/* Navy Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/95 via-navy/50 to-navy"></div>
      </div>

      {/* Cityscape Silhouette Background */}
      <div className="absolute bottom-0 left-0 w-full opacity-10 z-1 pointer-events-none">
        <svg viewBox="0 0 1200 300" className="w-full h-auto fill-white">
          <path d="M0,300 L1200,300 L1200,200 L1150,200 L1150,250 L1100,250 L1100,100 L1050,100 L1050,250 L1000,250 L1000,150 L950,150 L950,250 L900,250 L900,50 L850,50 L850,250 L800,250 L800,0 L750,0 L750,250 L700,250 L700,180 L650,180 L650,250 L600,250 L600,120 L550,120 L550,250 L500,250 L500,80 L450,80 L450,250 L400,250 L400,200 L350,200 L350,250 L300,250 L300,30 L250,30 L250,250 L200,250 L200,150 L150,150 L150,250 L100,250 L100,100 L50,100 L50,250 L0,250 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 mb-10 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-400 text-xs font-black tracking-[0.2em] uppercase backdrop-blur-sm shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
          GTA Service Dispatch Pilot v2.5
        </div>
        <h1 className="text-6xl md:text-9xl font-black text-white mb-8 leading-[0.9] tracking-tighter drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
          The Future of <br />
          <span className="text-orange-500">After-Hours Dispatch.</span>
        </h1>
        <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto mb-14 font-semibold leading-relaxed drop-shadow-lg">
          The first AI safety-compliance lab for GTA HVAC operators. 
          Scaling <span className="text-orange-400 font-extrabold">Emergency Response</span> and <span className="text-orange-400 font-extrabold">Rebate Revenue</span> across Ontario.
        </p>
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
          <a 
            href="#demo"
            className="w-full sm:w-auto px-12 py-6 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black transition-all shadow-[0_15px_30px_-5px_rgba(249,115,22,0.4)] hover:shadow-[0_20px_40px_-5px_rgba(249,115,22,0.5)] uppercase tracking-wide text-xl ring-2 ring-orange-400/20"
          >
            Launch Dispatch Agent
          </a>
          <a 
            href="#overview"
            className="w-full sm:w-auto px-12 py-6 bg-white/10 border-2 border-white/40 text-white hover:bg-white/20 rounded-2xl font-black transition-all uppercase tracking-wide text-xl backdrop-blur-lg hover:border-white shadow-xl"
          >
            Pilot Details
          </a>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-12 w-full px-6 hidden lg:block z-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-4 gap-12 bg-navy/60 backdrop-blur-2xl p-12 rounded-[2.5rem] border border-white/20 max-w-6xl mx-auto shadow-2xl">
            <div className="text-left border-l border-white/20 pl-8 first:border-0 first:pl-0">
              <div className="text-4xl font-black text-white">4H</div>
              <div className="text-slate-300 text-sm font-black uppercase tracking-widest mt-2">Ontario-Wide SLA</div>
            </div>
            <div className="text-left border-l border-white/20 pl-8">
              <div className="text-4xl font-black text-white">$7.5K</div>
              <div className="text-slate-300 text-sm font-black uppercase tracking-widest mt-2">Max Rebate Yield</div>
            </div>
            <div className="text-left border-l border-white/20 pl-8">
              <div className="text-4xl font-black text-white">100%</div>
              <div className="text-slate-300 text-sm font-black uppercase tracking-widest mt-2">TSSA Compliant</div>
            </div>
            <div className="text-left border-l border-white/20 pl-8">
              <div className="text-4xl font-black text-white">24/7</div>
              <div className="text-slate-300 text-sm font-black uppercase tracking-widest mt-2">Always Active</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
