
import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Overview from './components/Overview';
import VoiceAgent from './components/VoiceAgent';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    if (process.env.API_KEY) {
      setHasApiKey(true);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-navy/95 backdrop-blur-2xl border-b-4 border-white/10 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)]">
        <div className="container mx-auto px-6 h-28 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-12 bg-orange-500 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-2xl shadow-orange-500/40">GTA</div>
            <span className="text-white font-black tracking-tighter text-3xl">DISPATCH PILOT</span>
          </div>
          <div className="hidden lg:flex gap-14 text-white text-lg font-black uppercase tracking-[0.2em]">
            <a href="#overview" className="hover:text-orange-500 transition-all py-2 border-b-4 border-transparent hover:border-orange-500">Overview</a>
            <a href="#demo" className="hover:text-orange-500 transition-all py-2 border-b-4 border-transparent hover:border-orange-500">Voice Demo</a>
            <a href="#safety" className="hover:text-orange-500 transition-all py-2 border-b-4 border-transparent hover:border-orange-500">Safety Protocols</a>
          </div>
          <a 
            href="#demo"
            className="px-10 py-4 bg-orange-500 text-white rounded-2xl text-base font-black hover:bg-orange-600 transition-all shadow-[0_15px_30px_-5px_rgba(249,115,22,0.5)] uppercase tracking-widest border-b-4 border-orange-700"
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
