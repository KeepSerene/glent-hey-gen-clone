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
  const themeColor = isAvatarVideo ? "blue" : "emerald";

  const themeClasses = {
    blue: {
      border: "hover:border-blue-200 dark:hover:border-blue-500/30",
      ring: "focus-visible:ring-blue-500",
      gradient:
        "from-blue-500/0 to-blue-500/10 dark:from-blue-500/0 dark:to-blue-500/15",
      iconText: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
    },
    emerald: {
      border: "hover:border-emerald-200 dark:hover:border-emerald-500/30",
      ring: "focus-visible:ring-emerald-500",
      gradient:
        "from-emerald-500/0 to-emerald-500/10 dark:from-emerald-500/0 dark:to-emerald-500/15",
      iconText: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
  }[themeColor];

  return (
    <button
      type="button"
      onClick={isCompleted ? onPlay : undefined}
      disabled={!isCompleted}
      className={cn(
        "group bg-card focus-visible:ring-offset-background relative flex w-full items-center gap-3 overflow-hidden rounded-[20px] border p-3 text-left transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        themeClasses.ring,
        isCompleted
          ? cn("cursor-pointer hover:shadow-md", themeClasses.border)
          : "cursor-default opacity-90",
      )}
    >
      {/* Hover gradient */}
      {isCompleted && (
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
            themeClasses.gradient,
          )}
        />
      )}

      {/* Content wrapper */}
      <span className="relative z-10 flex w-full items-center gap-3">
        {/* Thumbnail */}
        <span className="bg-muted relative size-11 shrink-0 overflow-hidden rounded-[14px]">
          {isAvatarVideo && item.avatarUrl ? (
            <Image
              src={item.avatarUrl}
              alt={item.title ?? "Avatar"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onLoad={(e) =>
                e.currentTarget.setAttribute("data-loaded", "true")
              }
              className="img-scale-down-blur-up"
            />
          ) : (
            <span
              className={cn(
                "flex h-full w-full items-center justify-center",
                themeClasses.iconBg,
              )}
            >
              {isAvatarVideo ? (
                <Video className={cn("size-5", themeClasses.iconText)} />
              ) : (
                <AudioWaveform
                  className={cn("size-5", themeClasses.iconText)}
                />
              )}
            </span>
          )}

          {/* Play icon overlay */}
          {isCompleted && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/30 group-hover:opacity-100">
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
      <div className="mb-5 flex items-center justify-between px-1">
        <h3 className="font-heading text-foreground text-lg font-bold">
          Recent creations
        </h3>

        <Button variant="link" asChild>
          <Link href="/history">
            View all
            <ArrowRight className="size-3.5" />
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
