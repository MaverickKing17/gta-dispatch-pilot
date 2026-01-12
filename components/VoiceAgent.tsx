
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
    // Basic persona detection logic for UI feedback
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
      {/* HUD Marker */}
      <div className="absolute top-12 right-12 hidden lg:block">
        <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-5 text-xs text-slate-500 font-black font-mono shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            VAPI_WEB_WIDGET_PLACEHOLDER [OFF]
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            GEMINI_LIVE_NATIVE [ACTIVE]
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-navy mb-6 tracking-tight">Experience the AI Dispatcher Live</h2>
            <p className="text-xl text-slate-700 font-bold max-w-2xl mx-auto leading-relaxed">
              Test our specialized safety logic. Mention a <strong>"gas leak"</strong> to trigger Sam's emergency protocol, 
              or ask about <strong>"rebates"</strong> for Chloe's qualification workflow.
            </p>
          </div>

          <div className="bg-navy rounded-[3rem] p-10 md:p-20 shadow-2xl relative overflow-hidden border-4 border-white/10">
            {/* Visualizer Ring - Larger and more defined */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className={`transition-all duration-700 w-[40rem] h-[40rem] border-2 border-orange-500/10 rounded-full ${status === DispatchStatus.ACTIVE ? 'scale-125 opacity-100' : 'scale-100 opacity-0'}`}></div>
               <div className={`transition-all duration-1000 w-[50rem] h-[50rem] border border-orange-500/5 rounded-full ${status === DispatchStatus.ACTIVE ? 'scale-125 opacity-100' : 'scale-100 opacity-0'}`}></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              {/* Status Header */}
              <div className="flex flex-wrap justify-center items-center gap-4 mb-14">
                <div className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border-2 transition-all shadow-lg ${status === DispatchStatus.ACTIVE ? 'bg-orange-500 border-orange-400 text-white' : 'bg-transparent border-slate-700 text-slate-500'}`}>
                  SYSTEM: {status}
                </div>
                {status === DispatchStatus.ACTIVE && (
                  <div className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border-2 border-white/30 text-white flex items-center gap-3 bg-white/5 shadow-lg`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${currentPersona === 'SAM' ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]'}`}></span>
                    ACTIVE AGENT: {currentPersona}
                  </div>
                )}
              </div>

              {/* Central Audio Orbit */}
              <div className="relative mb-16">
                <div className={`w-40 h-40 rounded-full bg-slate-900 flex items-center justify-center transition-all duration-500 border-4 border-white/5 ${status === DispatchStatus.ACTIVE ? 'shadow-[0_0_80px_-10px_rgba(249,115,22,0.6)] scale-110' : ''}`}>
                  {status === DispatchStatus.ACTIVE ? (
                    <div className="flex gap-2 items-end h-12">
                      {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="w-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.12}s`, height: `${Math.random() * 100}%` }}></div>
                      ))}
                    </div>
                  ) : (
                    <svg className="w-16 h-16 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                  )}
                </div>
              </div>

              {/* Dynamic Subtitle - Bolder font */}
              <div className="text-center mb-14 h-24 max-w-2xl px-4">
                 {status === DispatchStatus.IDLE && <p className="text-slate-400 text-xl font-bold">System standby. Click below to begin the official pilot simulation.</p>}
                 {status === DispatchStatus.CONNECTING && <p className="text-orange-400 text-xl font-black animate-pulse tracking-tight uppercase">Establishing GTA Dispatch Node Link...</p>}
                 {status === DispatchStatus.ACTIVE && transcriptions.length > 0 && (
                   <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <span className="text-orange-400 font-black uppercase text-sm block mb-3 tracking-widest drop-shadow-sm">{transcriptions[transcriptions.length-1].speaker}:</span>
                     <p className="text-white text-2xl font-black leading-tight tracking-tight">
                       "{transcriptions[transcriptions.length-1].text}"
                     </p>
                   </div>
                 )}
              </div>

              {/* Controls - Visibly much clearer */}
              <div className="flex flex-col sm:flex-row gap-6 w-full justify-center items-center">
                {status === DispatchStatus.IDLE || status === DispatchStatus.ERROR ? (
                  <button 
                    onClick={startSession}
                    className="w-full sm:w-auto px-16 py-7 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl transition-all shadow-2xl shadow-orange-500/40 uppercase tracking-wide text-2xl flex items-center justify-center gap-4 hover:scale-105 active:scale-95 ring-4 ring-orange-500/20 border-t-4 border-orange-400"
                  >
                    Launch Pilot Dispatcher
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </button>
                ) : (
                  <div className="flex gap-6 w-full sm:w-auto">
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className={`flex-1 sm:flex-none p-7 rounded-2xl border-4 transition-all shadow-xl hover:scale-105 ${isMuted ? 'bg-red-600 border-red-500 text-white shadow-red-900/40' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}`}
                      title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                    >
                      {isMuted ? (
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.17l5.98 6zM4.41 2.86L3 4.27l6 6V11c0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c1.22-.17 2.36-.67 3.3-1.42l2.43 2.43 1.41-1.41L4.41 2.86z"></path></svg>
                      ) : (
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"></path><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"></path></svg>
                      )}
                    </button>
                    <button 
                      onClick={stopSession}
                      className="flex-1 sm:flex-none px-12 py-7 bg-white text-navy font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-wide text-xl shadow-xl hover:scale-105 active:scale-95"
                    >
                      End Connection
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Visual HUD line */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VoiceAgent;
