
import React, { useEffect } from 'react';
import Hero from './components/Hero';
import Overview from './components/Overview';
import VoiceAgent from './components/VoiceAgent';
import Footer from './components/Footer';

const App: React.FC = () => {
  useEffect(() => {
    const handleInternalLinks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
        const id = anchor.getAttribute('href')?.substring(1);
        if (!id) return;

        const element = document.getElementById(id);
        if (element) {
          e.preventDefault();
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    document.addEventListener('click', handleInternalLinks);
    return () => document.removeEventListener('click', handleInternalLinks);
  }, []);

  const handleNavStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const demoSection = document.getElementById('demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
    window.dispatchEvent(new CustomEvent('vapi-start'));
  };

  return (
    <div className="min-h-screen bg-navy text-white selection:bg-orange-500 selection:text-white">
      <nav className="fixed top-0 w-full z-50 bg-navy/95 backdrop-blur-3xl border-b-4 border-white/10 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)]">
        <div className="container mx-auto px-6 h-28 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-12 bg-orange-500 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-2xl shadow-orange-500/40">GTA</div>
            <span className="text-white font-black tracking-tighter text-2xl md:text-3xl uppercase">Dispatch Pilot</span>
          </div>
          <div className="hidden lg:flex gap-10 xl:gap-14 text-white text-lg font-black uppercase tracking-[0.2em]">
            <a href="#overview" className="hover:text-orange-500 transition-all py-2 border-b-4 border-transparent hover:border-orange-500 cursor-pointer">Overview</a>
            <button onClick={handleNavStart} className="hover:text-orange-500 transition-all py-2 border-b-4 border-transparent hover:border-orange-500 cursor-pointer uppercase">Voice Demo</button>
            <a href="#safety" className="hover:text-orange-500 transition-all py-2 border-b-4 border-transparent hover:border-orange-500 cursor-pointer">Safety Protocols</a>
          </div>
          <button 
            onClick={handleNavStart}
            className="px-6 md:px-10 py-4 bg-orange-500 text-white rounded-2xl text-sm md:text-base font-black hover:bg-orange-600 transition-all shadow-[0_15px_30px_-5px_rgba(249,115,22,0.5)] uppercase tracking-widest border-b-4 border-orange-700 active:translate-y-1 active:border-b-2"
          >
            Access Live Demo
          </button>
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
