"use client";

import { Button } from "~/components/ui/button";
import { AudioWaveform, ArrowRight, Play, Video } from "lucide-react";
import Link from "next/link";
import type { RecentItem } from "~/server/actions/history";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { RECENT_CARD_STATUS_DOT } from "~/lib/constants";
import MediaPlayerModal from "../modals/MediaPlayerModal";
import Image from "next/image";

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
          <Image
            src={item.avatarUrl}
            alt={item.title ?? "Avatar"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={(e) => e.currentTarget.setAttribute("data-loaded", "true")}
            className="img-scale-down-blur-up"
          />
        ) : isAvatarVideo ? (
          <span className="flex h-full w-full items-center justify-center bg-blue-50 dark:bg-blue-500/10">
            <Video className="size-4 text-blue-400" />
          </span>
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-emerald-50 dark:bg-emerald-500/10">
            <AudioWaveform className="size-4 text-emerald-500" />
          </span>
        )}

        {/* Play icon overlay */}
        {isCompleted && (
          <span className="group-focus-within:ring-primary absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-150 group-hover:bg-black/30 group-hover:opacity-100 group-focus-visible:bg-black/30 group-focus-visible:opacity-100 group-focus-visible:outline-none">
            <Play className="size-4 fill-white text-white" />
          </span>
        )}
      </span>

      {/* Text */}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-foreground truncate text-sm font-medium">
          {item.title ??
            (isAvatarVideo ? "Untitled video" : "Untitled voiceover")}
        </span>

        <span className="flex items-center gap-1.5">
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
        </span>
      </span>
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

  const handlePlay = async (item: RecentItem) => {
    if (item.status !== "completed") return;

    setPlayingItem(item);
  };

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-foreground text-lg font-semibold">
          Recent creations
        </h3>

        <Button variant="link" asChild>
          <Link href="/history">
            View all
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <li key={`${item.type}-${item.id}`}>
            <RecentCard item={item} onPlay={() => handlePlay(item)} />
          </li>
        ))}
      </ul>

      <MediaPlayerModal
        item={playingItem}
        onClose={() => setPlayingItem(null)}
      />
    </section>
  );
}
