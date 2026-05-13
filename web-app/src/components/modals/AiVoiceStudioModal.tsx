"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useAudioPlayer from "~/hooks/useAudioPlayer";
import {
  DAILY_LIMITS,
  MAX_TTS_SCRIPT_LENGTH,
  MIN_TTS_SCRIPT_LENGTH,
} from "~/lib/constants";
import { cn } from "~/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import SampleVoiceModal, { type Voice } from "./SampleVoiceModal";
import TtsSettingsPanel from "../tts/TtsSettingsPanel";
import { DEFAULT_TTS_SETTINGS, type TtsSettings } from "../tts/tts-types";
import VoiceIndicator from "../avatar-video/VoiceIndicator";
import useGenerationStatus from "~/hooks/useGenerationStatus";
import { uploadFileToR2 } from "~/lib/r2-upload";
import { createVoiceoverJob } from "~/server/actions/generate";
import GenerationProgress from "../GenerationProgress";
import LimitBanner from "../LimitBanner";
import { useQueryClient } from "@tanstack/react-query";
import { deleteGeneration } from "~/server/actions/delete";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useRouter } from "next/navigation";

interface AiVoiceStudioModalProps {
  isOpen: boolean;
  onOpenStateChange: (isOpen: boolean) => void;
  /** True when the user has exhausted their daily voiceover quota. */
  isLimitReached: boolean;
  /** ISO string — earliest time the quota will free up. */
  resetsAt: string | null;
  isNoCredits?: boolean;
  themeColor?: "blue" | "emerald";
}

