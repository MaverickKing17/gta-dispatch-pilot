
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-navy border-t-8 border-orange-500 py-32 text-slate-300">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-16">
          <div className="max-w-2xl">
            <div className="text-white font-black text-4xl lg:text-5xl mb-6 tracking-tight">GTA Service Dispatch Pilot</div>
            <p className="text-xl lg:text-2xl font-bold text-slate-400 leading-relaxed italic border-l-4 border-orange-500 pl-6">
              Pioneering the next generation of safe, profitable HVAC operations in the Greater Toronto Area.
            </p>
          </div>
          <div className="text-left lg:text-right">
            <div className="text-lg font-black uppercase tracking-[0.3em] text-orange-500 mb-8">Compliance Standards</div>
            <div className="flex flex-wrap gap-6 justify-start lg:justify-end">
              <span className="px-8 py-3 bg-white/10 border-4 border-white/20 rounded-2xl text-sm font-black text-white shadow-2xl">TSSA COMPLIANT</span>
              <span className="px-8 py-3 bg-white/10 border-4 border-white/20 rounded-2xl text-sm font-black text-white shadow-2xl">ONTARIO SAFETY</span>
              <span className="px-8 py-3 bg-white/10 border-4 border-white/20 rounded-2xl text-sm font-black text-white shadow-2xl">ENBRIDGE PARTNER</span>
            </div>
          </div>
        </div>
        <div className="mt-32 pt-12 border-t-2 border-white/10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-base font-black text-slate-500 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} GTA HVAC Service Dispatch Pilot // Toronto, ON
          </div>
          <div className="flex gap-12 text-lg font-black uppercase tracking-[0.2em] text-slate-400">
            <a href="#overview" className="hover:text-white transition-colors underline decoration-orange-500/50 underline-offset-8">Overview</a>
            <a href="#safety" className="hover:text-white transition-colors underline decoration-orange-500/50 underline-offset-8">Safety</a>
            <a href="#demo" className="hover:text-white transition-colors underline decoration-orange-500/50 underline-offset-8">Demo</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
