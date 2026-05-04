"use client";

import { AudioLines, Pause, Play, Trash2, UploadCloud } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useRef, useState } from "react";
import { MAX_SCRIPT_LENGTH, SAMPLE_AVATARS } from "~/lib/constants";
import Image from "next/image";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { cn } from "~/lib/utils";
import AudioInputModal from "./AudioInputModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { toast } from "sonner";
import SampleVoiceModal, { type Voice } from "./SampleVoiceModal";
import useAudioPlayer from "~/hooks/useAudioPlayer";

interface AvatarVideoModalProps {
  isOpen: boolean;
  onOpenStateChange: (isOpen: boolean) => void;
}

function AvatarVideoModal({
  isOpen,
  onOpenStateChange,
}: AvatarVideoModalProps) {
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [script, setScript] = useState("");
  const [audioInputModalOpen, setAudioInputModalOpen] = useState(false);
  const [selectedAudioUrl, setSelectedAudioUrl] = useState<string | null>(null);
  const [selectedAudioTitle, setSelectedAudioTitle] =
    useState<string>("new_recording.wav");
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [userAudioFile, setUserAudioFile] = useState<File | null>(null);
  // Track play state for the uploaded/recorded audio preview (uses a local
  // <audio> element, not the shared useAudioPlayer hook)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Shared hook for sample voice playback in the textarea toolbar
  const { audioSrc, togglePlay } = useAudioPlayer();

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAvatarError(null);

    if (file) {
      if (![" image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setAvatarError("Only JPG, PNG, or WEBP allowed.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setAvatarError("Image must be under 5MB.");
        return;
      }

      setAvatarPreviewUrl(URL.createObjectURL(file));
      setAvatarFile(file);
    }
  };

  const handleAvatarSelect = (url: string) => {
    setAvatarPreviewUrl(url);
    setAvatarFile(null);
  };

  const handleAvatarRemove = () => {
    setAvatarPreviewUrl(null);
    setAvatarFile(null);
  };

  // Toggle play/pause for the uploaded/recorded audio preview
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenStateChange}>
      <DialogContent className="h-fit max-h-[95%] w-full min-w-[95%] overflow-y-auto lg:max-w-5xl lg:min-w-fit">
        <div className="flex flex-col gap-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Realistic talking video with{" "}
              <span className="text-blue-500">AI Portrait Avatars</span>
            </DialogTitle>

            <DialogDescription className="mt-2 text-base">
              Turn a single avatar photo & script into a high-quality talking
              head avatar video using AI
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-8 p-8 lg:flex-row">
            {/* Left: avatar preview + upload */}
            <div className="flex w-full flex-col gap-4 lg:w-85 lg:shrink-0">
              {avatarPreviewUrl ? (
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <Image
                      src={avatarPreviewUrl}
                      alt={avatarFile ? avatarFile.name : "Sample Avatar"}
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
                        accept="image/jpeg, image/png, image/webp"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </Label>

                    {avatarError && (
                      <p className="text-destructive mt-2 text-sm font-medium">
                        {avatarError}
                      </p>
                    )}

                    <p className="text-muted-foreground/80 mt-2 text-xs">
                      For best results, choose an avatar that is at least 720p.
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
                          onClick={() => handleAvatarSelect(publicUrl)}
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              handleAvatarSelect(publicUrl);
                            }
                          }}
                          aria-label="Select avatar"
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

            {/* Right: script + audio options */}
            <div className="flex grow flex-col gap-4">
              <div className="">
                <div className="relative">
                  {selectedAudioUrl ? (
                    <div className="bg-muted flex items-center gap-3 rounded p-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="secondary"
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
                        id="audio-preview"
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
                          {!selectedAudioUrl &&
                            (userAudioFile ? (
                              <div className="flex items-center gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setVoiceModalOpen(true)}
                                      aria-label="Listen to recorded/uploaded audio"
                                    >
                                      <AudioLines className="size-4" />
                                      <span>{userAudioFile.name}</span>
                                    </Button>
                                  </TooltipTrigger>

                                  <TooltipContent>Listen</TooltipContent>
                                </Tooltip>
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
                                      aria-label="Listen to selected voice"
                                    >
                                      <AudioLines className="size-4" />
                                      <span>{selectedVoice.name}</span>
                                    </Button>
                                  </TooltipTrigger>

                                  <TooltipContent>Listen</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => {
                                        if (selectedVoice) {
                                          void togglePlay(
                                            selectedVoice.audioSrc,
                                          );
                                        }
                                      }}
                                      aria-label={
                                        selectedVoice.audioSrc === audioSrc
                                          ? "Pause selected voice"
                                          : "Play selected voice"
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
                            ))}

                          {!selectedAudioUrl && (
                            <p className="text-muted-foreground/70 text-xs select-none">
                              {script.length} / {MAX_SCRIPT_LENGTH} (~10 sec
                              audio)
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <AudioInputModal
          isOpen={audioInputModalOpen}
          onOpenStateChange={setAudioInputModalOpen}
          onAudioRecorded={(audioBlob: Blob) => {
            const url = URL.createObjectURL(audioBlob);
            setSelectedAudioUrl(url);

            let title =
              "new_recording_" +
              new Date().toLocaleString().replace(/[\s:/]/g, "_") +
              ".wav";

            if ((audioBlob as File).name) {
              title = (audioBlob as File).name;
            }

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
  );
}

export default AvatarVideoModal;
