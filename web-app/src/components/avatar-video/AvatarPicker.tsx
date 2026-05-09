"use client";

import { ImagePlus, Trash2 } from "lucide-react";
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
import { cn } from "~/lib/utils";

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
  // ── Preview Mode ──────────────────────────────────────────────────────────
  if (previewUrl) {
    const isLocalBlob = previewUrl.startsWith("blob:");

    return (
      <div className="flex size-full flex-col items-center justify-center gap-4">
        <div className="group border-border/50 bg-muted/40 relative w-full overflow-hidden rounded-[2rem] border p-2 shadow-sm">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-black shadow-inner">
            <Image
              src={previewUrl}
              alt={avatarFile ? avatarFile.name : "Selected avatar"}
              width={0}
              height={0}
              sizes="100vw"
              unoptimized={isLocalBlob}
              onLoad={(e) =>
                e.currentTarget.setAttribute("data-loaded", "true")
              }
              className={cn(
                "img-scale-down-blur-up w-full",
                isLocalBlob ? "h-auto" : "aspect-square",
              )}
            />

            {/* Gradient overlay for the trash button */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={onRemove}
                  aria-label="Remove avatar photo"
                  className="absolute right-4 bottom-4 size-11 translate-y-4 rounded-full opacity-0 shadow-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
                >
                  <Trash2 className="size-5" />
                </Button>
              </TooltipTrigger>

              <TooltipContent>Remove avatar</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }

  // ── Picker Mode ───────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col gap-6">
      {/* Upload area */}
      <Label className="group border-primary/20 bg-primary/5 hover:border-primary/40 hover:bg-primary/10 focus-within:border-primary focus-within:ring-primary relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-[2rem] border-2 border-dashed px-6 py-10 text-center transition-all duration-300 focus-within:ring-2 focus-within:ring-offset-0 focus-within:outline-none active:scale-[0.98]">
        <div className="bg-background text-primary group-hover:bg-primary group-hover:text-primary-foreground rounded-2xl p-4 shadow-sm transition-all duration-300 group-hover:scale-110 group-active:scale-95">
          <ImagePlus className="size-8" />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-foreground text-base font-semibold tracking-tight">
            Upload Portrait Photo
          </span>

          <span className="text-muted-foreground text-xs font-medium">
            JPG, PNG, or WEBP (Max 5MB)
          </span>
        </div>

        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileChange}
          className="sr-only"
        />
      </Label>

      {error && (
        <p className="text-destructive -mt-3 text-center text-sm font-medium">
          {error}
        </p>
      )}

      {/* Sample avatars */}
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="bg-border h-px grow" />

          <span className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
            Or try a sample
          </span>

          <div className="bg-border h-px grow" />
        </div>

        <ul className="grid grid-cols-3 gap-3">
          {SAMPLE_AVATARS.map(({ r2Key, publicUrl }) => (
            <li key={r2Key}>
              <button
                type="button"
                onClick={() => onSampleSelect(r2Key, publicUrl)}
                className="group border-border bg-muted/50 hover:border-primary/50 focus-visible:ring-primary relative flex aspect-square w-full overflow-hidden rounded-2xl border transition-all hover:shadow-md focus-visible:ring-2 focus-visible:outline-none active:scale-95"
                aria-label="Select sample avatar"
              >
                <Image
                  src={publicUrl}
                  alt="Sample avatar"
                  fill
                  sizes="(max-width: 768px) 33vw, 150px"
                  onLoad={(e) =>
                    e.currentTarget.setAttribute("data-loaded", "true")
                  }
                  className="img-scale-down-blur-up object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AvatarPicker;
