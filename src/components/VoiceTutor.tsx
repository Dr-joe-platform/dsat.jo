"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Square, Loader2, PhoneCall } from 'lucide-react';
import { VoiceCallOverlay } from '@/components/VoiceCallOverlay';

interface VoiceTutorProps {
  explanationText: string;
}

export default function VoiceTutor({ explanationText }: VoiceTutorProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [tutorResponse, setTutorResponse] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showLiveCall, setShowLiveCall] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
          handleAskAI(text);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    
    return () => stopSpeaking();
  }, [explanationText]);

  // Reset tutor state when the question/explanation changes
  useEffect(() => {
    setTranscript('');
    setTutorResponse('');
    setIsListening(false);
    stopSpeaking();
  }, [explanationText]);

  const handleAskAI = async (question: string) => {
    if (!question.trim()) return;
    setProcessing(true);
    setTutorResponse('');
    
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `You are an AI SAT tutor. You are explaining a question to the student. The official explanation is: "${explanationText}". Keep your answer brief and conversational, as it will be spoken out loud.` },
            { role: 'user', content: question }
          ]
        })
      });
      const data = await res.json();
      if (data.reply) {
        setTutorResponse(data.reply);
        speak(data.reply);
      } else {
        setTutorResponse("Sorry, I couldn't process that.");
      }
    } catch (e) {
      console.error(e);
      setTutorResponse("Connection error.");
    }
    setProcessing(false);
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (isSpeaking) stopSpeaking();
      setTranscript('');
      setTutorResponse('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    stopSpeaking();
    
    // Attempt to remove LaTeX commands for speech
    let cleanText = text.replace(/\\\w+/g, '').replace(/[\$\{\}]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // slightly higher pitch for friendlier tutor tone
    
    utterance.onend = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current?.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mt-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 tracking-tight">
          <Volume2 className="w-5 h-5 text-indigo-500" /> Voice Tutor
        </h4>
        
        <div className="flex gap-2">
          {isSpeaking && (
            <button 
              onClick={stopSpeaking} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs font-bold transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> Stop
            </button>
          )}
          <button 
            onClick={() => setShowLiveCall(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" /> Live Call
          </button>
          <button 
            onClick={toggleListen} 
            className={`flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-xs font-bold shadow-sm transition-all ${
              isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {isListening ? (
              <><MicOff className="w-3.5 h-3.5" /> Listening...</>
            ) : (
              <><Mic className="w-3.5 h-3.5" /> Ask a Question</>
            )}
          </button>
        </div>
      </div>

      {showLiveCall && <VoiceCallOverlay onClose={() => setShowLiveCall(false)} />}

      {transcript && (
        <div className="bg-indigo-100/50 p-3 rounded-xl text-sm font-medium text-indigo-900 mb-3 italic">
          "{transcript}"
        </div>
      )}

      {processing && (
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 mt-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
        </div>
      )}

      {tutorResponse && (
        <div className="bg-white border border-slate-200 p-4 rounded-xl text-sm font-medium text-slate-700 leading-relaxed shadow-sm mt-3">
          {tutorResponse}
        </div>
      )}
    </div>
  );
}
