
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { 
  createBlob, 
  decode, 
  decodeAudioData, 
  controlDispatchFunctionDeclaration,
  encode
} from '../services/geminiLiveService.ts';
import { DispatchStatus, TranscriptionItem } from '../types.ts';
import { SYSTEM_INSTRUCTION, COLORS, WEBHOOK_URL, BOOKING_URL } from '../constants.tsx';

const VoiceAgent: React.FC = () => {
  const [status, setStatus] = useState<DispatchStatus>(DispatchStatus.IDLE);
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<'SERVICE' | 'EMERGENCY'>('SERVICE');
  const [volume, setVolume] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const updateVolume = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      let values = 0;
      for (let i = 0; i < dataArray.length; i++) {
        values += dataArray[i];
      }
      const average = values / dataArray.length;
      setVolume(average / 128); // Normalized value roughly 0 to 1
    }
    rafIdRef.current = requestAnimationFrame(updateVolume);
  }, []);

  const addTranscription = (speaker: 'user' | 'agent', text: string) => {
    if (speaker === 'agent') {
      const lowerText = text.toLowerCase();
      if (lowerText.includes('emergency') || lowerText.includes('urgent') || lowerText.includes('911') || lowerText.includes('safety')) {
        setCurrentPersona('EMERGENCY');
      } else if (lowerText.includes('rebate') || lowerText.includes('welcome') || lowerText.includes('representative')) {
        setCurrentPersona('SERVICE');
      }
    }

    setTranscriptions(prev => {
      const newItems = [...prev, { speaker, text, timestamp: new Date() }];
      return newItems.slice(-3);
    });
  };

  const stopSession = useCallback(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    setStatus(DispatchStatus.IDLE);
    setCurrentPersona('SERVICE');
    setTranscriptions([]);
    setVolume(0);
  }, []);

  const startSession = async () => {
    try {
      setStatus(DispatchStatus.CONNECTING);
      // Use the standardized environment variable
      const apiKey = (process.env as any).VAPI_PUBLIC_KEY || process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputContextRef.current = outputCtx;

      const analyser = outputCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      updateVolume();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          tools: [{ functionDeclarations: [controlDispatchFunctionDeclaration] }],
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setStatus(DispatchStatus.ACTIVE);
            const source = inputCtx.createMediaStreamSource(stream);
            
            // Connect input to the same analyser
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              if (sourcesRef.current.size === 0) {
                 setVolume(rms * 5); 
              }

              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              addTranscription('user', message.serverContent.inputTranscription.text);
            }
            if (message.serverContent?.outputTranscription) {
              addTranscription('agent', message.serverContent.outputTranscription.text);
            }

            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'record_dispatch') {
                  fetch(WEBHOOK_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(fc.args)
                  }).catch(e => console.error('Webhook failed', e));

                  sessionPromise.then(session => {
                    session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: "Dispatch recorded. Shared URL: " + BOOKING_URL },
                      }
                    });
                  });
                }
              }
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputCtx && analyserRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              
              source.connect(analyserRef.current);
              analyserRef.current.connect(outputCtx.destination);
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => {
                sourcesRef.current.delete(source);
              };
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Gemini Live Error:', e);
            setStatus(DispatchStatus.ERROR);
            stopSession();
          },
          onclose: () => {
            setStatus(DispatchStatus.IDLE);
          }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start session', err);
      setStatus(DispatchStatus.ERROR);
    }
  };

  const currentMsg = transcriptions[transcriptions.length - 1];

  return (
    <section id="demo" className="py-24 md:py-32 bg-white relative overflow-hidden scroll-mt-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-navy mb-6 md:mb-8 tracking-tighter leading-tight">Experience the AI Dispatcher Live</h2>
            <p className="text-xl md:text-2xl text-slate-800 font-bold max-w-2xl mx-auto leading-relaxed">
              Test our specialized safety logic. Mention a <span className="text-red-600 font-black">"gas leak"</span> to trigger the emergency protocol, 
              or ask about <span className="text-orange-600 font-black">"rebates"</span> for the service qualification workflow.
            </p>
          </div>

          <div className="bg-navy rounded-[2rem] md:rounded-[4rem] p-6 md:p-16 lg:p-24 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden border-4 md:border-8 border-white/5">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div 
                 className={`transition-all duration-150 w-[30rem] md:w-[45rem] h-[30rem] md:h-[45rem] border-4 border-orange-500/20 rounded-full ${status === DispatchStatus.ACTIVE ? 'opacity-100' : 'opacity-0'}`}
                 style={{ transform: `scale(${1.1 + volume * 0.2})` }}
               ></div>
               <div 
                 className={`transition-all duration-300 w-[40rem] md:w-[55rem] h-[40rem] md:h-[55rem] border-2 border-orange-500/10 rounded-full ${status === DispatchStatus.ACTIVE ? 'opacity-100' : 'opacity-0'}`}
                 style={{ transform: `scale(${1.2 + volume * 0.4})` }}
               ></div>
               <div 
                 className={`transition-all duration-500 w-[50rem] md:w-[65rem] h-[50rem] md:h-[65rem] border border-orange-500/5 rounded-full ${status === DispatchStatus.ACTIVE ? 'opacity-100' : 'opacity-0'}`}
                 style={{ transform: `scale(${1.3 + volume * 0.6})` }}
               ></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-12 md:mb-16">
                <div className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] border-4 transition-all shadow-xl ${status === DispatchStatus.ACTIVE ? 'bg-orange-500 border-orange-400 text-white' : 'bg-transparent border-slate-700 text-slate-500'}`}>
                   <span className={`w-3 h-3 rounded-full ${status === DispatchStatus.ACTIVE ? 'bg-white animate-pulse' : 'bg-slate-700'}`}></span>
                   STATUS: {status}
                </div>
                {status === DispatchStatus.ACTIVE ? (
                  <div className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] border-4 transition-all shadow-xl ${currentPersona === 'EMERGENCY' ? 'bg-red-600 border-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-green-600 border-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.4)]'}`}>
                    <span className={`w-3 h-3 rounded-full bg-white animate-ping`}></span>
                    ROLE: {currentPersona === 'EMERGENCY' ? 'EMERGENCY SPECIALIST' : 'SERVICE AGENT'}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] border-4 border-slate-700 text-slate-600 bg-transparent">
                    ROLE: STANDBY
                  </div>
                )}
              </div>

              <div className="relative mb-12 md:mb-20">
                <div 
                  className={`w-40 h-40 md:w-48 md:h-48 rounded-full bg-slate-900 flex items-center justify-center transition-all duration-150 border-4 md:border-8 border-white/10 ${status === DispatchStatus.ACTIVE ? 'shadow-[0_0_80px_-5px_rgba(249,115,22,0.6)]' : ''}`}
                  style={{ transform: status === DispatchStatus.ACTIVE ? `scale(${1.05 + volume * 0.15})` : 'scale(1)' }}
                >
                  {status === DispatchStatus.ACTIVE ? (
                    <div className="flex gap-2.5 items-end h-16">
                      {[1,2,3,4,5,6,7].map(i => (
                        <div 
                          key={i} 
                          className="w-2.5 bg-orange-500 rounded-full transition-all duration-100" 
                          style={{ 
                            height: `${20 + (volume * 80 * (1 - Math.abs(i-4)/4)) + (Math.random() * 10)}%`,
                            opacity: 0.7 + (volume * 0.3)
                          }}
                        ></div>
                      ))}
                    </div>
                  ) : (
                    <svg className="w-16 h-16 md:w-20 md:h-20 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                  )}
                </div>
              </div>

              <div className="w-full max-w-4xl px-4 mb-16 h-48 md:h-40 flex flex-col justify-center items-center text-center">
                 {!currentMsg && status === DispatchStatus.IDLE && (
                   <p className="text-slate-500 text-xl md:text-2xl font-black italic tracking-widest uppercase opacity-40">System Idle // Secure Line Ready</p>
                 )}
                 {status === DispatchStatus.CONNECTING && (
                   <div className="flex flex-col items-center gap-4">
                     <p className="text-orange-500 text-2xl md:text-3xl font-black animate-pulse tracking-tighter uppercase">Initializing GTA Dispatch Node...</p>
                     <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                       <div className="w-1/2 h-full bg-orange-500 animate-loading-bar"></div>
                     </div>
                   </div>
                 )}
                 {status === DispatchStatus.ACTIVE && currentMsg && (
                   <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                     <div className="flex items-center justify-center gap-3 mb-4">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-2 ${currentMsg.speaker === 'agent' ? 'border-orange-500 text-orange-400 bg-orange-500/10' : 'border-white text-white bg-white/10'}`}>
                          {currentMsg.speaker === 'agent' ? (currentPersona === 'EMERGENCY' ? 'EMERGENCY SPECIALIST' : 'SERVICE AGENT') : 'CUSTOMER'}
                        </span>
                        <div className="h-[2px] w-12 bg-white/10"></div>
                     </div>
                     <p className={`text-2xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tighter drop-shadow-2xl transition-colors duration-300 ${currentPersona === 'EMERGENCY' && currentMsg.speaker === 'agent' ? 'text-red-400' : 'text-white'}`}>
                       "{currentMsg.text}"
                     </p>
                   </div>
                 )}
              </div>

              <div className="flex flex-col sm:flex-row gap-6 md:gap-8 w-full justify-center items-center">
                {status === DispatchStatus.IDLE || status === DispatchStatus.ERROR ? (
                  <button 
                    onClick={startSession}
                    className="w-full sm:w-auto px-12 md:px-16 py-6 md:py-8 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-2xl md:rounded-3xl transition-all shadow-[0_25px_50px_-10px_rgba(249,115,22,0.8)] hover:shadow-[0_35px_60px_-10px_rgba(249,115,22,1)] uppercase tracking-[0.1em] text-2xl md:text-3xl flex items-center justify-center gap-6 hover:scale-105 active:scale-95 border-b-8 border-orange-700 hover:border-orange-600"
                  >
                    Launch Simulation
                    <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-8 w-full sm:w-auto">
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className={`px-8 md:px-12 py-6 md:py-8 rounded-2xl md:rounded-3xl border-4 transition-all shadow-2xl hover:scale-105 flex items-center justify-center gap-4 text-xl md:text-2xl font-black uppercase ${isMuted ? 'bg-red-600 border-red-500 text-white shadow-red-900/40 hover:bg-red-500 hover:shadow-red-500/50' : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:shadow-white/20'}`}
                    >
                      {isMuted ? (
                        <>UNMUTE <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.17l5.98 6zM4.41 2.86L3 4.27l6 6V11c0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c1.22-.17 2.36-.67 3.3-1.42l2.43 2.43 1.41-1.41L4.41 2.86z"></path></svg></>
                      ) : (
                        <>MUTE <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"></path><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"></path></svg></>
                      )}
                    </button>
                    <button 
                      onClick={stopSession}
                      className="px-12 md:px-16 py-6 md:py-8 bg-white text-navy font-black rounded-2xl md:rounded-3xl hover:bg-slate-50 transition-all uppercase tracking-[0.1em] text-xl md:text-2xl shadow-2xl hover:scale-105 active:scale-95 border-b-8 border-slate-300 hover:border-slate-400 hover:shadow-[0_25px_50px_-5px_rgba(255,255,255,0.3)]"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s infinite linear;
        }
      `}</style>
    </section>
  );
};

export default VoiceAgent;