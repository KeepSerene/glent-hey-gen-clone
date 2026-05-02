"use client";

import { Trash2, UploadCloud } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useState } from "react";
import { SAMPLE_AVATARS } from "~/lib/constants";
import Image from "next/image";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { cn } from "~/lib/utils";
import AudioInputModal from "./AudioInputModal";

interface VideoGenModalProps {
  isOpen: boolean;
  onOpenStateChange: (isOpen: boolean) => void;
}

function AvatarVideoModal({ isOpen, onOpenStateChange }: VideoGenModalProps) {
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [script, setScript] = useState("");
  const [audioInputModalOpen, setAudioInputModalOpen] = useState(false);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
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

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={handleAvatarRemove}
                      className="absolute top-2 right-2 rounded-full"
                    >
                      <Trash2 className="size-4" />
                    </Button>
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
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </Label>

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

            {/* Right: script + options */}
            <div className="flex grow flex-col gap-4">
              <div className="">
                <div className="relative">
                  <Textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    rows={10}
                    maxLength={210}
                    placeholder="Type your script here,"
                    className="min-h-32 resize-none break-all"
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
                </div>
              </div>
            </div>
          </div>
        </div>

        <AudioInputModal
          isOpen={audioInputModalOpen}
          onOpenStateChange={setAudioInputModalOpen}
          onAudioRecorded={(audioBlob: Blob) => {}}
        />
      </DialogContent>
    </Dialog>
  );
}

export default AvatarVideoModal;
