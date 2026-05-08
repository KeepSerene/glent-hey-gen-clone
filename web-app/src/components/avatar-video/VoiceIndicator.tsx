"use client";

import { AudioLines, Pause, Play } from "lucide-react";
import type { Voice } from "~/components/modals/SampleVoiceModal";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface VoiceIndicatorProps {
  userAudioFile: File | null;
  userAudioUrl: string | null;
  selectedVoice: Voice | null;
  /** The src currently playing in the shared audio player hook. */
  activeAudioSrc: string | null;
  onTogglePlay: (src: string) => void;
  onOpenVoiceModal: () => void;
}

function VoiceIndicator({
  userAudioFile,
  userAudioUrl,
  selectedVoice,
  activeAudioSrc,
  onTogglePlay,
  onOpenVoiceModal,
}: VoiceIndicatorProps) {
  // ── Custom uploaded / recorded voice ─────────────────────────────────────
  if (userAudioFile) {
    return (
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenVoiceModal}
            >
              <AudioLines className="size-4" />
              <span>{userAudioFile.name}</span>
            </Button>
          </TooltipTrigger>

          <TooltipContent>Record/Upload/Pick new</TooltipContent>
        </Tooltip>

        {userAudioUrl && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onTogglePlay(userAudioUrl)}
                className="rounded-full"
              >
                {userAudioUrl === activeAudioSrc ? (
                  <Pause className="size-3" />
                ) : (
                  <Play className="size-3" />
                )}
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              {userAudioUrl === activeAudioSrc ? "Pause" : "Play"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  }

  // ── Library voice selected ────────────────────────────────────────────────
  if (selectedVoice) {
    return (
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenVoiceModal}
            >
              <AudioLines className="size-4" />
              <span>{selectedVoice.name}</span>
            </Button>
          </TooltipTrigger>

          <TooltipContent>Record/Upload/Pick new</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onTogglePlay(selectedVoice.audioSrc)}
              className="rounded-full"
            >
              {selectedVoice.audioSrc === activeAudioSrc ? (
                <Pause className="size-3" />
              ) : (
                <Play className="size-3" />
              )}
            </Button>
          </TooltipTrigger>

          <TooltipContent>
            {selectedVoice.audioSrc === activeAudioSrc ? "Pause" : "Play"}
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  // ── No voice yet ───────────────────────────────────────
  return (
    <Button
      variant="link"
      size="sm"
      onClick={onOpenVoiceModal}
      className="px-0"
    >
      <AudioLines className="size-4" />
      Pick voice
    </Button>
  );
}

export default VoiceIndicator;
