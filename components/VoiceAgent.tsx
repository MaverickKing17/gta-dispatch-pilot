
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { 
  createBlob, 
  decode, 
  decodeAudioData, 
  controlDispatchFunctionDeclaration,
  encode
} from '../services/geminiLiveService';
import { DispatchStatus, TranscriptionItem } from '../types';
import { SYSTEM_INSTRUCTION, COLORS, WEBHOOK_URL, BOOKING_URL } from '../constants';

const VoiceAgent: React.FC = () => {
  const [status, setStatus] = useState<DispatchStatus>(DispatchStatus.IDLE);
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<'CHLOE' | 'SAM'>('CHLOE');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const addTranscription = (speaker: 'user' | 'agent', text: string) => {
    if (speaker === 'agent') {
      const lowerText = text.toLowerCase();
      if (lowerText.includes('sam') || lowerText.includes('emergency') || lowerText.includes('urgent')) {
        setCurrentPersona('SAM');
      } else if (lowerText.includes('chloe') || lowerText.includes('rebate') || lowerText.includes('welcome')) {
        setCurrentPersona('CHLOE');
      }
    }

    setTranscriptions(prev => [
      ...prev.slice(-5),
      { speaker, text, timestamp: new Date() }
    ]);
  };

  const stopSession = useCallback(() => {
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
    setCurrentPersona('CHLOE');
  }, []);

  const startSession = async () => {
    try {
      setStatus(DispatchStatus.CONNECTING);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputContextRef.current = outputCtx;

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
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
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
            if (base64Audio && outputCtx) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
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

  return (
    <section id="demo" className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-7xl font-black text-navy mb-8 tracking-tighter leading-tight">Experience the AI Dispatcher Live</h2>
            <p className="text-2xl text-slate-800 font-bold max-w-2xl mx-auto leading-relaxed">
              Test our specialized safety logic. Mention a <span className="text-red-600 font-black">"gas leak"</span> to trigger Sam's emergency protocol, 
              or ask about <span className="text-orange-600 font-black">"rebates"</span> for Chloe's qualification workflow.
            </p>
          </div>

          <div className="bg-navy rounded-[4rem] p-12 md:p-24 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden border-8 border-white/5">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className={`transition-all duration-700 w-[45rem] h-[45rem] border-4 border-orange-500/20 rounded-full ${status === DispatchStatus.ACTIVE ? 'scale-125 opacity-100' : 'scale-100 opacity-0'}`}></div>
               <div className={`transition-all duration-1000 w-[55rem] h-[55rem] border-2 border-orange-500/10 rounded-full ${status === DispatchStatus.ACTIVE ? 'scale-125 opacity-100' : 'scale-100 opacity-0'}`}></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex flex-wrap justify-center items-center gap-6 mb-16">
                <div className={`px-8 py-3 rounded-full text-sm font-black uppercase tracking-[0.2em] border-4 transition-all shadow-2xl ${status === DispatchStatus.ACTIVE ? 'bg-orange-500 border-orange-400 text-white' : 'bg-transparent border-slate-700 text-slate-500'}`}>
                  STATUS: {status}
                </div>
                {status === DispatchStatus.ACTIVE && (
                  <div className={`px-8 py-3 rounded-full text-sm font-black uppercase tracking-[0.2em] border-4 border-white/40 text-white flex items-center gap-4 bg-white/10 shadow-2xl`}>
                    <span className={`w-4 h-4 rounded-full ${currentPersona === 'SAM' ? 'bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,1)]' : 'bg-green-400 shadow-[0_0_15px_rgba(74,222,128,1)]'}`}></span>
                    ACTIVE AGENT: {currentPersona}
                  </div>
                )}
              </div>

              <div className="relative mb-20">
                <div className={`w-48 h-48 rounded-full bg-slate-900 flex items-center justify-center transition-all duration-500 border-8 border-white/10 ${status === DispatchStatus.ACTIVE ? 'shadow-[0_0_100px_-10px_rgba(249,115,22,0.8)] scale-110' : ''}`}>
                  {status === DispatchStatus.ACTIVE ? (
                    <div className="flex gap-2.5 items-end h-16">
                      {[1,2,3,4,5,6,7].map(i => (
                        <div key={i} className="w-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s`, height: `${Math.random() * 100}%` }}></div>
                      ))}
                    </div>
                  ) : (
                    <svg className="w-20 h-20 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                  )}
                </div>
              </div>

              <div className="text-center mb-16 h-32 max-w-3xl px-6 flex flex-col justify-center">
                 {status === DispatchStatus.IDLE && <p className="text-slate-400 text-2xl font-black italic tracking-tight uppercase opacity-60">System Standby // Press to Launch</p>}
                 {status === DispatchStatus.CONNECTING && <p className="text-orange-500 text-3xl font-black animate-pulse tracking-tighter uppercase">Initializing GTA Dispatch Uplink...</p>}
                 {status === DispatchStatus.ACTIVE && transcriptions.length > 0 && (
                   <div className="animate-in fade-in zoom-in duration-500">
                     <span className="text-orange-500 font-black uppercase text-base block mb-4 tracking-[0.3em] drop-shadow-lg">{transcriptions[transcriptions.length-1].speaker}:</span>
                     <p className="text-white text-3xl md:text-4xl font-black leading-tight tracking-tighter drop-shadow-xl">
                       "{transcriptions[transcriptions.length-1].text}"
                     </p>
                   </div>
                 )}
              </div>

              <div className="flex flex-col sm:flex-row gap-8 w-full justify-center items-center">
                {status === DispatchStatus.IDLE || status === DispatchStatus.ERROR ? (
                  <button 
                    onClick={startSession}
                    className="w-full sm:w-auto px-16 py-8 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-3xl transition-all shadow-[0_25px_50px_-10px_rgba(249,115,22,0.8)] uppercase tracking-[0.1em] text-3xl flex items-center justify-center gap-6 hover:scale-105 active:scale-95 border-b-8 border-orange-700"
                  >
                    Launch Pilot Dispatcher
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-8 w-full sm:w-auto">
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className={`px-12 py-8 rounded-3xl border-4 transition-all shadow-2xl hover:scale-105 flex items-center justify-center gap-4 text-2xl font-black uppercase ${isMuted ? 'bg-red-600 border-red-500 text-white shadow-red-900/40' : 'bg-white/10 border-white/30 text-white hover:bg-white/20'}`}
                    >
                      {isMuted ? 'Unmute' : 'Mute'}
                      {isMuted ? (
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.17l5.98 6zM4.41 2.86L3 4.27l6 6V11c0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c1.22-.17 2.36-.67 3.3-1.42l2.43 2.43 1.41-1.41L4.41 2.86z"></path></svg>
                      ) : (
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"></path><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"></path></svg>
                      )}
                    </button>
                    <button 
                      onClick={stopSession}
                      className="px-16 py-8 bg-white text-navy font-black rounded-3xl hover:bg-slate-100 transition-all uppercase tracking-[0.1em] text-2xl shadow-2xl hover:scale-105 active:scale-95 border-b-8 border-slate-300"
                    >
                      End Connection
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VoiceAgent;
