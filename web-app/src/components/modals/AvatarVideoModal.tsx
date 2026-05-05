"use client";

import {
  AudioLines,
  ChevronDown,
  Info,
  Pause,
  Play,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useEffect, useRef, useState } from "react";
import {
  MAX_SCRIPT_LENGTH,
  SAMPLE_AVATARS,
  SUPPORTED_LANGUAGES,
  type LanguageCode,
} from "~/lib/constants";
import Image from "next/image";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { cn } from "~/lib/utils";
import AudioInputModal from "./AudioInputModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { toast } from "sonner";
import SampleVoiceModal, { type Voice } from "./SampleVoiceModal";
import useAudioPlayer from "~/hooks/useAudioPlayer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Slider } from "../ui/slider";
import ImageCropperModal from "./ImageCropperModal";

interface AvatarVideoModalProps {
  isOpen: boolean;
  onOpenStateChange: (isOpen: boolean) => void;
}

interface TtsSettings {
  language: LanguageCode;
  exaggeration: number;
  cfgWeight: number;
  temperature: number;
}

const DEFAULT_TTS_SETTINGS: TtsSettings = {
  language: "en",
  exaggeration: 0.5,
  cfgWeight: 0.5,
  temperature: 0.8,
};

interface SliderRowProps {
  label: string;
  tooltip: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}

function SliderRow({
  label,
  tooltip,
  min,
  max,
  step,
  value,
  onChange,
}: SliderRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Label className="text-xs">{label}</Label>

          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground size-3 cursor-help" />
            </TooltipTrigger>

            <TooltipContent className="max-w-52 text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </div>

        <span className="text-muted-foreground font-mono text-xs tabular-nums">
          {value.toFixed(2)}
        </span>
      </div>

      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v!)}
      />
    </div>
  );
}

