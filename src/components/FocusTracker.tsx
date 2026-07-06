'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { motion, useDragControls } from 'framer-motion';
import { GripHorizontal, X, Maximize2 } from 'lucide-react';

export interface FocusDataPoint {
  timestamp: number;
  focused: boolean;
  emotion: string;
}

interface FocusTrackerProps {
  onDataUpdate: (data: FocusDataPoint) => void;
  isActive: boolean;
  onSnapshot?: (base64: string) => void;
}

export function FocusTracker({ onDataUpdate, isActive, onSnapshot }: FocusTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragControls = useDragControls();
  
  // Keep track of the latest onDataUpdate callback without triggering re-renders
  const onDataUpdateRef = useRef(onDataUpdate);
  useEffect(() => {
    onDataUpdateRef.current = onDataUpdate;
  }, [onDataUpdate]);

  // Load Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setIsLoaded(true);
      } catch (err) {
        console.error("Failed to load face-api models:", err);
      }
    };
    loadModels();
  }, []);

  // Start Camera
  useEffect(() => {
    let localStream: MediaStream | null = null;
    let isCancelled = false;

    if (isActive && isLoaded) {
      navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
        .then((mediaStream) => {
          if (isCancelled) {
            // The component unmounted while we were requesting the camera. Stop it immediately!
            mediaStream.getTracks().forEach(track => track.stop());
            return;
          }
          localStream = mediaStream;
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play().catch(err => console.error("Play error:", err));
          }
        })
        .catch(err => console.error("Camera error:", err));
    }

    return () => {
      isCancelled = true;
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
    };
  }, [isActive, isLoaded]);

  // Tracking Loop
  useEffect(() => {
    if (!isActive || !isLoaded || !videoRef.current) return;

    const interval = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        try {
          const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

        if (detection) {
          // Find dominant emotion
          const expressions = detection.expressions;
          const dominantEmotion = Object.keys(expressions).reduce((a, b) => 
            // @ts-ignore
            expressions[a] > expressions[b] ? a : b
          );

          // Simple head pose proxy: checking if the face bounding box is roughly centered/present
          const focused = detection.detection.score > 0.5;

          onDataUpdateRef.current({
            timestamp: Date.now(),
            focused,
            emotion: dominantEmotion
          });
        } else {
          // No face detected = completely distracted/looking away
          onDataUpdateRef.current({
            timestamp: Date.now(),
            focused: false,
            emotion: 'none'
          });
        }
        } catch (e) {
          console.error("Detection error:", e);
        }
      }
    }, 2000); // Check every 2 seconds to save CPU

    return () => clearInterval(interval);
  }, [isActive, isLoaded]);

  // Snapshot Loop
  const onSnapshotRef = useRef(onSnapshot);
  useEffect(() => {
    onSnapshotRef.current = onSnapshot;
  }, [onSnapshot]);

  useEffect(() => {
    if (!isActive || !isLoaded || !videoRef.current) return;

    const snapInterval = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState >= 2 && onSnapshotRef.current) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 160; // Low resolution for performance
          canvas.height = 120;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const base64 = canvas.toDataURL('image/jpeg', 0.4); // 40% quality JPEG
            onSnapshotRef.current(base64);
          }
        } catch (e) {
          console.error("Snapshot error:", e);
        }
      }
    }, 5000); // 5 seconds

    return () => clearInterval(snapInterval);
  }, [isActive, isLoaded]);

  if (!isActive) return null;

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        style={{ position: 'fixed', bottom: '1rem', right: '1rem', background: '#1e293b', color: '#fff', padding: '0.75rem', borderRadius: '50%', cursor: 'pointer', zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
        title="Show Camera"
      >
        <Maximize2 size={20} />
      </div>
    );
  }

  return (
    <motion.div 
      drag
      dragMomentum={false}
      dragControls={dragControls}
      dragListener={false}
      style={{ 
        position: 'fixed', 
        bottom: '1rem', 
        right: '1rem', 
        width: '128px', 
        background: '#000', 
        borderRadius: '0.5rem', 
        overflow: 'hidden', 
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', 
        zIndex: 50,
      }}
    >
      {/* Drag Handle */}
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        style={{ width: '100%', height: '24px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'grab', touchAction: 'none', padding: '0 0.5rem' }}
      >
        <div style={{ width: '14px' }} /> {/* Spacer */}
        <GripHorizontal size={16} color="#94a3b8" />
        <button 
          onClick={() => setIsMinimized(true)} 
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking close
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ width: '100%', height: '96px', position: 'relative' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onLoadedMetadata={() => {
            if (videoRef.current) videoRef.current.play().catch(console.error);
          }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {!isLoaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#fff', background: 'rgba(0,0,0,0.8)' }}>
            Loading AI...
          </div>
        )}
      </div>
    </motion.div>
  );
}
