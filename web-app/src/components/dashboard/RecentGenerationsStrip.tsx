"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { AudioWaveform, ArrowRight, Play, Video } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { RecentItem } from "~/server/actions/history";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { RECENT_CARD_STATUS_DOT } from "~/lib/constants";

function RecentCard({
  item,
  onPlay,
}: {
  item: RecentItem;
  onPlay: () => void;
}) {
  const isAvatarVideo = item.type === "avatar-video";
  const isCompleted = item.status === "completed";

  return (
    <button
      type="button"
      onClick={isCompleted ? onPlay : undefined}
      disabled={!isCompleted}
      className={cn(
        "group bg-card flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200",
        isCompleted
          ? "hover:border-primary/20 hover:bg-secondary/20 cursor-pointer hover:shadow-sm"
          : "cursor-default",
      )}
    >
      {/* Thumbnail */}
      <span className="bg-muted relative size-10 shrink-0 overflow-hidden rounded-lg">
        {isAvatarVideo && item.avatarUrl ? (
          <img
            src={item.avatarUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : isAvatarVideo ? (
          <div className="flex h-full w-full items-center justify-center bg-blue-50 dark:bg-blue-500/10">
            <Video className="size-4 text-blue-400" />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-emerald-50 dark:bg-emerald-500/10">
            <AudioWaveform className="size-4 text-emerald-500" />
          </div>
        )}

        {/* Play icon overlay */}
        {isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-150 group-hover:bg-black/30 group-hover:opacity-100">
            <Play className="size-3 fill-white text-white" />
          </div>
        )}
      </span>

      {/* Text */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-foreground truncate text-sm font-medium">
          {item.title ??
            (isAvatarVideo ? "Untitled video" : "Untitled voiceover")}
        </p>

        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              RECENT_CARD_STATUS_DOT[item.status] ?? "bg-muted-foreground",
            )}
            aria-hidden
          />

          <span className="text-muted-foreground text-xs capitalize">
            {item.status === "tts_generating" ||
            item.status === "video_generating"
              ? "generating"
              : item.status}
          </span>
        </div>
      </div>
    </button>
  );
}

interface RecentGenerationsStripProps {
  items: RecentItem[];
}

export default function RecentGenerationsStrip({
  items,
}: RecentGenerationsStripProps) {
  const [playingItem, setPlayingItem] = useState<RecentItem | null>(null);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);

  const handlePlay = async (item: RecentItem) => {
    if (item.status !== "completed") return;

    setPlayingItem(item);
    setPlayerUrl(null);
    setIsLoadingPlayer(true);

    try {
      const res = await fetch(`/api/assets/${item.type}/${item.id}`);

      if (!res.ok) throw new Error("fetch failed");

      const data = (await res.json()) as { url: string };
      setPlayerUrl(data.url);
    } catch {
      toast.error("Could not load the player. Try again.");
      setPlayingItem(null);
    } finally {
      setIsLoadingPlayer(false);
    }
  };

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-foreground text-lg font-semibold">
          Recent creations
        </h3>

        <Link
          href="/history"
          className="text-primary flex items-center gap-1 text-sm hover:underline"
        >
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <li key={`${item.type}-${item.id}`}>
            <RecentCard item={item} onPlay={() => handlePlay(item)} />
          </li>
        ))}
      </ul>

      {/* Mini player dialog */}
      <Dialog
        open={!!playingItem}
        onOpenChange={(open) => !open && setPlayingItem(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="truncate pr-6 text-base font-semibold">
              {playingItem?.title ?? "Playing…"}
            </DialogTitle>

            {/* FIX: DialogDescription missing - will get an warning! */}
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div
              className={cn(
                "bg-muted flex min-h-30 items-center justify-center rounded-xl",
                playingItem?.type === "avatar-video" && "aspect-video min-h-0",
              )}
            >
              {isLoadingPlayer && (
                <div className="flex flex-col items-center gap-2">
                  <div className="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent" />
                  <p className="text-muted-foreground text-xs">Loading…</p>
                </div>
              )}

              {!isLoadingPlayer &&
                playerUrl &&
                playingItem?.type === "avatar-video" && (
                  <video
                    src={playerUrl}
                    controls
                    autoPlay
                    playsInline
                    className="h-full w-full rounded-xl object-contain"
                  />
                )}

              {!isLoadingPlayer &&
                playerUrl &&
                playingItem?.type === "voiceover" && (
                  <div className="w-full px-4">
                    <audio
                      src={playerUrl}
                      controls
                      autoPlay
                      className="w-full"
                    />
                  </div>
                )}
            </div>

            {playerUrl && playingItem && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`/api/assets/${playingItem.type}/${playingItem.id}?download=1`}
                  >
                    Download
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
