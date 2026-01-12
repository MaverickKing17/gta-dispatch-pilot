
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { DispatchStatus, TranscriptionItem } from '../types.ts';
import { VAPI_AGENT_ID, WEBHOOK_URL } from '../constants.tsx';

const VoiceAgent: React.FC = () => {
  const [status, setStatus] = useState<DispatchStatus>(DispatchStatus.IDLE);
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [currentPersona, setCurrentPersona] = useState<'SERVICE' | 'EMERGENCY'>('SERVICE');
  const [volume, setVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const vapiRef = useRef<any>(null);

  // Initialize Vapi SDK
  useEffect(() => {
    const publicKey = (process.env as any).VAPI_PUBLIC_KEY || "0b4a6b67-3152-40bb-b29e-8272cfd98b3a";
    vapiRef.current = new Vapi(publicKey);

    vapiRef.current.on('call-start', () => {
      setStatus(DispatchStatus.ACTIVE);
    });

    vapiRef.current.on('call-end', () => {
      setStatus(DispatchStatus.IDLE);
      setVolume(0);
      setTranscriptions([]);
    });

    vapiRef.current.on('message', (message: any) => {
      if (message.type === 'transcript') {
        const speaker = message.role === 'assistant' ? 'agent' : 'user';
        const text = message.transcript;
        
        if (message.transcriptType === 'final') {
          setTranscriptions(prev => {
            const newItems = [...prev, { speaker, text, timestamp: new Date() }];
            return newItems.slice(-3);
          });

          // Dynamic Persona Detection
          if (speaker === 'agent') {
            const lowerText = text.toLowerCase();
            if (lowerText.includes('emergency') || lowerText.includes('urgent') || lowerText.includes('safety') || lowerText.includes('911')) {
              setCurrentPersona('EMERGENCY');
            } else if (lowerText.includes('rebate') || lowerText.includes('service')) {
              setCurrentPersona('SERVICE');
            }
          }
        }
      }

      if (message.type === 'tool-calls') {
        // Handle tool calls if necessary
        console.log('Vapi Tool Call:', message.toolCalls);
      }
    });

    vapiRef.current.on('volume-level', (level: number) => {
      setVolume(level);
    });

    vapiRef.current.on('error', (e: any) => {
      console.error('Vapi Error:', e);
      setStatus(DispatchStatus.ERROR);
    });

    return () => {
      vapiRef.current?.stop();
    };
  }, []);

  const startCall = async () => {
    setStatus(DispatchStatus.CONNECTING);
    try {
      await vapiRef.current.start(VAPI_AGENT_ID);
    } catch (err) {
      console.error('Failed to start Vapi call', err);
      setStatus(DispatchStatus.ERROR);
    }
  };

  const stopCall = () => {
    vapiRef.current.stop();
  };

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    vapiRef.current.setMuted(newMuteState);
  };

  const currentMsg = transcriptions[transcriptions.length - 1];

  return (
    <section id="demo" className="py-24 md:py-32 bg-white relative overflow-hidden scroll-mt-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-navy mb-6 md:mb-8 tracking-tighter leading-tight">Experience the AI Dispatcher Live</h2>
            <p className="text-xl md:text-2xl text-slate-800 font-bold max-w-2xl mx-auto leading-relaxed">
              Vapi-powered voice orchestration for GTA HVAC teams. 
              Mention a <span className="text-red-600 font-black">"gas leak"</span> for emergency triage.
            </p>
          </div>

          <div className="bg-navy rounded-[2rem] md:rounded-[4rem] p-6 md:p-16 lg:p-24 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden border-4 md:border-8 border-white/5">
            {/* Pulse Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div 
                 className={`transition-all duration-150 w-[30rem] md:w-[45rem] h-[30rem] md:h-[45rem] border-4 border-orange-500/20 rounded-full ${status === DispatchStatus.ACTIVE ? 'opacity-100' : 'opacity-0'}`}
                 style={{ transform: `scale(${1 + volume * 0.5})` }}
               ></div>
               <div 
                 className={`transition-all duration-300 w-[40rem] md:w-[55rem] h-[40rem] md:h-[55rem] border-2 border-orange-500/10 rounded-full ${status === DispatchStatus.ACTIVE ? 'opacity-100' : 'opacity-0'}`}
                 style={{ transform: `scale(${1.1 + volume * 0.8})` }}
               ></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-12 md:mb-16">
                <div className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] border-4 transition-all shadow-xl ${status === DispatchStatus.ACTIVE ? 'bg-orange-500 border-orange-400 text-white' : 'bg-transparent border-slate-700 text-slate-500'}`}>
                   <span className={`w-3 h-3 rounded-full ${status === DispatchStatus.ACTIVE ? 'bg-white animate-pulse' : 'bg-slate-700'}`}></span>
                   STATUS: {status}
                </div>
                <div className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] border-4 transition-all shadow-xl ${status === DispatchStatus.ACTIVE ? (currentPersona === 'EMERGENCY' ? 'bg-red-600 border-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-green-600 border-green-500 text-white') : 'bg-transparent border-slate-700 text-slate-600'}`}>
                   ROLE: {status === DispatchStatus.ACTIVE ? (currentPersona === 'EMERGENCY' ? 'EMERGENCY SPECIALIST' : 'SERVICE AGENT') : 'STANDBY'}
                </div>
              </div>

              <div className="relative mb-12 md:mb-20">
                <div 
                  className={`w-40 h-40 md:w-48 md:h-48 rounded-full bg-slate-900 flex items-center justify-center transition-all duration-150 border-4 md:border-8 border-white/10 ${status === DispatchStatus.ACTIVE ? 'shadow-[0_0_80px_-5px_rgba(249,115,22,0.6)]' : ''}`}
                  style={{ transform: status === DispatchStatus.ACTIVE ? `scale(${1.05 + volume * 0.2})` : 'scale(1)' }}
                >
                   <svg className={`w-16 h-16 md:w-20 md:h-20 transition-colors ${status === DispatchStatus.ACTIVE ? 'text-orange-500' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                   </svg>
                </div>
              </div>

              <div className="w-full max-w-4xl px-4 mb-16 h-48 md:h-40 flex flex-col justify-center items-center text-center">
                 {!currentMsg && status === DispatchStatus.IDLE && (
                   <p className="text-slate-500 text-xl md:text-2xl font-black italic tracking-widest uppercase opacity-40">System Idle // Secure Line Ready</p>
                 )}
                 {status === DispatchStatus.CONNECTING && (
                   <p className="text-orange-500 text-2xl md:text-3xl font-black animate-pulse tracking-tighter uppercase">Initializing Vapi Node...</p>
                 )}
                 {status === DispatchStatus.ACTIVE && currentMsg && (
                   <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                     <p className={`text-2xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tighter drop-shadow-2xl transition-colors duration-300 ${currentPersona === 'EMERGENCY' && currentMsg.speaker === 'agent' ? 'text-red-400' : 'text-white'}`}>
                       "{currentMsg.text}"
                     </p>
                   </div>
                 )}
              </div>

              <div className="flex flex-col sm:flex-row gap-6 md:gap-8 w-full justify-center items-center">
                {status === DispatchStatus.IDLE || status === DispatchStatus.ERROR ? (
                  <button 
                    onClick={startCall}
                    className="w-full sm:w-auto px-12 md:px-16 py-6 md:py-8 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-2xl md:rounded-3xl transition-all shadow-[0_25px_50px_-10px_rgba(249,115,22,0.8)] uppercase tracking-[0.1em] text-2xl md:text-3xl flex items-center justify-center gap-6 border-b-8 border-orange-700 active:translate-y-1"
                  >
                    Launch Simulation
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-8 w-full sm:w-auto">
                    <button 
                      onClick={toggleMute}
                      className={`px-8 md:px-12 py-6 md:py-8 rounded-2xl md:rounded-3xl border-4 transition-all text-xl md:text-2xl font-black uppercase ${isMuted ? 'bg-red-600 border-red-500 text-white' : 'bg-white/10 border-white/30 text-white'}`}
                    >
                      {isMuted ? 'UNMUTE' : 'MUTE'}
                    </button>
                    <button 
                      onClick={stopCall}
                      className="px-12 md:px-16 py-6 md:py-8 bg-white text-navy font-black rounded-2xl md:rounded-3xl hover:bg-slate-50 transition-all uppercase tracking-[0.1em] text-xl md:text-2xl shadow-2xl border-b-8 border-slate-300 active:translate-y-1"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VoiceAgent;
