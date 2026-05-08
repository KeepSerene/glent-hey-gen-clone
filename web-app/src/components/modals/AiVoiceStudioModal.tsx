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
import { Button } from "~/components/ui/button";
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

interface AiVoiceStudioModalProps {
  isOpen: boolean;
  onOpenStateChange: (isOpen: boolean) => void;
  /** True when the user has exhausted their daily voiceover quota. */
  isLimitReached: boolean;
  /** ISO string — earliest time the quota will free up. */
  resetsAt: string | null;
}

function AiVoiceStudioModal({
  isOpen,
  onOpenStateChange,
  isLimitReached,
  resetsAt,
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

  const { data: generationStatus } = useGenerationStatus("voiceover", jobId);

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
  const canGenerate = isScriptLongEnough && hasVoice && !isLimitReached;

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

      if (message.startsWith("DAILY_LIMIT_EXCEEDED")) {
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenStateChange}>
        <DialogContent className="max-h-[85vh] w-full max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-emerald-500 dark:text-emerald-500">
              Voiceover lab
            </DialogTitle>

            <DialogDescription className="mt-2 text-sm">
              Type your script, pick a voice or upload a clone sample, and
              generate ultra-realistic multi-lingual speech.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-4">
            {isLimitReached && !jobId ? (
              <LimitBanner
                type="voiceover"
                limit={DAILY_LIMITS.voiceover}
                resetsAt={resetsAt}
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
                onReset={handleReset}
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

                    {/* Dynamic character counter */}
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

                <Button
                  type="button"
                  size="lg"
                  className="mt-2 w-full shrink-0"
                  disabled={!canGenerate || isSubmitting}
                  onClick={handleGenerate}
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
                </Button>
              </>
            )}
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
