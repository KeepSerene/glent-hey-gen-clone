"use client";

import { Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { SAMPLE_AVATARS } from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface AvatarPickerProps {
  previewUrl: string | null;
  avatarFile: File | null;
  error: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSampleSelect: (r2Key: string, publicUrl: string) => void;
  onRemove: () => void;
}

function AvatarPicker({
  previewUrl,
  avatarFile,
  error,
  onFileChange,
  onSampleSelect,
  onRemove,
}: AvatarPickerProps) {
  if (previewUrl) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Image
            src={previewUrl}
            alt={avatarFile ? avatarFile.name : "Selected avatar"}
            width={512}
            height={512}
            onLoad={(e) => e.currentTarget.setAttribute("data-loaded", "true")}
            className="img-scale-down-blur-up max-h-85 max-w-full rounded-xl border object-cover lg:max-w-85"
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={onRemove}
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
    );
  }

  return (
    <div className="bg-muted border-accent flex h-full flex-col items-center rounded-xl border-2 border-dashed px-4 pt-8 pb-4">
      <div className="flex grow flex-col items-center justify-center">
        <UploadCloud className="text-muted-foreground mb-2 size-10" />

        <Label className="cursor-pointer font-medium underline">
          Upload to cloud
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFileChange}
            className="hidden"
          />
        </Label>

        {error && (
          <p className="text-destructive mt-2 text-sm font-medium">{error}</p>
        )}

        <p className="text-muted-foreground/80 mt-2 text-center text-xs">
          Portrait photo in JPG, PNG, or WEBP.
        </p>
      </div>

      <div className="mt-6 w-full">
        <p className="text-muted-foreground text-xs">Try a sample avatar</p>

        <ul className="mt-1 flex gap-2">
          {SAMPLE_AVATARS.map(({ r2Key, publicUrl }) => (
            <li
              key={r2Key}
              onClick={() => onSampleSelect(r2Key, publicUrl)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSampleSelect(r2Key, publicUrl);
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
                  e.currentTarget.setAttribute("data-loaded", "true")
                }
                className="img-scale-down-blur-up size-full object-cover"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AvatarPicker;
