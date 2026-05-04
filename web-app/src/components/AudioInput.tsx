"use client";

import { useEffect, useRef, useState } from "react";
import AudioCapture from "./AudioCapture";
import { toast } from "sonner";
import { getAudioDuration } from "~/lib/utils";
import { Button } from "./ui/button";
import { Mic, StopCircle } from "lucide-react";
import { MAX_AUDIO_DURATION_SECS } from "~/lib/constants";

interface AudioInputProps {
  onAudioReady: (audioBlob: Blob) => void;
}

function AudioInput({ onAudioReady }: AudioInputProps) {
  const [audioSrcUrl, setAudioSrcUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);

  const handleAudioFileSelect = async (file: File) => {
    try {
      const duration = await getAudioDuration(file);

      if (duration > MAX_AUDIO_DURATION_SECS) {
        toast.error(
          `Audio duration must be ${MAX_AUDIO_DURATION_SECS} secs or less.`,
        );
        return;
      }

      setAudioSrcUrl(URL.createObjectURL(file));
      setAudioBlob(file);
    } catch (error) {
      console.error("Failed to select audio file:", error);
      toast.error("Audio selection failed! Try again.");
    }
  };

  const startRecording = async () => {
    setAudioSrcUrl(null);
    audioChunksRef.current = [];

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const audioRecorder = new MediaRecorder(audioStream);
      audioRecorderRef.current = audioRecorder;

      audioRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      audioRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioSrcUrl(url);
      };

      audioRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start audio recording:", error);
      toast.error("Failed to start recording. Please check mic availability.");
    }
  };

  const stopRecording = async () => {
    if (audioRecorderRef.current?.state === "recording") {
      audioRecorderRef.current.stop();
    }

    setIsRecording(false);
  };

  // Update recording time; auto-stop at MAX_AUDIO_DURATION_SECS
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRecording) {
      timer = setInterval(() => {
        setRecordTime((prev) => {
          if (prev + 1 >= MAX_AUDIO_DURATION_SECS) {
            stopRecording();

            return MAX_AUDIO_DURATION_SECS;
          }

          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordTime(0);
    }

    return () => clearInterval(timer);
  }, [isRecording, setRecordTime, stopRecording]);

  const handleUseAudio = () => {
    if (audioBlob) {
      onAudioReady(audioBlob);
    }
  };

  const maxLabel = String(MAX_AUDIO_DURATION_SECS).padStart(2, "0");

  return (
    <div className="flex flex-col gap-4">
      {audioSrcUrl ? (
        <div className="flex flex-col items-center gap-2">
          <audio src={audioSrcUrl} controls className="w-full" />

          <Button
            type="button"
            size="lg"
            onClick={handleUseAudio}
            className="w-full"
          >
            Use this audio
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => {
              setAudioBlob(null);
              setAudioSrcUrl(null);
            }}
            className="w-full"
          >
            Record again
          </Button>
        </div>
      ) : (
        <>
          <AudioCapture onFileSelect={handleAudioFileSelect} />

          <div className="relative flex items-center gap-4">
            <div className="border-muted-foreground/40 grow border-t" />
            <span className="text-muted-foreground shrink text-sm">OR</span>
            <div className="border-muted-foreground/40 grow border-t" />
          </div>

          {isRecording ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-muted-foreground text-xs">
                Recording... 00:{String(recordTime).padStart(2, "0")} / 00:
                {maxLabel}
              </span>

              <Button
                variant="destructive"
                size="lg"
                onClick={stopRecording}
                className="w-full"
              >
                <StopCircle className="size-4" />
                Stop recording
              </Button>
            </div>
          ) : (
            <Button variant="secondary" size="lg" onClick={startRecording}>
              <Mic className="size-4" />
              Record audio
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export default AudioInput;
