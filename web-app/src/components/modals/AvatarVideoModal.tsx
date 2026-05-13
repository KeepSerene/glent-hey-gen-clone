"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useAudioPlayer from "~/hooks/useAudioPlayer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import AudioInputModal from "./AudioInputModal";
import ImageCropperModal from "./ImageCropperModal";
import SampleVoiceModal, { type Voice } from "./SampleVoiceModal";
import AvatarPicker from "../avatar-video/AvatarPicker";
import ScriptAudioPanel from "../avatar-video/ScriptAudioPanel";
import TtsSettingsPanel from "../tts/TtsSettingsPanel";
import { DEFAULT_TTS_SETTINGS, type TtsSettings } from "../tts/tts-types";
import {
  ALLOWED_IMAGE_TYPES,
  DAILY_LIMITS,
  MIN_SCRIPT_LENGTH,
} from "~/lib/constants";
import useGenerationStatus from "~/hooks/useGenerationStatus";
import { createAvatarVideoJob } from "~/server/actions/generate";
import { uploadFileToR2 } from "~/lib/r2-upload";
import GenerationProgress from "../GenerationProgress";
import LimitBanner from "../LimitBanner";
import { useQueryClient } from "@tanstack/react-query";
import { deleteGeneration } from "~/server/actions/delete";
import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils";

interface AvatarVideoModalProps {
  isOpen: boolean;
  onOpenStateChange: (isOpen: boolean) => void;
  /** True when the user has exhausted their daily avatar-video quota. */
  isLimitReached: boolean;
  /** ISO string — earliest time the quota will free up. */
  resetsAt: string | null;
  isNoCredits?: boolean;
  themeColor?: "blue" | "emerald";
}

