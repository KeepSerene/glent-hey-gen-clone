"use client";

import { AlertTriangle, Pause, Play, Trash2 } from "lucide-react"; // <-- Added AlertTriangle
import type { RefObject } from "react";
import { MAX_SCRIPT_LENGTH, MIN_SCRIPT_LENGTH } from "~/lib/constants";
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
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-100 p-3.5 text-sm text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-500" />

          <p className="text-xs sm:text-sm sm:leading-relaxed">
            <strong>Important:</strong> Audio must be in{" "}
            <strong>English</strong>. Other languages may break lip-sync and
            waste credits.
          </p>
        </div>

        <div className="bg-muted border-border/50 flex items-center gap-3 rounded-xl border p-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={onAudioPlayPause}
                aria-label={isAudioPlaying ? "Pause audio" : "Play audio"}
                className="rounded-full shadow-sm hover:shadow-md"
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
                className="rounded-full shadow-sm"
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
      </div>
    );
  }

  const isScriptLongEnough = script.trim().length >= MIN_SCRIPT_LENGTH;

  // ── Script mode — textarea + floating toolbar ─────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-500" />

        <p className="text-xs sm:text-sm sm:leading-relaxed">
          <strong>Important:</strong> Script must be in <strong>English</strong>
          . Other languages may break lip-sync and waste credits.
        </p>
      </div>

      <div className="relative">
        <Textarea
          value={script}
          onChange={(e) => onScriptChange(e.target.value)}
          rows={9}
          maxLength={MAX_SCRIPT_LENGTH}
          placeholder="Type your script here"
          className="placeholder:text-muted-foreground/70 bg-muted/20 min-h-32 resize-none rounded-xl pb-12 break-all"
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

            <p
              className={cn(
                "text-xs font-medium transition-colors select-none",
                script.trim().length > 0 && !isScriptLongEnough
                  ? "text-destructive"
                  : "text-muted-foreground/70",
              )}
            >
              {script.length} / {MAX_SCRIPT_LENGTH}{" "}
              {script.trim().length > 0 &&
                !isScriptLongEnough &&
                `(Min ${MIN_SCRIPT_LENGTH})`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScriptAudioPanel;
