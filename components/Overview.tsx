
import React from 'react';

const Overview: React.FC = () => {
  return (
    <>
      <section id="overview" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl font-bold text-navy mb-6">Pilot Overview</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              The GTA Service Dispatch Pilot is a specialized AI safety-compliance lab 
              for regional HVAC operators. This pilot focuses on reducing human fatigue in after-hours dispatch 
              while maximizing revenue capture through Enbridge HER+ rebate education.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-navy mb-4">Safety Compliance</h3>
              <p className="text-slate-500">Built-in protocols for TSSA compliance and gas leak triage, ensuring immediate redirection to emergency services.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-navy mb-4">Revenue Capture</h3>
              <p className="text-slate-500">Every repair call is screened for rebate potential. We identify candidates for $7,500 heat pump replacements automatically.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-navy mb-4">Multi-Persona AI</h3>
              <p className="text-slate-500">Chloe handles the soft-sell and service, while Sam takes over for high-stakes emergency situations.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <h2 className="text-4xl font-bold text-navy mb-6">Dual-Logic Showcase</h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">!</div>
                  <div>
                    <h4 className="text-xl font-bold text-navy mb-2">Emergency Safety Protocols</h4>
                    <p className="text-slate-500">The "Red Tag" logic ensures that any gas leak or carbon monoxide mention triggers an immediate safety broadcast and a 911 handoff.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">$</div>
                  <div>
                    <h4 className="text-xl font-bold text-navy mb-2">Enbridge HER+ & HRS Rebates</h4>
                    <p className="text-slate-500">Capture Ontario government funding for your customers. Our AI calculates eligibility for the Home Renovation Savings program in real-time.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative p-1 bg-gradient-to-tr from-orange-500 to-navy rounded-2xl overflow-hidden">
                <div className="bg-slate-900 p-8 rounded-xl text-white">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-mono uppercase text-slate-400">System Logs // GTA-Dispatch-01</span>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  </div>
                  <pre className="text-xs sm:text-sm font-mono text-slate-300 space-y-2">
                    <code>{`> INCOMING_CALL: 416-555-0199`}</code><br/>
                    <code>{`> SCANNING_AUDIO: "Gas smell in basement"`}</code><br/>
                    <code className="text-red-400">{`> TRIGGER: SAFETY_PROTOCOL_ALPHA`}</code><br/>
                    <code className="text-red-400">{`> ACTION: DISPATCH_SAM_EMERGENCY`}</code><br/>
                    <code>{`> INSTRUCTION: "Evacuate house immediately"`}</code><br/>
                    <code>{`-------------------------------`}</code><br/>
                    <code>{`> INCOMING_CALL: 905-555-0212`}</code><br/>
                    <code>{`> SCANNING_AUDIO: "Old furnace, high bills"`}</code><br/>
                    <code className="text-green-400">{`> TRIGGER: REVENUE_CAPTURE_HRS`}</code><br/>
                    <code className="text-green-400">{`> ACTION: TAG_7500_REBATE_QUALIFIER`}</code>
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
