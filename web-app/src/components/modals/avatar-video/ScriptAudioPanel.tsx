"use client";

import { Pause, Play, Trash2 } from "lucide-react";
import type { RefObject } from "react";
import { MAX_SCRIPT_LENGTH } from "~/lib/constants";
import { cn } from "~/lib/utils";
import type { Voice } from "~/components/modals/SampleVoiceModal";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import VoiceIndicator from "./VoiceIndicator";

interface ScriptAudioPanelProps {
  // ── Audio-file mode ──────────────────────────
  selectedAudioUrl: string | null;
  selectedAudioTitle: string;
  isAudioPlaying: boolean;
  audioRef: RefObject<HTMLAudioElement | null>;
  onAudioPlayPause: () => void;
  onAudioRemove: () => void;
  onAudioPlayStateChange: (playing: boolean) => void;

  // ── Script / TTS mode ────────────────────────────────────────────────────
  script: string;
  onScriptChange: (value: string) => void;
  onOpenAudioInputModal: () => void;

  // ── Voice indicator ─────────────────
  userAudioFile: File | null;
  userAudioUrl: string | null;
  selectedVoice: Voice | null;
  /** Currently playing src from the shared useAudioPlayer hook. */
  activeAudioSrc: string | null;
  onToggleVoicePlay: (src: string) => void;
  onOpenVoiceModal: () => void;
}

function ScriptAudioPanel({
  selectedAudioUrl,
  selectedAudioTitle,
  isAudioPlaying,
  audioRef,
  onAudioPlayPause,
  onAudioRemove,
  onAudioPlayStateChange,
  script,
  onScriptChange,
  onOpenAudioInputModal,
  userAudioFile,
  userAudioUrl,
  selectedVoice,
  activeAudioSrc,
  onToggleVoicePlay,
  onOpenVoiceModal,
}: ScriptAudioPanelProps) {
  // ── Audio file selected ─────────────────────────
  if (selectedAudioUrl) {
    return (
      <div className="bg-muted flex items-center gap-3 rounded-lg p-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onAudioPlayPause}
              aria-label={isAudioPlaying ? "Pause audio" : "Play audio"}
              className="rounded-full"
            >
              {isAudioPlaying ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
            </Button>
          </TooltipTrigger>

          <TooltipContent>{isAudioPlaying ? "Pause" : "Play"}</TooltipContent>
        </Tooltip>

        <p className="grow truncate text-sm font-medium">
          {selectedAudioTitle}
        </p>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={onAudioRemove}
              aria-label="Remove audio"
              className="rounded-full"
            >
              <Trash2 className="size-4" />
            </Button>
          </TooltipTrigger>

          <TooltipContent>Remove</TooltipContent>
        </Tooltip>

        <audio
          ref={audioRef}
          src={selectedAudioUrl}
          onPlay={() => onAudioPlayStateChange(true)}
          onPause={() => onAudioPlayStateChange(false)}
          onEnded={() => onAudioPlayStateChange(false)}
          className="hidden"
        />
      </div>
    );
  }

  // ── Script mode — textarea + floating toolbar ─────────────────────────────
  return (
    <>
      <Textarea
        value={script}
        onChange={(e) => onScriptChange(e.target.value)}
        rows={10}
        maxLength={MAX_SCRIPT_LENGTH}
        placeholder="Type your script here,"
        className="placeholder:text-muted-foreground/70 min-h-32 resize-none break-all"
      />

      <Button
        type="button"
        variant="link"
        size="sm"
        onClick={onOpenAudioInputModal}
        className={cn(
          "absolute top-7 left-0.5 text-base lg:top-0.75 lg:left-36",
          { hidden: script },
        )}
      >
        upload or record audio
      </Button>

      {/* Bottom toolbar: voice badge + char counter */}
      <div className="absolute bottom-2 flex w-full flex-col gap-2 px-3">
        <div className="mt-2 flex items-center justify-between gap-2">
          <VoiceIndicator
            userAudioFile={userAudioFile}
            userAudioUrl={userAudioUrl}
            selectedVoice={selectedVoice}
            activeAudioSrc={activeAudioSrc}
            onTogglePlay={onToggleVoicePlay}
            onOpenVoiceModal={onOpenVoiceModal}
          />

          <p className="text-muted-foreground/70 text-xs select-none">
            {script.length} / {MAX_SCRIPT_LENGTH} (~10 sec audio)
          </p>
        </div>
      </div>
    </>
  );
}

export default ScriptAudioPanel;
