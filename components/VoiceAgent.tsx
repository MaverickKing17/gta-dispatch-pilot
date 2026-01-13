
import React, { useState, useRef, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { DispatchStatus, TranscriptionItem } from '../types.ts';
import { VAPI_AGENT_ID, SYSTEM_INSTRUCTION } from '../constants.tsx';

const VoiceAgent: React.FC = () => {
  const [status, setStatus] = useState<DispatchStatus>(DispatchStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [currentPersona, setCurrentPersona] = useState<'SERVICE' | 'EMERGENCY'>('SERVICE');
  const [volume, setVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionStep, setConnectionStep] = useState('');
  
  const vapiRef = useRef<any>(null);

  useEffect(() => {
    const publicKey = (process.env as any).VAPI_PUBLIC_KEY || "0b4a6b67-3152-40bb-b29e-8272cfd98b3a";
    
    try {
      vapiRef.current = new Vapi(publicKey);

      vapiRef.current.on('call-start', () => {
        console.log('Vapi: Call successfully started');
        setStatus(DispatchStatus.ACTIVE);
        setErrorMessage(null);
        setConnectionStep('');
      });

      vapiRef.current.on('call-end', () => {
        console.log('Vapi: Call ended');
        setStatus(DispatchStatus.IDLE);
        setVolume(0);
        setTranscriptions([]);
        setConnectionStep('');
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

            if (speaker === 'agent') {
              const lowerText = text.toLowerCase();
              if (lowerText.includes('emergency') || lowerText.includes('urgent') || lowerText.includes('safety') || lowerText.includes('911')) {
                setCurrentPersona('EMERGENCY');
              } else if (lowerText.includes('rebate') || lowerText.includes('service') || lowerText.includes('hello')) {
                setCurrentPersona('SERVICE');
              }
            }
          }
        }
      });

      vapiRef.current.on('volume-level', (level: number) => {
        setVolume(level);
      });

      vapiRef.current.on('error', (e: any) => {
        console.error('Vapi SDK Error:', e);
        const errorText = e.message || 'Connection failed';
        setErrorMessage(errorText);
        setStatus(DispatchStatus.ERROR);
        setConnectionStep('');
      });

    } catch (err: any) {
      console.error('Vapi Initialization Failed:', err);
      setErrorMessage('Failed to initialize voice engine.');
    }

    return () => {
      vapiRef.current?.stop();
    };
  }, []);

  const startCall = async () => {
    setErrorMessage(null);
    setStatus(DispatchStatus.CONNECTING);
    setConnectionStep('Requesting Mic Access...');
    
    try {
      if (!vapiRef.current) {
        throw new Error("Voice engine not ready.");
      }

      await navigator.mediaDevices.getUserMedia({ audio: true });
      setConnectionStep('Establishing Secure Connection...');

      // Assistant override to ensure Jessica greets immediately
      const assistantOverrides = {
        name: "Jessica - GTA Dispatch",
        firstMessage: "Hello, this is Jessica with the GTA HVAC Dispatch Pilot. How can I help you today?",
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [{ role: "system", content: SYSTEM_INSTRUCTION }]
        }
      };

      await vapiRef.current.start(VAPI_AGENT_ID, {
        assistant: assistantOverrides
      });

    } catch (err: any) {
      console.error('Vapi Start Exception:', err);
      let msg = "Could not start call.";
      if (err.name === 'NotAllowedError') msg = "Microphone access denied.";
      if (err.name === 'NotFoundError') msg = "No microphone found.";
      
      setErrorMessage(msg);
      setStatus(DispatchStatus.ERROR);
      setConnectionStep('');
    }
  };

  const stopCall = () => {
    vapiRef.current?.stop();
  };

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    vapiRef.current?.setMuted(newMuteState);
  };

  const currentMsg = transcriptions[transcriptions.length - 1];

  return (
    <section id="demo" className="py-24 md:py-32 bg-white relative overflow-hidden scroll-mt-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-navy mb-6 md:mb-8 tracking-tighter leading-tight uppercase">Pilot Control Center</h2>
            <p className="text-xl md:text-2xl text-slate-800 font-bold max-w-2xl mx-auto leading-relaxed italic">
              Experience Agent Jessica: Real-time GTA Voice Orchestration. 
              <br className="hidden md:block" />
              Try asking about <span className="text-orange-500 font-black">"Enbridge rebates"</span> or a <span className="text-red-600 font-black">"furnace issue."</span>
            </p>
          </div>

          <div className="bg-[#0A192F] rounded-[2rem] md:rounded-[4rem] p-6 md:p-16 lg:p-24 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden border-4 md:border-8 border-white/5">
            {/* Visual Echo Effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
               <div 
                 className={`transition-all duration-300 w-[45rem] h-[45rem] border-4 border-orange-500/20 rounded-full ${status === DispatchStatus.ACTIVE ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                 style={{ transform: `scale(${1 + volume * 0.4})` }}
               ></div>
               <div 
                 className={`transition-all duration-500 w-[55rem] h-[55rem] border-2 border-orange-500/10 rounded-full ${status === DispatchStatus.ACTIVE ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                 style={{ transform: `scale(${1.1 + volume * 0.6})` }}
               ></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              {errorMessage && (
                <div className="w-full max-w-md bg-red-500/20 border-2 border-red-500 text-red-200 px-6 py-4 rounded-2xl mb-8 flex items-center gap-4 animate-bounce">
                  <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span className="font-black uppercase tracking-widest text-sm">{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-12 md:mb-16">
                <div className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] border-4 transition-all shadow-xl ${status === DispatchStatus.ACTIVE ? 'bg-orange-500 border-orange-400 text-white' : 'bg-transparent border-slate-700 text-slate-500'}`}>
                   <span className={`w-3 h-3 rounded-full ${status === DispatchStatus.ACTIVE ? 'bg-white animate-pulse' : 'bg-slate-700'}`}></span>
                   LINK: {status === DispatchStatus.ACTIVE ? 'ESTABLISHED' : status}
                </div>
                <div className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] border-4 transition-all shadow-xl ${status === DispatchStatus.ACTIVE ? (currentPersona === 'EMERGENCY' ? 'bg-red-600 border-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-green-600 border-green-500 text-white') : 'bg-transparent border-slate-700 text-slate-600'}`}>
                   AGENT: {status === DispatchStatus.ACTIVE ? (currentPersona === 'EMERGENCY' ? 'EMERGENCY JESSICA' : 'SERVICE JESSICA') : 'READY'}
                </div>
              </div>

              <div className="relative mb-12 md:mb-20">
                <div 
                  className={`w-40 h-40 md:w-48 md:h-48 rounded-full bg-[#0A192F] flex items-center justify-center transition-all duration-150 border-4 md:border-8 border-orange-500/20 ${status === DispatchStatus.ACTIVE ? 'shadow-[0_0_80px_-5px_rgba(249,115,22,0.8)] border-orange-500' : ''}`}
                  style={{ transform: status === DispatchStatus.ACTIVE ? `scale(${1.05 + volume * 0.2})` : 'scale(1)' }}
                >
                   <svg className={`w-16 h-16 md:w-20 md:h-20 transition-colors ${status === DispatchStatus.ACTIVE ? 'text-orange-500' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                   </svg>
                </div>
              </div>

              <div className="w-full max-w-4xl px-4 mb-16 min-h-[120px] md:min-h-[160px] flex flex-col justify-center items-center text-center">
                 {!currentMsg && status === DispatchStatus.IDLE && (
                   <p className="text-slate-600 text-xl md:text-2xl font-black italic tracking-[0.2em] uppercase opacity-40">Jessica is on standby // Waiting for command</p>
                 )}
                 {status === DispatchStatus.CONNECTING && (
                   <div className="flex flex-col gap-4 items-center">
                     <p className="text-orange-500 text-2xl md:text-3xl font-black animate-pulse tracking-tighter uppercase">{connectionStep}</p>
                     <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 animate-[loading_1.5s_infinite_linear]"></div>
                     </div>
                   </div>
                 )}
                 {status === DispatchStatus.ACTIVE && currentMsg && (
                   <div className="animate-in fade-in zoom-in-95 duration-300 w-full">
                     <p className={`text-2xl md:text-4xl lg:text-6xl font-black leading-tight tracking-tighter drop-shadow-2xl transition-all duration-300 ${currentPersona === 'EMERGENCY' && currentMsg.speaker === 'agent' ? 'text-red-400' : 'text-white'}`}>
                       "{currentMsg.text}"
                     </p>
                   </div>
                 )}
              </div>

              <div className="flex flex-col sm:flex-row gap-6 md:gap-8 w-full justify-center items-center">
                {status !== DispatchStatus.ACTIVE && status !== DispatchStatus.CONNECTING ? (
                  <button 
                    onClick={startCall}
                    className="w-full sm:w-auto px-12 md:px-20 py-6 md:py-10 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-3xl transition-all shadow-[0_25px_50px_-10px_rgba(249,115,22,0.8)] uppercase tracking-[0.2em] text-2xl md:text-4xl flex items-center justify-center gap-8 border-b-[12px] border-orange-700 active:translate-y-2 active:border-b-4"
                  >
                    Start Interaction
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-8 w-full sm:w-auto">
                    <button 
                      onClick={toggleMute}
                      className={`px-8 md:px-12 py-6 md:py-8 rounded-2xl md:rounded-3xl border-4 transition-all text-xl md:text-2xl font-black uppercase ${isMuted ? 'bg-red-600 border-red-500 text-white' : 'bg-white/10 border-white/30 text-white'}`}
                    >
                      {isMuted ? 'Unmute Mic' : 'Mute Mic'}
                    </button>
                    <button 
                      onClick={stopCall}
                      className="px-12 md:px-20 py-6 md:py-10 bg-white text-navy font-black rounded-3xl hover:bg-slate-50 transition-all uppercase tracking-[0.2em] text-xl md:text-3xl shadow-2xl border-b-[10px] border-slate-300 active:translate-y-2 active:border-b-2"
                    >
                      {status === DispatchStatus.CONNECTING ? 'Cancel' : 'End Call'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
};

export default VoiceAgent;
