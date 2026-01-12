
import React, { useEffect } from 'react';
import Hero from './components/Hero';
import Overview from './components/Overview';
import VoiceAgent from './components/VoiceAgent';
import Footer from './components/Footer';

const App: React.FC = () => {
  // Global interceptor for all internal anchor links (#)
  // This prevents browser navigation errors in certain environments and 
  // ensures smooth scrolling with correct offsets for the fixed header.
  useEffect(() => {
    const handleInternalLinks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      // Only intercept links that start with # and belong to the current page
      if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
        const id = anchor.getAttribute('href')?.substring(1);
        if (!id) return;

        const element = document.getElementById(id);
        if (element) {
          e.preventDefault();
          
          // Offset calculation: h-28 is 112px
          const navOffset = 112; 
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Update URL hash without triggering a jump
          window.history.pushState(null, '', `#${id}`);
        }
      }
    };

    document.addEventListener('click', handleInternalLinks);
    return () => document.removeEventListener('click', handleInternalLinks);
  }, []);

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-navy/95 backdrop-blur-2xl border-b-4 border-white/10 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)]">
        <div className="container mx-auto px-6 h-28 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-12 bg-orange-500 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-2xl shadow-orange-500/40">GTA</div>
            <span className="text-white font-black tracking-tighter text-2xl md:text-3xl uppercase">Dispatch Pilot</span>
          </div>
          <div className="hidden lg:flex gap-10 xl:gap-14 text-white text-lg font-black uppercase tracking-[0.2em]">
            <a href="#overview" className="hover:text-orange-500 transition-all py-2 border-b-4 border-transparent hover:border-orange-500">Overview</a>
            <a href="#demo" className="hover:text-orange-500 transition-all py-2 border-b-4 border-transparent hover:border-orange-500">Voice Demo</a>
            <a href="#safety" className="hover:text-orange-500 transition-all py-2 border-b-4 border-transparent hover:border-orange-500">Safety Protocols</a>
          </div>
          <a 
            href="#demo"
            className="px-6 md:px-10 py-4 bg-orange-500 text-white rounded-2xl text-sm md:text-base font-black hover:bg-orange-600 transition-all shadow-[0_15px_30px_-5px_rgba(249,115,22,0.5)] uppercase tracking-widest border-b-4 border-orange-700"
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