function AiVoiceStudioModal({
  isOpen,
  onOpenStateChange,
  isLimitReached,
  resetsAt,
  isNoCredits = false,
  themeColor = "emerald",
}: AiVoiceStudioModalProps) {
  const [script, setScript] = useState("");
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [userAudioFile, setUserAudioFile] = useState<File | null>(null);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);

  const [ttsSettings, setTtsSettings] =
    useState<TtsSettings>(DEFAULT_TTS_SETTINGS);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const { audioSrc, togglePlay } = useAudioPlayer();

  const [jobId, setJobId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { data: generationStatus } = useGenerationStatus("voiceover", jobId, {
    onCompleted: () => {
      router.refresh();
    },
  });

  useEffect(() => {
    if (!userAudioFile) {
      setUserAudioUrl(null);
      return;
    }

    const url = URL.createObjectURL(userAudioFile);
    setUserAudioUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [userAudioFile]);

  const updateTts = <K extends keyof TtsSettings>(
    key: K,
    value: TtsSettings[K],
  ) => setTtsSettings((prev) => ({ ...prev, [key]: value }));

  const hasVoice = !!selectedVoice || !!userAudioFile;
  const isScriptLongEnough = script.trim().length >= MIN_TTS_SCRIPT_LENGTH;
  const canGenerate =
    isScriptLongEnough && hasVoice && !isLimitReached && !isNoCredits;

  const queryClient = useQueryClient();

  const handleGenerate = async () => {
    if (!canGenerate || isSubmitting) return;

    setIsSubmitting(true);

    try {
      let voiceR2Key: string | undefined;

      if (userAudioFile) {
        voiceR2Key = await uploadFileToR2(userAudioFile, "voices", "voiceover");
      } else if (selectedVoice) {
        voiceR2Key = selectedVoice.r2Key;
      }

      const { jobId: id } = await createVoiceoverJob({
        script,
        voiceR2Key,
        language: ttsSettings.language,
        exaggeration: ttsSettings.exaggeration,
        cfgWeight: ttsSettings.cfgWeight,
        temperature: ttsSettings.temperature,
        seed: ttsSettings.seed ?? 0,
      });
      setJobId(id);

      void queryClient.invalidateQueries({ queryKey: ["generation-quota"] });
    } catch (err) {
      console.error("Voiceover generation failed:", err);
      const message = err instanceof Error ? err.message : "";

      if (message.startsWith("INSUFFICIENT_CREDITS")) {
        toast.error("Insufficient credits. Purchase a pack to continue.");
      } else if (message.startsWith("DAILY_LIMIT_EXCEEDED")) {
        toast.error("Daily limit reached. Please try again later.");
      } else {
        toast.error("Failed to start generation. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setJobId(null);
    setIsSubmitting(false);
    setScript("");
    setSelectedVoice(null);
    setUserAudioFile(null);
    setUserAudioUrl(null);
  };

  const handleCancel = async () => {
    if (!jobId) return;

    const { refunded } = await deleteGeneration(jobId, "voiceover");

    if (refunded > 0) {
      toast.success(`Generation canceled — ${refunded} credits refunded.`);
      void queryClient.invalidateQueries({ queryKey: ["generation-quota"] });
    } else {
      toast.info("Generation canceled.");
    }

    handleReset();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenStateChange}>
        <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-xl overflow-hidden p-0">
          {/* Ambient glow */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute -top-20 -left-20 -z-10 size-80 rounded-full opacity-[0.10] blur-[70px] dark:opacity-[0.12]",
              themeColor === "blue" ? "bg-blue-500" : "bg-emerald-500",
            )}
          />

          <div className="flex max-h-[85vh] w-full flex-col overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
                {/* Staggered dash accent */}
                <span aria-hidden className="flex gap-1">
                  <span
                    className={cn(
                      "h-6 w-1.5 rounded-full",
                      themeColor === "blue" ? "bg-blue-500" : "bg-emerald-500",
                    )}
                  />
                  <span
                    className={cn(
                      "mt-2 h-4 w-1.5 rounded-full opacity-60",
                      themeColor === "blue" ? "bg-blue-500" : "bg-emerald-500",
                    )}
                  />
                </span>

                <span
                  className={cn(
                    themeColor === "blue"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  Voiceover lab
                </span>
              </DialogTitle>

              <DialogDescription className="mt-2 text-sm">
                Type your script, pick a voice or upload a clone sample, and
                generate ultra-realistic multi-lingual speech.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-5 py-4">
              {(isLimitReached || isNoCredits) && !jobId ? (
                <LimitBanner
                  type="voiceover"
                  limit={DAILY_LIMITS.voiceover}
                  resetsAt={resetsAt}
                  noCredits={isNoCredits}
                />
              ) : isSubmitting || jobId ? (
                <GenerationProgress
                  type="voiceover"
                  jobId={jobId}
                  status={
                    isSubmitting && !jobId
                      ? "queued"
                      : (generationStatus?.status ?? "queued")
                  }
                  errorMessage={generationStatus?.errorMessage}
                  onCancel={jobId ? handleCancel : undefined}
                />
              ) : (
                <>
                  {/* Script textarea */}
                  <div className="relative">
                    <Textarea
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      rows={7}
                      maxLength={MAX_TTS_SCRIPT_LENGTH}
                      placeholder="Type your script here..."
                      className="placeholder:text-muted-foreground/70 min-h-32 resize-none pb-10 text-base break-all"
                    />

                    {/* Bottom toolbar */}
                    <div className="absolute bottom-2 left-0 flex w-full items-center justify-between px-3">
                      <VoiceIndicator
                        userAudioFile={userAudioFile}
                        userAudioUrl={userAudioUrl}
                        selectedVoice={selectedVoice}
                        activeAudioSrc={audioSrc}
                        onTogglePlay={(src) => void togglePlay(src)}
                        onOpenVoiceModal={() => setVoiceModalOpen(true)}
                      />

                      {/* Character counter */}
                      <p
                        className={cn(
                          "text-xs transition-colors select-none",
                          script.trim().length > 0 && !isScriptLongEnough
                            ? "text-destructive font-medium"
                            : "text-muted-foreground/70",
                        )}
                      >
                        {script.length} / {MAX_TTS_SCRIPT_LENGTH}{" "}
                        {script.trim().length > 0 &&
                          !isScriptLongEnough &&
                          `(Min ${MIN_TTS_SCRIPT_LENGTH})`}
                      </p>
                    </div>
                  </div>

                  <TtsSettingsPanel
                    settings={ttsSettings}
                    englishOnly={false}
                    onUpdate={updateTts}
                    onReset={() => setTtsSettings(DEFAULT_TTS_SETTINGS)}
                    advancedOpen={advancedOpen}
                    onAdvancedOpenChange={setAdvancedOpen}
                  />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block w-full">
                        <button
                          type="button"
                          onClick={handleGenerate}
                          disabled={!canGenerate || isSubmitting}
                          className="btn-highlight w-full shrink-0"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="size-4" />
                              Generate Speech
                            </>
                          )}
                        </button>
                      </span>
                    </TooltipTrigger>

                    {!canGenerate && !isSubmitting && (
                      <TooltipContent className="text-xs">
                        {!isScriptLongEnough
                          ? `Type a script of at least ${MIN_TTS_SCRIPT_LENGTH} characters.`
                          : "Select a voice from the library, or upload/record a sample."}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SampleVoiceModal
        isOpen={voiceModalOpen}
        onOpenStateChange={setVoiceModalOpen}
        onVoiceSelected={(voice: Voice) => {
          setSelectedVoice(voice);
          setUserAudioFile(null);
          setVoiceModalOpen(false);
        }}
        onAudioUploaded={(file: File) => {
          setSelectedVoice(null);
          setUserAudioFile(file);
          setVoiceModalOpen(false);
        }}
      />
    </>
  );
}

export default AiVoiceStudioModal;
