
import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Overview from './components/Overview';
import VoiceAgent from './components/VoiceAgent';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Standard check for frame environment if needed
    if (process.env.API_KEY) {
      setHasApiKey(true);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-navy/90 backdrop-blur-xl border-b-2 border-white/10 shadow-2xl">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-lg shadow-orange-500/20">GTA</div>
            <span className="text-white font-black tracking-tight text-xl">DISPATCH PILOT</span>
          </div>
          <div className="hidden lg:flex gap-10 text-white text-base font-black uppercase tracking-widest">
            <a href="#overview" className="hover:text-orange-500 transition-colors py-2 border-b-2 border-transparent hover:border-orange-500">Overview</a>
            <a href="#demo" className="hover:text-orange-500 transition-colors py-2 border-b-2 border-transparent hover:border-orange-500">Voice Demo</a>
            <a href="#safety" className="hover:text-orange-500 transition-colors py-2 border-b-2 border-transparent hover:border-orange-500">Safety Protocols</a>
          </div>
          <a 
            href="#demo"
            className="px-8 py-3 bg-orange-500 text-white rounded-xl text-sm font-black hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/30 uppercase tracking-widest"
          >
            Access Live Demo
          </a>
        </div>
      </nav>

      <main>
        <Hero />
        <Overview />
        <VoiceAgent />
      </main>

      <Footer />
    </div>
  );
};

export default App;
