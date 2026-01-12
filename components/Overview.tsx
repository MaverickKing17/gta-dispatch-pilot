
import React from 'react';

const Overview: React.FC = () => {
  return (
    <>
      <section id="overview" className="py-40 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mb-24">
            <h2 className="text-5xl lg:text-7xl font-black text-navy mb-10 tracking-tighter leading-tight">Pilot Overview</h2>
            <p className="text-2xl lg:text-3xl text-slate-800 font-bold leading-relaxed">
              The GTA Service Dispatch Pilot is a specialized AI safety-compliance lab 
              for regional HVAC operators. This pilot focuses on reducing human fatigue in after-hours dispatch 
              while maximizing revenue capture through Enbridge HER+ rebate education.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="bg-white p-14 rounded-[3rem] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.1)] border-2 border-slate-100 hover:border-orange-500 transition-all group hover:-translate-y-2">
              <div className="w-20 h-20 bg-blue-100 text-blue-700 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h3 className="text-3xl font-black text-navy mb-6 uppercase tracking-tight">Safety Compliance</h3>
              <p className="text-xl text-slate-700 font-medium leading-relaxed">Built-in protocols for TSSA compliance and gas leak triage, ensuring immediate redirection to emergency services.</p>
            </div>
            <div className="bg-white p-14 rounded-[3rem] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.1)] border-2 border-slate-100 hover:border-orange-500 transition-all group hover:-translate-y-2">
              <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-xl">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-3xl font-black text-navy mb-6 uppercase tracking-tight">Revenue Capture</h3>
              <p className="text-xl text-slate-700 font-medium leading-relaxed">Every repair call is screened for rebate potential. We identify candidates for $7,500 heat pump replacements automatically.</p>
            </div>
            <div className="bg-white p-14 rounded-[3rem] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.1)] border-2 border-slate-100 hover:border-orange-500 transition-all group hover:-translate-y-2">
              <div className="w-20 h-20 bg-slate-100 text-slate-800 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-navy group-hover:text-white transition-all shadow-xl">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
              </div>
              <h3 className="text-3xl font-black text-navy mb-6 uppercase tracking-tight">Multi-Persona AI</h3>
              <p className="text-xl text-slate-700 font-medium leading-relaxed">The Service Agent handles the soft-sell and qualification, while the Emergency Specialist takes over for high-stakes emergency situations.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="safety" className="py-40 bg-white border-y-8 border-slate-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col xl:flex-row gap-24 items-center">
            <div className="xl:w-1/2">
              <h2 className="text-5xl lg:text-7xl font-black text-navy mb-12 tracking-tighter leading-tight">Dual-Logic Showcase</h2>
              <div className="space-y-16">
                <div className="flex gap-10 group">
                  <div className="flex-shrink-0 w-24 h-24 bg-red-100 text-red-600 rounded-[2rem] flex items-center justify-center text-5xl font-black shadow-2xl group-hover:scale-110 transition-transform">!</div>
                  <div>
                    <h4 className="text-3xl font-black text-navy mb-4">Emergency Safety Protocols</h4>
                    <p className="text-xl lg:text-2xl text-slate-700 font-bold leading-relaxed">The "Red Tag" logic ensures that any gas leak or carbon monoxide mention triggers an immediate safety broadcast and a 911 handoff.</p>
                  </div>
                </div>
                <div className="flex gap-10 group">
                  <div className="flex-shrink-0 w-24 h-24 bg-green-100 text-green-700 rounded-[2rem] flex items-center justify-center text-5xl font-black shadow-2xl group-hover:scale-110 transition-transform">$</div>
                  <div>
                    <h4 className="text-3xl font-black text-navy mb-4">Enbridge HER+ & HRS Rebates</h4>
                    <p className="text-xl lg:text-2xl text-slate-700 font-bold leading-relaxed">Capture Ontario government funding for your customers. Our AI calculates eligibility for the Home Renovation Savings program in real-time.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="xl:w-1/2 w-full">
              <div className="relative p-2.5 bg-gradient-to-tr from-orange-500 via-navy to-orange-500 rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
                <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white">
                  <div className="flex justify-between items-center mb-10 border-b-2 border-white/10 pb-6">
                    <span className="text-sm font-black uppercase text-slate-400 tracking-[0.3em]">System Logs // GTA-Dispatch-01</span>
                    <span className="w-4 h-4 bg-green-500 rounded-full shadow-[0_0_20px_rgba(34,197,94,1)]"></span>
                  </div>
                  <pre className="text-lg sm:text-xl font-black font-mono text-slate-300 space-y-4 leading-relaxed">
                    <code className="block opacity-60 italic">{`> SYSTEM READY`}</code>
                    <code className="block">{`> INCOMING_CALL: 416-555-0199`}</code>
                    <code className="block">{`> SCANNING: "Gas smell in basement"`}</code>
                    <code className="block text-red-400 font-black bg-red-500/10 px-3 py-1 rounded-lg shadow-sm">{`> TRIGGER: SAFETY_PROTOCOL_ALPHA`}</code>
                    <code className="block text-red-500">{`> HANDOFF: EMERGENCY SPECIALIST`}</code>
                    <code className="block bg-red-600 text-white px-4 py-2 rounded-xl animate-pulse shadow-lg">{`> ACTION: MANDATORY EVACUATION`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Overview;
