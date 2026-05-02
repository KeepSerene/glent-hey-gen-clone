"use client";

import { useState } from "react";
import AudioCapture from "./AudioCapture";
import { toast } from "sonner";

interface AudioInputProps {
  onAudioReady: (audioBlob: Blob) => void;
}

function AudioInput({ onAudioReady }: AudioInputProps) {
  const [audioSrcUrl, setAudioSrcUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const handleAudioFileSelect = async (file: File) => {
    try {
    } catch (error) {
      console.error("Failed to select audio file:", error);
      toast.error("Audio selection failed! Try again.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {audioSrcUrl ? (
        <></>
      ) : (
        <>
          <AudioCapture onFileSelect={handleAudioFileSelect} />
        </>
      )}
    </div>
  );
}

export default AudioInput;
