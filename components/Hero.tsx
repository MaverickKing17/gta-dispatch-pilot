
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-navy">
      {/* Cityscape Silhouette Background */}
      <div className="absolute bottom-0 left-0 w-full opacity-10 pointer-events-none">
        <svg viewBox="0 0 1200 300" className="w-full h-auto fill-white">
          <path d="M0,300 L1200,300 L1200,200 L1150,200 L1150,250 L1100,250 L1100,100 L1050,100 L1050,250 L1000,250 L1000,150 L950,150 L950,250 L900,250 L900,50 L850,50 L850,250 L800,250 L800,0 L750,0 L750,250 L700,250 L700,180 L650,180 L650,250 L600,250 L600,120 L550,120 L550,250 L500,250 L500,80 L450,80 L450,250 L400,250 L400,200 L350,200 L350,250 L300,250 L300,30 L250,30 L250,250 L200,250 L200,150 L150,150 L150,250 L100,250 L100,100 L50,100 L50,250 L0,250 Z" />
        </svg>
      </div>

      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[160px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-[10px] font-black tracking-[0.2em] uppercase">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
          GTA Service Dispatch Pilot v2.5
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-[0.95] tracking-tighter">
          The Future of <br />
          <span className="text-orange-500">After-Hours Dispatch.</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
          The first AI safety-compliance lab for GTA HVAC operators. 
          Scaling <span className="text-white font-medium">Emergency Response</span> and <span className="text-white font-medium">Rebate Revenue</span> across Ontario.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button 
            onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black transition-all shadow-2xl shadow-orange-500/20 uppercase tracking-tight text-lg"
          >
            Launch Dispatch Agent
          </button>
          <button 
            onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl font-black transition-all uppercase tracking-tight text-lg backdrop-blur-sm"
          >
            Pilot Details
          </button>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-12 w-full px-6 hidden md:block">
        <div className="container mx-auto">
          <div className="grid grid-cols-4 gap-12 bg-white/5 backdrop-blur-xl p-10 rounded-[2rem] border border-white/10 max-w-5xl mx-auto">
            <div className="text-left border-l border-white/10 pl-6 first:border-0 first:pl-0">
              <div className="text-3xl font-black text-white">4H</div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Ontario-Wide SLA</div>
            </div>
            <div className="text-left border-l border-white/10 pl-6">
              <div className="text-3xl font-black text-white">$7.5K</div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Max Rebate Yield</div>
            </div>
            <div className="text-left border-l border-white/10 pl-6">
              <div className="text-3xl font-black text-white">100%</div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">TSSA Compliant</div>
            </div>
            <div className="text-left border-l border-white/10 pl-6">
              <div className="text-3xl font-black text-white">24/7</div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Always Active</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
