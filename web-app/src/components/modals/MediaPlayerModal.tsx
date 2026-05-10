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

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-w-lg flex-col rounded-xl px-6 py-4">
        <DialogHeader className="mt-6">
          <DialogTitle className="truncate">
            {item?.title ?? "Playing..."}
          </DialogTitle>

          <DialogDescription className="sr-only">
            {isAvatarVideo
              ? "Video player for generated avatar animation."
              : "Audio player for generated voiceover."}
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            "bg-muted rounded-xl",
            isAvatarVideo ? "aspect-video" : "aspect-auto",
          )}
        >
          {isLoading && (
            <div className="flex h-full items-center justify-center py-6">
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
            <div className="w-full p-6">
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

        {playerUrl && item && (
          <Button variant="ghost" size="lg" asChild className="rounded-full">
            <a href={`/api/assets/${item.type}/${item.id}?download=1`}>
              <DownloadCloud className="size-4" />
              Download
            </a>
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
