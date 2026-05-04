"use client";

import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

interface AudioCaptureProps {
  onFileSelect: (file: File) => void;
}

function AudioCapture({ onFileSelect }: AudioCaptureProps) {
  const [error, setError] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelectFile = (file: File) => {
    setError(null);

    if (file.type !== "audio/wav") {
      setError("Only .wav files allowed.");
      return;
    }

    // 2MB comfortably covers 10s of WAV audio
    if (file.size > 2 * 1024 * 1024) {
      setError("Audio must be under 2MB.");
      return;
    }

    onFileSelect(file);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) validateAndSelectFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];

    if (file) validateAndSelectFile(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => audioInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="hover:bg-muted/20 focus-visible:ring-primary flex h-48 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
      >
        <UploadCloud className="text-muted-foreground size-10" />

        <span className="font-semibold">Upload/Drop Audio</span>

        <span className="text-muted-foreground text-sm">
          Supported format: .wav (max 10s)
        </span>

        <input
          ref={audioInputRef}
          type="file"
          accept="audio/wav"
          onChange={handleChange}
          className="hidden"
        />
      </button>

      {error && (
        <p className="text-destructive text-center text-sm font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

export default AudioCapture;
