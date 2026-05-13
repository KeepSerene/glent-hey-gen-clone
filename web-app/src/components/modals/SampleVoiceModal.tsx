"use client";

import { SAMPLE_VOICES } from "~/lib/constants";
import AudioInput from "../audio/AudioInput";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Pause, Play } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import useAudioPlayer from "~/hooks/useAudioPlayer";
import { cn } from "~/lib/utils";

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
      className={cn(
        "group focus-within:ring-primary bg-card relative flex w-full cursor-pointer flex-col gap-4 overflow-hidden rounded-[20px] border p-5 transition-all duration-300 ease-out focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-none sm:w-60",
        isPlaying
          ? "border-primary/40 bg-primary/5 shadow-sm"
          : "hover:border-primary/30 hover:shadow-md",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="border-primary/20 bg-primary/10 text-primary rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase">
          Library
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClick}
              aria-label={isPlaying ? "Pause audio" : "Play audio"}
              className={cn("size-8 rounded-full transition-colors", {
                "bg-primary/20 text-primary": isPlaying,
              })}
            >
              {isPlaying ? (
                <Pause className="size-4 fill-current" />
              ) : (
                <Play className="size-4 fill-current" />
              )}
            </Button>
          </TooltipTrigger>

          <TooltipContent>{isPlaying ? "Pause" : "Play"}</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-foreground font-heading flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="font-emoji text-xl leading-none">{voice.flag}</span>
          <span>{voice.name}</span>
        </span>

        <span className="text-muted-foreground line-clamp-2 text-xs leading-relaxed font-medium">
          {voice.tags.join(" • ")}
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
      <DialogContent className="overflow-hidden sm:max-w-3xl">
        {/* Accent glow */}
        <div
          aria-hidden
          className="bg-accent pointer-events-none absolute -top-24 -left-24 z-0 size-100 rounded-full opacity-[0.28] blur-[70px] dark:opacity-[0.32]"
        />

        <div className="relative z-10">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              Pick a voice
            </DialogTitle>

            <DialogDescription className="text-muted-foreground text-sm">
              Record or upload your own audio, or select a pre-made voice from
              our library.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="glent-library">
            <TabsList className="mb-4">
              <TabsTrigger type="button" value="my-voices">
                My Voices
              </TabsTrigger>

              <TabsTrigger type="button" value="glent-library">
                Glent Library
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-voices" className="p-2">
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
              className="flex max-h-[50vh] flex-wrap gap-4 overflow-y-auto px-1 pt-1 pb-4"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SampleVoiceModal;
