"use client";

import { UploadCloud } from "lucide-react";
import { useRef } from "react";

interface AudioCaptureProps {
  onFileSelect: (file: File) => void;
}

function AudioCapture({ onFileSelect }: AudioCaptureProps) {
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) onFileSelect(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];

    if (file?.type.startsWith("audio/")) onFileSelect(file);
  };

  return (
    <button
      type="button"
      onClick={() => audioInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="hover:bg-muted/20 flex h-48 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors duration-150"
    >
      <UploadCloud className="text-muted-foreground size-10" />

      <span className="font-semibold">Upload Audio</span>

      <span className="text-muted-foreground text-sm">
        Drop a file here or click to browse (.wav only)
      </span>

      <input
        ref={audioInputRef}
        type="file"
        accept="audio/wav"
        onChange={handleChange}
        className="hidden"
      />
    </button>
  );
}

export default AudioCapture;