function AvatarVideoModal({
  isOpen,
  onOpenStateChange,
  isLimitReached,
  resetsAt,
  isNoCredits = false,
  themeColor = "blue",
}: AvatarVideoModalProps) {
  // ── Avatar ────────────────────────────────────────────────────────────────
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [selectedAvatarR2Key, setSelectedAvatarR2Key] = useState<string | null>(
    null,
  );
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // ── Image cropper ─────────────────────────────────────────────────────────
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [rawFileName, setRawFileName] = useState("avatar.jpg");

  // ── Script ────────────────────────────────────────────────────────────────
  const [script, setScript] = useState("");

  // ── Uploaded / recorded audio ─────────────────────────────────────────────
  const [audioInputModalOpen, setAudioInputModalOpen] = useState(false);
  const [selectedAudioBlob, setSelectedAudioBlob] = useState<Blob | null>(null);
  const [selectedAudioUrl, setSelectedAudioUrl] = useState<string | null>(null);
  const [selectedAudioTitle, setSelectedAudioTitle] =
    useState("new_recording.wav");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ── Voice (library pick or custom upload) ─────────────────────────────────
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [userAudioFile, setUserAudioFile] = useState<File | null>(null);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);

  // ── Generation ──────────────────────────────────────────────────────
  const [jobId, setJobId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { data: generationStatus } = useGenerationStatus(
    "avatar-video",
    jobId,
    {
      onCompleted: () => {
        router.refresh();
      },
    },
  );

  // ── TTS settings ──────────────────────────────────────────────────────────
  const [ttsSettings, setTtsSettings] =
    useState<TtsSettings>(DEFAULT_TTS_SETTINGS);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const { audioSrc, togglePlay } = useAudioPlayer();

  // Sync blob URL whenever the custom voice file changes
  useEffect(() => {
    if (!userAudioFile) {
      setUserAudioUrl(null);
      return;
    }

    const url = URL.createObjectURL(userAudioFile);
    setUserAudioUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [userAudioFile]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAvatarError(null);
    e.target.value = "";

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      setAvatarError("Only JPG, PNG, or WEBP allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be under 5MB.");
      return;
    }

    setRawImageSrc(URL.createObjectURL(file));
    setRawFileName(file.name);
    setCropperOpen(true);
  };

  const handleCropDone = (croppedFile: File) => {
    setAvatarFile(croppedFile);
    setSelectedAvatarR2Key(null);
    setAvatarPreviewUrl(URL.createObjectURL(croppedFile));
    setCropperOpen(false);

    if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);

    setRawImageSrc(null);
  };

  const handleCropCancel = () => {
    setCropperOpen(false);

    if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);

    setRawImageSrc(null);
  };

  const handleSampleAvatarSelect = (r2Key: string, publicUrl: string) => {
    setAvatarPreviewUrl(publicUrl);
    setAvatarFile(null);
    setSelectedAvatarR2Key(r2Key);
    setAvatarError(null);
  };

  const handleAvatarRemove = () => {
    setAvatarPreviewUrl(null);
    setAvatarFile(null);
    setSelectedAvatarR2Key(null);
  };

  const handleAudioPlayPause = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    try {
      audio.paused ? await audio.play() : audio.pause();
    } catch (err) {
      console.error("Failed to play audio:", err);
      toast.error("Oops! Failed to play audio. Try again.");
    }
  };

  const handleAudioRemove = () => {
    audioRef.current?.pause();
    setIsAudioPlaying(false);
    setSelectedAudioUrl(null);
  };

  // ── TTS settings helper ───────────────────────────────────────────────────
  const updateTts = <K extends keyof TtsSettings>(
    key: K,
    value: TtsSettings[K],
  ) => setTtsSettings((prev) => ({ ...prev, [key]: value }));

  // ── Validations ────────────────────────────────────────────────────────────
  const hasAvatar = !!avatarPreviewUrl;
  const hasVoice = !!selectedVoice || !!userAudioFile;
  const isScriptLongEnough = script.trim().length >= MIN_SCRIPT_LENGTH;
  const hasContent = !!selectedAudioUrl || (isScriptLongEnough && hasVoice);
  const canGenerate =
    hasAvatar && hasContent && !isLimitReached && !isNoCredits;

  const queryClient = useQueryClient();

  const handleGenerate = async () => {
    if (!canGenerate || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 1. Resolve avatar R2 key
      let avatarR2Key: string;

      if (avatarFile) {
        avatarR2Key = await uploadFileToR2(
          avatarFile,
          "avatars",
          "avatar-video",
        );
      } else if (selectedAvatarR2Key) {
        avatarR2Key = selectedAvatarR2Key;
      } else {
        throw new Error("No avatar selected.");
      }

      // 2. Determine input mode: direct audio OR script + voice
      if (selectedAudioBlob) {
        const audioFile = new File(
          [selectedAudioBlob],
          selectedAudioTitle || "recording.wav",
          { type: selectedAudioBlob.type },
        );
        const audioR2Key = await uploadFileToR2(
          audioFile,
          "audios",
          "avatar-video",
        );
        const { jobId: id } = await createAvatarVideoJob({
          avatarR2Key,
          audioR2Key,
        });
        setJobId(id);

        void queryClient.invalidateQueries({ queryKey: ["generation-quota"] });
      } else {
        let voiceR2Key: string | undefined;

        if (userAudioFile) {
          voiceR2Key = await uploadFileToR2(
            userAudioFile,
            "voices",
            "avatar-video",
          );
        } else if (selectedVoice) {
          voiceR2Key = selectedVoice.r2Key;
        }

        const { jobId: id } = await createAvatarVideoJob({
          avatarR2Key,
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
      }
    } catch (err) {
      console.error("Generation start failed:", err);
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
    setAvatarFile(null);
    setAvatarPreviewUrl(null);
    setSelectedAvatarR2Key(null);
    setSelectedAudioUrl(null);
    setSelectedAudioBlob(null);
    setSelectedVoice(null);
    setUserAudioFile(null);
    setUserAudioUrl(null);
  };

  const handleCancel = async () => {
    if (!jobId) return;

    const { refunded } = await deleteGeneration(jobId, "avatar-video");

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
        <DialogContent className="flex max-h-[calc(100dvh-2.5rem)] w-[calc(100vw-1.5rem)] max-w-5xl flex-col overflow-hidden p-0 sm:max-h-[90dvh] sm:w-[95vw] sm:rounded-[24px]">
          {/* Ambient glow */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute -top-20 -left-20 z-0 size-80 rounded-full opacity-[0.12] blur-[70px] dark:opacity-[0.15]",
              themeColor === "blue" ? "bg-blue-500" : "bg-emerald-500",
            )}
          />

          <div className="relative z-10 flex size-full flex-col overflow-y-auto">
            {/* Header section with responsive padding */}
            <DialogHeader className="px-5 pt-12 pb-4 sm:px-8 sm:pt-8 sm:pb-6">
              <DialogTitle className="flex items-start gap-2.5 text-xl font-semibold tracking-tight sm:items-center sm:gap-3 sm:text-2xl">
                {/* Staggered dash accent */}
                <span aria-hidden className="mt-1 flex shrink-0 gap-1 sm:mt-0">
                  <span
                    className={cn(
                      "h-5 w-1.5 rounded-full sm:h-6",
                      themeColor === "blue" ? "bg-blue-500" : "bg-emerald-500",
                    )}
                  />
                  <span
                    className={cn(
                      "mt-1.5 h-3.5 w-1.5 rounded-full opacity-60 sm:mt-2 sm:h-4",
                      themeColor === "blue" ? "bg-blue-500" : "bg-emerald-500",
                    )}
                  />
                </span>

                <span className="leading-tight">
                  Talk through any{" "}
                  <span
                    className={cn(
                      themeColor === "blue"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    portrait avatar
                  </span>
                </span>
              </DialogTitle>

              <DialogDescription className="text-sm sm:text-base">
                Transform a single photo and script into a natural talking
                video.
              </DialogDescription>
            </DialogHeader>

            {(isLimitReached || isNoCredits) && !jobId ? (
              <div className="px-5 pb-5 sm:px-8 sm:pb-8">
                <LimitBanner
                  type="avatar video"
                  limit={DAILY_LIMITS["avatar-video"]}
                  resetsAt={resetsAt}
                  noCredits={isNoCredits}
                />
              </div>
            ) : isSubmitting || jobId ? (
              <div className="px-5 pb-5 sm:px-8 sm:pb-8">
                <GenerationProgress
                  type="avatar-video"
                  jobId={jobId}
                  status={
                    isSubmitting && !jobId
                      ? "queued"
                      : (generationStatus?.status ?? "queued")
                  }
                  errorMessage={generationStatus?.errorMessage}
                  onCancel={jobId ? handleCancel : undefined}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-6 px-5 pb-5 sm:gap-8 sm:px-8 sm:pb-8 lg:flex-row">
                {/* ── Left: avatar photo ───────────────────────────────────── */}
                <div className="flex w-full shrink-0 flex-col gap-4 lg:w-80 xl:w-96">
                  <AvatarPicker
                    previewUrl={avatarPreviewUrl}
                    avatarFile={avatarFile}
                    error={avatarError}
                    onFileChange={handleAvatarFileChange}
                    onSampleSelect={handleSampleAvatarSelect}
                    onRemove={handleAvatarRemove}
                  />
                </div>

                {/* ── Right: script / audio + settings ────────────────────── */}
                <div className="flex flex-1 flex-col gap-5">
                  <div className="relative">
                    <ScriptAudioPanel
                      selectedAudioUrl={selectedAudioUrl}
                      selectedAudioTitle={selectedAudioTitle}
                      isAudioPlaying={isAudioPlaying}
                      audioRef={audioRef}
                      onAudioPlayPause={handleAudioPlayPause}
                      onAudioRemove={handleAudioRemove}
                      onAudioPlayStateChange={setIsAudioPlaying}
                      script={script}
                      onScriptChange={setScript}
                      onOpenAudioInputModal={() => setAudioInputModalOpen(true)}
                      userAudioFile={userAudioFile}
                      userAudioUrl={userAudioUrl}
                      selectedVoice={selectedVoice}
                      activeAudioSrc={audioSrc}
                      onToggleVoicePlay={(src) => void togglePlay(src)}
                      onOpenVoiceModal={() => setVoiceModalOpen(true)}
                    />
                  </div>

                  {!selectedAudioUrl && (
                    <TtsSettingsPanel
                      settings={ttsSettings}
                      englishOnly={true}
                      onUpdate={updateTts}
                      onReset={() => setTtsSettings(DEFAULT_TTS_SETTINGS)}
                      advancedOpen={advancedOpen}
                      onAdvancedOpenChange={setAdvancedOpen}
                    />
                  )}

                  {/* Generate button */}
                  <div className="mt-auto pt-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block w-full">
                          <Button
                            type="button"
                            size="lg"
                            className="w-full"
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
                                Generate avatar video
                              </>
                            )}
                          </Button>
                        </span>
                      </TooltipTrigger>

                      {!canGenerate && (
                        <TooltipContent className="text-xs">
                          {!hasAvatar
                            ? "Upload or select an avatar photo first."
                            : "Add a script + pick a voice, or upload/record audio."}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Sub-modals ────────────────────────────────────────────────── */}
          <AudioInputModal
            isOpen={audioInputModalOpen}
            onOpenStateChange={setAudioInputModalOpen}
            onAudioRecorded={(audioBlob: Blob) => {
              const url = URL.createObjectURL(audioBlob);
              setSelectedAudioUrl(url);
              setSelectedAudioBlob(audioBlob);

              const timestamp = new Date()
                .toISOString()
                .replace(/[-:T]/g, "")
                .slice(0, 14);
              const title =
                (audioBlob as File).name ?? `new_recording_${timestamp}.wav`;
              setSelectedAudioTitle(title);
              setAudioInputModalOpen(false);
            }}
          />

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
        </DialogContent>
      </Dialog>

      {rawImageSrc && (
        <ImageCropperModal
          isOpen={cropperOpen}
          imageSrc={rawImageSrc}
          fileName={rawFileName}
          onCropDone={handleCropDone}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}

export default AvatarVideoModal;
