"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DownloadCloud, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export interface PlayingItem {
  id: string;
  type: "avatar-video" | "voiceover";
  title: string | null;
}

interface MediaPlayerModalProps {
  item: PlayingItem | null;
  onClose: () => void;
}

export default function MediaPlayerModal({
  item,
  onClose,
}: MediaPlayerModalProps) {
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!item) {
      setPlayerUrl(null);
      return;
    }

    let isMounted = true;

    const fetchAsset = async () => {
      setIsLoading(true);
      setPlayerUrl(null);

      try {
        const res = await fetch(`/api/assets/${item.type}/${item.id}`);

        if (!res.ok) {
          throw new Error("Asset fetch failed");
        }

        const data = await res.json();

        if (isMounted) {
          setPlayerUrl(data.url);
        }
      } catch (err) {
        if (isMounted) {
          toast.error("Could not load the player. Try again.");
          onClose();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchAsset();

    return () => {
      isMounted = false;
    };
  }, [item, onClose]);

  const isAvatarVideo = item?.type === "avatar-video";
  const isVoiceover = item?.type === "voiceover";
  const themeColor = isAvatarVideo ? "blue" : "emerald";

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-w-lg flex-col overflow-hidden rounded-[24px] p-0">
        {/* Ambient glow */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -top-12 -left-12 size-64 rounded-full opacity-[0.10] blur-[60px] dark:opacity-[0.12]",
            themeColor === "blue" ? "bg-blue-500" : "bg-emerald-500",
          )}
        />

        <div className="relative z-10 flex w-full flex-col p-6">
          <DialogHeader className="mb-4">
            <Tooltip>
              <TooltipTrigger type="button" className="text-left">
                <DialogTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
                  {/* Staggered dash accent */}
                  <span aria-hidden className="flex shrink-0 gap-1">
                    <span
                      className={cn(
                        "h-5 w-1.5 rounded-full",
                        themeColor === "blue"
                          ? "bg-blue-500"
                          : "bg-emerald-500",
                      )}
                    />

                    <span
                      className={cn(
                        "mt-1.5 h-3.5 w-1.5 rounded-full opacity-60",
                        themeColor === "blue"
                          ? "bg-blue-500"
                          : "bg-emerald-500",
                      )}
                    />
                  </span>

                  <span className="truncate">
                    {item?.title ?? "Playing..."}
                  </span>
                </DialogTitle>
              </TooltipTrigger>
              <TooltipContent>{item && item.title}</TooltipContent>
            </Tooltip>

            <DialogDescription className="sr-only">
              {isAvatarVideo
                ? "Video player for generated avatar animation."
                : "Audio player for generated voiceover."}
            </DialogDescription>
          </DialogHeader>

          {/* Media player container */}
          <div
            className={cn(
              "bg-muted/50 border-border/50 relative overflow-hidden rounded-[20px] border shadow-inner",
              isAvatarVideo ? "aspect-video" : "aspect-auto",
            )}
          >
            {isLoading && (
              <div className="flex h-full min-h-30 w-full items-center justify-center">
                <Loader2 className="text-muted-foreground size-8 animate-spin" />
              </div>
            )}

            {!isLoading && playerUrl && isAvatarVideo && (
              <video
                src={playerUrl}
                controls
                controlsList="nodownload"
                disablePictureInPicture
                autoPlay
                playsInline
                className="size-full object-cover outline-none"
              />
            )}

            {!isLoading && playerUrl && isVoiceover && (
              <div className="flex w-full items-center justify-center p-6">
                <audio
                  src={playerUrl}
                  controls
                  controlsList="nodownload"
                  autoPlay
                  className="w-full outline-none"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            {playerUrl && item && (
              <Button
                size="lg"
                asChild
                className={cn(
                  "w-full rounded-full font-semibold tracking-wide shadow-none transition-all duration-300 sm:w-auto",
                  themeColor === "blue"
                    ? "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20! dark:text-blue-400 dark:hover:bg-blue-500/25!"
                    : "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20! dark:text-emerald-400 dark:hover:bg-emerald-500/25!",
                )}
              >
                <a href={`/api/assets/${item.type}/${item.id}?download=1`}>
                  <DownloadCloud className="mr-2 size-4" />
                  Download
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
