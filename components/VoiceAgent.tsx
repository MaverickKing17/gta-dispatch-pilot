
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
  const statusRef = useRef<DispatchStatus>(DispatchStatus.IDLE);

  // Sync ref for callback access
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const publicKey = "0b4a6b67-3152-40bb-b29e-8272cfd98b3a";
    
    try {
      // Initialize Vapi instance with correct public key
      vapiRef.current = new Vapi(publicKey);

      vapiRef.current.on('call-start', () => {
        console.log('Call started');
        setStatus(DispatchStatus.ACTIVE);
        setErrorMessage(null);
        setConnectionStep('');
      });

      vapiRef.current.on('call-end', () => {
        console.log('Call ended');
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
              if (lowerText.includes('emergency') || lowerText.includes('urgent') || lowerText.includes('911')) {
                setCurrentPersona('EMERGENCY');
              } else {
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
        console.error('Vapi Error:', e);
        const msg = e.message || 'Connection Error';
        setErrorMessage(msg);
        setStatus(DispatchStatus.ERROR);
        setConnectionStep('');
      });

    } catch (err: any) {
      console.error('Vapi Init Error:', err);
      setErrorMessage('Failed to load voice system.');
    }

    const handleRemoteStart = () => {
      console.log('Remote signal caught');
      if (statusRef.current === DispatchStatus.IDLE) {
        startCall();
      }
    };

    window.addEventListener('vapi-start', handleRemoteStart);
    return () => {
      vapiRef.current?.stop();
      window.removeEventListener('vapi-start', handleRemoteStart);
    };
  }, []);

  const startCall = async () => {
    if (statusRef.current === DispatchStatus.ACTIVE || statusRef.current === DispatchStatus.CONNECTING) return;

    setErrorMessage(null);
    setStatus(DispatchStatus.CONNECTING);
    setConnectionStep('Handshaking with Agent...');
    
    try {
      if (!vapiRef.current) throw new Error("Vapi not loaded.");

      // Check mic availability
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setConnectionStep('Starting Jessica...');

      const assistantOverrides = {
        name: "Jessica - GTA Dispatch",
        firstMessage: "Hello, this is Jessica with the GTA HVAC Dispatch Pilot. How can I help you today?",
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [{ role: "system", content: SYSTEM_INSTRUCTION }]
        }
      };

      // Vapi 3.x uses start(agentId, overrides) or start(overrides)
      await vapiRef.current.start(VAPI_AGENT_ID, assistantOverrides);

    } catch (err: any) {
      console.error('Handshake failed:', err);
      setErrorMessage(err.name === 'NotAllowedError' ? "Microphone access is required." : "Failed to start conversation.");
      setStatus(DispatchStatus.ERROR);
      setConnectionStep('');
    }
  };

  const stopCall = () => {
    vapiRef.current?.stop();
  };

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    vapiRef.current?.setMuted(nextState);
  };

  const currentMsg = transcriptions[transcriptions.length - 1];

  return (
    <section id="demo" className="py-24 md:py-32 bg-white relative overflow-hidden scroll-mt-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-navy mb-6 md:mb-8 tracking-tighter leading-tight uppercase">Pilot Control Center</h2>
            <p className="text-xl md:text-2xl text-slate-800 font-bold max-w-2xl mx-auto leading-relaxed">
              Experience Agent Jessica: Real-time GTA Voice Orchestration. 
              <br className="hidden md:block" />
              Try asking about <span className="text-orange-500 font-black">"Enbridge rebates"</span> or report a <span className="text-red-600 font-black">"furnace breakdown."</span>
            </p>
          </div>

          <div className="bg-[#0A192F] rounded-[2rem] md:rounded-[4rem] p-6 md:p-16 lg:p-24 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden border-4 border-white/5">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
               <div className={`transition-all duration-300 w-[45rem] h-[45rem] border-4 border-orange-500/20 rounded-full ${status === DispatchStatus.ACTIVE ? 'opacity-100' : 'opacity-0'}`} style={{ transform: `scale(${1 + volume * 0.4})` }}></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              {errorMessage && (
                <div className="w-full max-w-md bg-red-500/10 border-2 border-red-500 text-red-500 px-6 py-4 rounded-2xl mb-8 font-black uppercase text-center">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-12">
                <div className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] border-2 transition-all ${status === DispatchStatus.ACTIVE ? 'bg-orange-500 border-orange-400 text-white' : 'bg-transparent border-slate-700 text-slate-500'}`}>
                   STATUS: {status === DispatchStatus.ACTIVE ? 'LIVE' : status}
                </div>
                <div className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] border-2 transition-all ${status === DispatchStatus.ACTIVE ? (currentPersona === 'EMERGENCY' ? 'bg-red-600 border-red-500 text-white' : 'bg-green-600 border-green-500 text-white') : 'bg-transparent border-slate-700 text-slate-600'}`}>
                   PERSONA: {status === DispatchStatus.ACTIVE ? currentPersona : 'READY'}
                </div>
              </div>

              <div className="relative mb-12">
                <button 
                  onClick={status === DispatchStatus.IDLE ? startCall : undefined}
                  className={`w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#0A192F] flex items-center justify-center transition-all duration-150 border-4 ${status === DispatchStatus.ACTIVE ? 'shadow-[0_0_60px_-5px_rgba(249,115,22,0.8)] border-orange-500' : 'border-slate-800'}`}
                  style={{ transform: status === DispatchStatus.ACTIVE ? `scale(${1 + volume * 0.3})` : 'scale(1)' }}
                >
                   <svg className={`w-12 h-12 md:w-16 md:h-16 ${status === DispatchStatus.ACTIVE ? 'text-orange-500 animate-pulse' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                   </svg>
                </button>
              </div>

              <div className="w-full max-w-4xl px-4 mb-12 min-h-[140px] flex flex-col justify-center items-center text-center">
                 {status === DispatchStatus.IDLE && (
                   <p className="text-slate-600 text-lg md:text-xl font-black italic uppercase tracking-widest opacity-40">Agent Offline // Click to Start</p>
                 )}
                 {status === DispatchStatus.CONNECTING && (
                   <p className="text-orange-500 text-2xl font-black animate-pulse uppercase">{connectionStep}</p>
                 )}
                 {status === DispatchStatus.ACTIVE && currentMsg && (
                   <div className="animate-in fade-in duration-300">
                     <p className={`text-2xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tighter ${currentMsg.speaker === 'agent' ? 'text-white' : 'text-orange-400'}`}>
                       "{currentMsg.text}"
                     </p>
                   </div>
                 )}
              </div>

              <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                {status !== DispatchStatus.ACTIVE && status !== DispatchStatus.CONNECTING ? (
                  <button 
                    onClick={startCall}
                    className="w-full sm:w-auto px-12 py-6 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-2xl transition-all shadow-xl uppercase tracking-widest text-xl md:text-2xl border-b-8 border-orange-700 active:translate-y-1"
                  >
                    Launch Pilot Agent
                  </button>
                ) : (
                  <>
                    <button onClick={toggleMute} className={`px-10 py-5 rounded-2xl border-4 transition-all font-black uppercase text-lg ${isMuted ? 'bg-red-600 border-red-500 text-white' : 'bg-white/10 border-white/30 text-white'}`}>
                      {isMuted ? 'Unmute' : 'Mute'}
                    </button>
                    <button onClick={stopCall} className="px-10 py-5 bg-white text-navy font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-lg border-b-4 border-slate-300">
                      End Session
                    </button>
                  </>
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
