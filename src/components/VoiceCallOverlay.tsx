'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, PhoneOff, Loader2, Volume2, Sparkles } from 'lucide-react';

type CallState = 'idle' | 'listening' | 'thinking' | 'speaking';

export function VoiceCallOverlay({ onClose }: { onClose: () => void }) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [history, setHistory] = useState<any[]>([]);
  const [transcript, setTranscript] = useState('');
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  useEffect(() => {
    // Try to pre-load voices to ensure Arabic is available
    if (synth) {
      synth.getVoices();
    }
    return () => {
      if (synth) synth.cancel();
    };
  }, [synth]);

  const speakText = (text: string) => {
    if (!synth) return;
    synth.cancel(); // Stop any current speech

    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find an Arabic voice
    const voices = synth.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar')) || voices[0];
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }
    
    utterance.lang = 'ar-EG'; // Request Egyptian Arabic
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setCallState('speaking');
    utterance.onend = () => setCallState('idle');

    synth.speak(utterance);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop()); // Clean up mic
      };

      recorder.start();
      setCallState('listening');
      if (synth) synth.cancel(); // Stop AI if speaking
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('من فضلك اسمح باستخدام المايكروفون عشان تقدر تتكلم معايا!');
      setCallState('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setCallState('thinking');
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // 1. Transcribe Audio
      const formData = new FormData();
      formData.append('file', audioBlob);

      const transcribeRes = await fetch('/api/ai-voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeRes.ok) throw new Error('Transcription failed');
      const { text } = await transcribeRes.json();
      setTranscript(text);

      if (!text || text.trim() === '') {
        setCallState('idle');
        return;
      }

      // 2. Get LLM Reply
      const chatRes = await fetch('/api/ai-voice/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationHistory: history }),
      });

      if (!chatRes.ok) throw new Error('Chat failed');
      const { reply, history: newHistory } = await chatRes.json();
      
      setHistory(newHistory);
      
      // 3. Speak Reply
      speakText(reply);

    } catch (error) {
      console.error('Processing error:', error);
      speakText("معلش يا بطل، الصوت قطع عندي. ممكن تعيد اللي قلته؟");
      setCallState('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
      <div className="bg-slate-900/90 border border-slate-700 w-full max-w-sm rounded-[3rem] p-8 flex flex-col items-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
        
        {/* Background Glow Animation based on state */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none transition-colors duration-500">
          {callState === 'listening' && (
            <div className="w-72 h-72 bg-emerald-500 rounded-full blur-[80px] animate-pulse" />
          )}
          {callState === 'thinking' && (
            <div className="w-72 h-72 bg-indigo-500 rounded-full blur-[80px] animate-pulse" />
          )}
          {callState === 'speaking' && (
            <div className="w-72 h-72 bg-purple-500 rounded-full blur-[80px] animate-pulse" />
          )}
        </div>

        <div className="z-10 w-full flex flex-col items-center">
          
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-black text-white mb-1 tracking-tight">شادي</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-10 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            {callState === 'idle' && 'Ready'}
            {callState === 'listening' && 'Listening...'}
            {callState === 'thinking' && 'Thinking...'}
            {callState === 'speaking' && 'Speaking...'}
          </p>

          {/* User Transcript display */}
          <div className="h-16 flex items-center justify-center w-full text-center px-4 mb-8">
            <p className="text-slate-300 text-sm italic font-medium">
              {callState === 'thinking' ? `"${transcript}"` : ''}
            </p>
          </div>

          <div className="flex items-center gap-6 mb-12">
            {callState === 'idle' || callState === 'speaking' ? (
              <button
                onClick={startRecording}
                className="w-20 h-20 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
              >
                <Mic className="w-8 h-8 text-white" />
              </button>
            ) : callState === 'listening' ? (
              <button
                onClick={stopRecording}
                className="w-20 h-20 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
              >
                <div className="w-6 h-6 bg-white rounded-sm animate-pulse" />
              </button>
            ) : (
              <div className="w-20 h-20 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center shadow-xl">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>

          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8 text-center">
            {callState === 'idle' && 'Tap to speak'}
            {callState === 'listening' && 'Tap to send'}
            {callState === 'speaking' && 'Tap to interrupt'}
          </p>

          {/* End Call Button */}
          <button
            onClick={() => {
              if (synth) synth.cancel();
              onClose();
            }}
            className="w-14 h-14 bg-red-500/20 hover:bg-red-500 border border-red-500/50 hover:border-red-500 rounded-full flex items-center justify-center shadow-lg transition-all text-red-500 hover:text-white"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
