"use client";

import { SAMPLE_VOICES } from "~/lib/constants";
import AudioInput from "../AudioInput";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Pause, Play } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import useAudioPlayer from "~/hooks/useAudioPlayer";

export interface Voice {
  id: string;
  name: string;
  flag: string;
  accent: string;
  tags: string[];
  r2Key: string;
  audioSrc: string;
}

interface SampleVoiceCardProps {
  voice: Voice;
  isPlaying: boolean;
  onTogglePlay: (voice: Voice) => void;
  onSelect: (voice: Voice) => void;
}

interface SampleVoiceModalProps {
  isOpen: boolean;
  onOpenStateChange: (isOpen: boolean) => void;
  onVoiceSelected: (voice: Voice) => void;
  onAudioUploaded: (file: File) => void;
}

function SampleVoiceCard({
  voice,
  isPlaying,
  onTogglePlay,
  onSelect,
}: SampleVoiceCardProps) {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onTogglePlay(voice);
  };

  return (
    <div
      role="button"
      onClick={() => onSelect(voice)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSelect(voice);
        }
      }}
      className="focus-within:ring-primary flex w-52 flex-col gap-2 rounded-lg border p-4 transition-all focus-within:shadow-md focus-within:ring-2 focus-within:outline-none hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
          Public
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClick}
              aria-label={isPlaying ? "Pause audio" : "Play audio"}
              className="rounded-full"
            >
              {isPlaying ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
            </Button>
          </TooltipTrigger>

          <TooltipContent>{isPlaying ? "Pause" : "Play"}</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-col">
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="font-emoji text-base">{voice.flag}</span>
          <span>{voice.name}</span>
        </span>

        <span className="text-muted-foreground text-xs">
          {voice.tags.join(", ")}
        </span>
      </div>
    </div>
  );
}

function SampleVoiceModal({
  isOpen,
  onOpenStateChange,
  onVoiceSelected,
  onAudioUploaded,
}: SampleVoiceModalProps) {
  const { audioSrc, togglePlay } = useAudioPlayer();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenStateChange}>
      <DialogContent className="mx-4 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pick a voice</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="glent-library">
          <TabsList>
            <TabsTrigger type="button" value="my-voices">
              My Voices
            </TabsTrigger>

            <TabsTrigger type="button" value="glent-library">
              Glent Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-voices" className="p-4">
            <AudioInput
              onAudioReady={(audioBlob: Blob) => {
                const file = new File([audioBlob], "custom_voice.wav", {
                  type: audioBlob.type,
                });
                onAudioUploaded(file);
                onOpenStateChange(false);
              }}
            />
          </TabsContent>

          <TabsContent
            value="glent-library"
            className="flex max-h-[60vh] flex-wrap gap-4 overflow-y-auto p-4"
          >
            {SAMPLE_VOICES.map((voice) => (
              <SampleVoiceCard
                key={voice.id}
                voice={voice}
                isPlaying={audioSrc === voice.audioSrc}
                onSelect={(voice: Voice) => {
                  onVoiceSelected(voice);
                }}
                onTogglePlay={(voice: Voice) => {
                  void togglePlay(voice.audioSrc);
                }}
              />
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default SampleVoiceModal;
