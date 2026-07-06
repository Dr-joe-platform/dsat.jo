"use client";

import React, { useRef, useState } from 'react';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  buttonText?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ImageUploader({ onUpload, buttonText = "Add Image", className, style }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      alert("Please select an image file.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`/api/upload-image`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        onUpload(data.url);
      } else {
        throw new Error(data.error || "Unknown Error");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Failed to upload image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.375rem 0.75rem',
          background: '#f1f5f9',
          border: '1px solid #cbd5e1',
          borderRadius: '0.375rem',
          fontSize: '0.75rem',
          fontWeight: '600',
          color: '#475569',
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.7 : 1,
          ...style
        }}
      >
        {uploading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ImageIcon size={14} />}
        {uploading ? 'Uploading...' : buttonText}
      </button>
    </>
  );
}