function AvatarVideoModal({
  isOpen,
  onOpenStateChange,
}: AvatarVideoModalProps) {
  // Avatar
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [selectedAvatarR2Key, setSelectedAvatarR2Key] = useState<string | null>(
    null,
  );
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Cropper
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [rawFileName, setRawFileName] = useState("avatar.jpg");

  // Script
  const [script, setScript] = useState("");

  // Audio — uploaded/recorded
  const [audioInputModalOpen, setAudioInputModalOpen] = useState(false);
  const [selectedAudioUrl, setSelectedAudioUrl] = useState<string | null>(null);
  const [selectedAudioTitle, setSelectedAudioTitle] =
    useState("new_recording.wav");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Voice — from library or custom upload
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [userAudioFile, setUserAudioFile] = useState<File | null>(null);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);

  // TTS settings
  const [ttsSettings, setTtsSettings] =
    useState<TtsSettings>(DEFAULT_TTS_SETTINGS);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const { audioSrc, togglePlay } = useAudioPlayer();

  // Sync blob URL for custom voice file
  useEffect(() => {
    if (userAudioFile) {
      const url = URL.createObjectURL(userAudioFile);
      setUserAudioUrl(url);

      return () => URL.revokeObjectURL(url);
    } else {
      setUserAudioUrl(null);
    }
  }, [userAudioFile]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAvatarError(null);
    // Reset input so the same file can be re-selected after cancel
    event.target.value = "";

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Only JPG, PNG, or WEBP allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be under 5MB.");
      return;
    }

    // Open cropper instead of setting directly — Hallo3 needs a 1:1 square
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

  const handleAudioPreview = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (error) {
      console.error("Failed to play audio:", error);
      toast.error("Oops! Failed to play audio. Try again.");
    }
  };

  // ── TTS settings helpers ─────────────────────────────────────────────────
  const updateTts = <K extends keyof TtsSettings>(
    key: K,
    value: TtsSettings[K],
  ) => setTtsSettings((prev) => ({ ...prev, [key]: value }));

  // ── Validation ───────────────────────────────────────────────────────────
  const hasAvatar = !!avatarPreviewUrl;
  const hasVoice = !!selectedVoice || !!userAudioFile;
  const hasAudio = !!selectedAudioUrl;
  const hasContent = hasAudio || (script.trim().length > 0 && hasVoice);
  const canGenerate = hasAvatar && hasContent;

  const handleGenerate = () => {
    if (!canGenerate) return;
    // TODO: call POST /api/avatar-video with form data
    toast.info("Generation queued — backend wiring coming next.");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenStateChange}>
        <DialogContent className="h-fit max-h-[95%] w-full min-w-[95%] overflow-y-auto lg:max-w-5xl lg:min-w-fit">
          <div className="flex flex-col gap-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">
                Realistic talking video with{" "}
                <span className="text-blue-500">AI Portrait Avatars</span>
              </DialogTitle>

              <DialogDescription className="mt-2 text-base">
                Turn a single avatar photo &amp; script into a high-quality
                talking head avatar video using AI
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-8 p-8 lg:flex-row">
              {/* ── Left: avatar photo ───────────────────────────────────── */}
              <div className="flex w-full flex-col gap-4 lg:w-85 lg:shrink-0">
                {avatarPreviewUrl ? (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <Image
                        src={avatarPreviewUrl}
                        alt={avatarFile ? avatarFile.name : "Selected avatar"}
                        width={512}
                        height={512}
                        onLoad={(e) =>
                          e.currentTarget.setAttribute("data-loaded", "true")
                        }
                        className="img-scale-down-blur-up max-h-85 max-w-full rounded-xl border object-cover lg:max-w-85"
                      />

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={handleAvatarRemove}
                            aria-label="Remove avatar photo"
                            className="absolute top-2 right-2 rounded-full"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted border-accent flex h-full flex-col items-center rounded-xl border-2 border-dashed px-4 pt-8 pb-4">
                    <div className="flex grow flex-col items-center justify-center">
                      <UploadCloud className="text-muted-foreground mb-2 size-10" />

                      <Label className="cursor-pointer font-medium underline">
                        Upload to cloud
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </Label>

                      {avatarError && (
                        <p className="text-destructive mt-2 text-sm font-medium">
                          {avatarError}
                        </p>
                      )}

                      <p className="text-muted-foreground/80 mt-2 text-center text-xs">
                        Portrait photo in JPG, PNG, or WEBP.
                      </p>
                    </div>

                    <div className="mt-6 w-full">
                      <p className="text-muted-foreground text-xs">
                        Try a sample avatar
                      </p>

                      <ul className="mt-1 flex gap-2">
                        {SAMPLE_AVATARS.map(({ r2Key, publicUrl }) => (
                          <li
                            key={r2Key}
                            onClick={() =>
                              handleSampleAvatarSelect(r2Key, publicUrl)
                            }
                            tabIndex={0}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                handleSampleAvatarSelect(r2Key, publicUrl);
                              }
                            }}
                            aria-label="Select sample avatar"
                            className="size-14 cursor-pointer overflow-hidden rounded border"
                          >
                            <Image
                              src={publicUrl}
                              alt="Sample avatar"
                              width={56}
                              height={56}
                              onLoad={(e) =>
                                e.currentTarget.setAttribute(
                                  "data-loaded",
                                  "true",
                                )
                              }
                              className="img-scale-down-blur-up size-full object-cover"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right: script / audio + settings ────────────────────── */}
              <div className="flex grow flex-col gap-5">
                {/* Script / audio input area */}
                <div className="relative">
                  {selectedAudioUrl ? (
                    <div className="bg-muted flex items-center gap-3 rounded-lg p-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleAudioPreview}
                            aria-label={
                              isAudioPlaying ? "Pause audio" : "Play audio"
                            }
                            className="rounded-full"
                          >
                            {isAudioPlaying ? (
                              <Pause className="size-4" />
                            ) : (
                              <Play className="size-4" />
                            )}
                          </Button>
                        </TooltipTrigger>

                        <TooltipContent>
                          {isAudioPlaying ? "Pause" : "Play"}
                        </TooltipContent>
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
                            onClick={() => {
                              audioRef.current?.pause();
                              setIsAudioPlaying(false);
                              setSelectedAudioUrl(null);
                            }}
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
                        onPlay={() => setIsAudioPlaying(true)}
                        onPause={() => setIsAudioPlaying(false)}
                        onEnded={() => setIsAudioPlaying(false)}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <>
                      <Textarea
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        rows={10}
                        maxLength={MAX_SCRIPT_LENGTH}
                        placeholder="Type your script here,"
                        className="placeholder:text-muted-foreground/70 min-h-32 resize-none break-all"
                      />

                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => setAudioInputModalOpen(true)}
                        className={cn(
                          "absolute top-7 left-0.5 text-base lg:top-0.75 lg:left-36",
                          { hidden: script },
                        )}
                      >
                        upload or record audio
                      </Button>

                      <div className="absolute bottom-2 flex w-full flex-col gap-2 px-3">
                        <div className="mt-2 flex items-center justify-between gap-2">
                          {/* Voice indicator / picker */}
                          {userAudioFile ? (
                            <div className="flex items-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setVoiceModalOpen(true)}
                                  >
                                    <AudioLines className="size-4" />
                                    <span>{userAudioFile.name}</span>
                                  </Button>
                                </TooltipTrigger>

                                <TooltipContent>
                                  Record/Upload/Pick new
                                </TooltipContent>
                              </Tooltip>

                              {userAudioUrl && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() =>
                                        void togglePlay(userAudioUrl)
                                      }
                                      className="rounded-full"
                                    >
                                      {userAudioUrl === audioSrc ? (
                                        <Pause className="size-3" />
                                      ) : (
                                        <Play className="size-3" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>

                                  <TooltipContent>
                                    {userAudioUrl === audioSrc
                                      ? "Pause"
                                      : "Play"}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          ) : selectedVoice ? (
                            <div className="flex items-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setVoiceModalOpen(true)}
                                  >
                                    <AudioLines className="size-4" />
                                    <span>{selectedVoice.name}</span>
                                  </Button>
                                </TooltipTrigger>

                                <TooltipContent>
                                  Record/Upload/Pick new
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() =>
                                      void togglePlay(selectedVoice.audioSrc)
                                    }
                                    className="rounded-full"
                                  >
                                    {selectedVoice.audioSrc === audioSrc ? (
                                      <Pause className="size-3" />
                                    ) : (
                                      <Play className="size-3" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {selectedVoice.audioSrc === audioSrc
                                    ? "Pause"
                                    : "Play"}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          ) : (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => setVoiceModalOpen(true)}
                              className="px-0"
                            >
                              <AudioLines className="size-4" />
                              Pick voice
                            </Button>
                          )}

                          <p className="text-muted-foreground/70 text-xs select-none">
                            {script.length} / {MAX_SCRIPT_LENGTH} (~10 sec
                            audio)
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* ── Language select (only relevant when using script + TTS) */}
                {!selectedAudioUrl && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="language-select" className="text-sm">
                      Speech language
                    </Label>

                    <Select
                      value={ttsSettings.language}
                      onValueChange={(v) =>
                        updateTts("language", v as LanguageCode)
                      }
                    >
                      <SelectTrigger id="language-select" className="w-full">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>

                      <SelectContent>
                        {SUPPORTED_LANGUAGES.map(({ code, name, flag }) => (
                          <SelectItem
                            key={code}
                            value={code}
                            className="flex items-center gap-2"
                          >
                            <span className="font-emoji text-base">{flag}</span>{" "}
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground text-xs">
                      Match the language of your script for best results.
                    </p>
                  </div>
                )}

                {/* ── Advanced options collapsible (TTS only) ─────────────── */}
                {!selectedAudioUrl && (
                  <Collapsible
                    open={advancedOpen}
                    onOpenChange={setAdvancedOpen}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground -ml-1 flex items-center gap-1.5 px-1"
                      >
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform duration-200",
                            advancedOpen && "rotate-180",
                          )}
                        />
                        Advanced options
                      </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="mt-3 flex flex-col gap-4 rounded-lg border p-4">
                      <SliderRow
                        label="Exaggeration"
                        tooltip="Controls emotional intensity. Higher values make speech more expressive and dramatic; pair with lower CFG weight if it sounds too fast."
                        min={0}
                        max={1}
                        step={0.01}
                        value={ttsSettings.exaggeration}
                        onChange={(v) => updateTts("exaggeration", v)}
                      />

                      <SliderRow
                        label="CFG Weight"
                        tooltip="Balances how closely the output follows the voice sample's style and pacing. Set to 0 to reduce accent transfer when the reference clip is in a different language."
                        min={0}
                        max={1}
                        step={0.01}
                        value={ttsSettings.cfgWeight}
                        onChange={(v) => updateTts("cfgWeight", v)}
                      />

                      <SliderRow
                        label="Temperature"
                        tooltip="Controls output randomness. Lower values produce more consistent, predictable speech; higher values add natural variation."
                        min={0.1}
                        max={1}
                        step={0.01}
                        value={ttsSettings.temperature}
                        onChange={(v) => updateTts("temperature", v)}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground self-end text-xs"
                        onClick={() => setTtsSettings(DEFAULT_TTS_SETTINGS)}
                      >
                        Reset to defaults
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* ── Generate button ──────────────────────────────────────── */}
                <div className="mt-auto pt-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block w-full">
                        <Button
                          type="button"
                          size="lg"
                          className="w-full"
                          disabled={!canGenerate}
                          onClick={handleGenerate}
                        >
                          <Sparkles className="size-4" />
                          Generate avatar video
                        </Button>
                      </span>
                    </TooltipTrigger>

                    {!canGenerate && (
                      <TooltipContent className="text-xs">
                        {!hasAvatar
                          ? "Upload or select an avatar photo first."
                          : !hasContent
                            ? "Add a script + pick a voice, or upload/record audio."
                            : ""}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-modals */}
          <AudioInputModal
            isOpen={audioInputModalOpen}
            onOpenStateChange={setAudioInputModalOpen}
            onAudioRecorded={(audioBlob: Blob) => {
              const url = URL.createObjectURL(audioBlob);
              setSelectedAudioUrl(url);

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

      {/* Cropper modal */}
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
