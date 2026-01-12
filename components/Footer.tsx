
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-navy border-t-4 border-orange-500 py-20 text-slate-300">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
          <div className="max-w-md">
            <div className="text-white font-black text-3xl mb-4 tracking-tight">GTA Service Dispatch Pilot</div>
            <p className="text-lg font-bold text-slate-400 leading-relaxed italic">
              Pioneering the next generation of safe, profitable HVAC operations in the Greater Toronto Area.
            </p>
          </div>
          <div className="text-left lg:text-right">
            <div className="text-sm font-black uppercase tracking-[0.2em] text-orange-500 mb-6">Compliance Standards</div>
            <div className="flex flex-wrap gap-4 justify-start lg:justify-end">
              <span className="px-5 py-2 bg-white/5 border-2 border-white/20 rounded-xl text-xs font-black text-white shadow-lg">TSSA COMPLIANT</span>
              <span className="px-5 py-2 bg-white/5 border-2 border-white/20 rounded-xl text-xs font-black text-white shadow-lg">ONTARIO SAFETY STANDARDS</span>
              <span className="px-5 py-2 bg-white/5 border-2 border-white/20 rounded-xl text-xs font-black text-white shadow-lg">ENBRIDGE PARTNER PROTOCOL</span>
            </div>
          </div>
        </div>
        <div className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm font-bold text-slate-500">
            &copy; {new Date().getFullYear()} GTA HVAC Service Dispatch Pilot. Experimental Phase.
          </div>
          <div className="flex gap-8 text-sm font-black uppercase tracking-widest text-slate-400">
            <a href="#overview" className="hover:text-white transition-colors">Overview</a>
            <a href="#safety" className="hover:text-white transition-colors">Safety</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
