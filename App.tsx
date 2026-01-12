
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
      <nav className="fixed top-0 w-full z-50 bg-navy/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-8 bg-orange-500 rounded flex items-center justify-center font-bold text-white text-[10px]">GTA</div>
            <span className="text-white font-bold tracking-tight">GTA DISPATCH PILOT</span>
          </div>
          <div className="hidden md:flex gap-8 text-slate-300 text-sm font-medium">
            <a href="#overview" className="hover:text-orange-400 transition-colors">Overview</a>
            <a href="#demo" className="hover:text-orange-400 transition-colors">Voice Demo</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Safety Protocols</a>
          </div>
          <a 
            href="#demo"
            className="px-5 py-2 bg-orange-500 text-white rounded-md text-sm font-bold hover:bg-orange-600 transition-all"
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
