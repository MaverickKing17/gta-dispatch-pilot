
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-navy border-t border-white/10 py-12 text-slate-400">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="text-white font-bold text-xl mb-2">GTA Service Dispatch Pilot</div>
            <p className="text-sm max-w-xs">Pioneering the next generation of safe, profitable HVAC operations in the Greater Toronto Area.</p>
          </div>
          <div className="text-center md:text-right">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-4">Compliance Standards</div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-end">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold">TSSA COMPLIANT</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold">ONTARIO SAFETY STANDARDS</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold">ENBRIDGE PARTNER PROTOCOL</span>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs">
          &copy; {new Date().getFullYear()} GTA HVAC Service Dispatch Pilot. Experimental Phase. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
