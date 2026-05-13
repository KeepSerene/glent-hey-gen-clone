"use client";

import Image from "next/image";
import { DownloadCloud, Play, Trash2, Video } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type {
  ClientAvatarVideo,
  ClientVoiceover,
} from "~/server/actions/history";
import { GEN_CARD_STATUS_CONFIG, SUPPORTED_LANGUAGES } from "~/lib/constants";
import { cn, getRelativeTime, getWaveformBars } from "~/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type AvatarVideoItem = ClientAvatarVideo & { type: "avatar-video" };
type VoiceoverItem = ClientVoiceover & { type: "voiceover" };
export type MediaItem = AvatarVideoItem | VoiceoverItem;

interface MediaCardProps {
  item: MediaItem;
  onPlay: (id: string, type: MediaItem["type"], title: string | null) => void;
  onDelete: (
    id: string,
    type: MediaItem["type"],
    title: string | null,
    status: string,
  ) => void;
}

function VoiceoverThumbnail({ id }: { id: string }) {
  const bars = getWaveformBars(id);
  const maxBar = Math.max(...bars);

  return (
    <div className="bg-muted/60 flex h-full w-full items-center justify-center gap-0.5 px-6 dark:bg-gray-800/60">
      {bars.map((h, i) => (
        <div
          key={i}
          style={{ height: `${(h / maxBar) * 56}%` }}
          className="w-1 shrink-0 rounded-full bg-linear-to-t from-emerald-500/70 to-emerald-400/40"
        />
      ))}
    </div>
  );
}

export default function MediaCard({ item, onPlay, onDelete }: MediaCardProps) {
  const isCompleted = item.status === "completed";
  const statusCfg =
    GEN_CARD_STATUS_CONFIG[item.status] ?? GEN_CARD_STATUS_CONFIG.queued!;
  const isAvatarVideo = item.type === "avatar-video";

  const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === item.language);
  const flag = langObj?.flag ?? "";
  const langName = langObj?.name ?? item.language.toUpperCase();

  return (
    <article className="group border-border/40 bg-card focus-within:border-primary/30 flex flex-col overflow-hidden rounded-xl border shadow-sm transition-shadow duration-300 hover:shadow-lg">
      {/* ── Thumbnail ─────────────────────────────────────────────────── */}
      <div className="relative aspect-video w-full overflow-hidden">
        {isAvatarVideo && item.avatarUrl ? (
          <Image
            src={item.avatarUrl}
            alt={item.title ?? "Avatar"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={(e) => e.currentTarget.setAttribute("data-loaded", "true")}
            className="img-scale-down-blur-up object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : isAvatarVideo ? (
          <div className="bg-muted/50 flex h-full w-full items-center justify-center">
            <Video className="text-muted-foreground/30 size-10" />
          </div>
        ) : (
          <VoiceoverThumbnail id={item.id} />
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide shadow-sm backdrop-blur-sm select-none",
              statusCfg.className,
            )}
          >
            {statusCfg.label}
          </Badge>
        </div>
      </div>

      {/* ── Info & actions ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 p-3">
        {/* Title */}
        <Tooltip>
          <TooltipTrigger type="button" className="cursor-default text-left">
            <h3 className="text-foreground line-clamp-1 text-sm font-semibold">
              {item.title ??
                (isAvatarVideo ? "Untitled video" : "Untitled voiceover")}
            </h3>
          </TooltipTrigger>

          <TooltipContent side="bottom">{item?.title}</TooltipContent>
        </Tooltip>

        {/* Metadata row + action icons */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left side: metadata chips */}
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Badge
              variant="secondary"
              className={cn(
                "rounded-md px-1.5 py-0 text-[10px] font-medium select-none",
                isAvatarVideo
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
              )}
            >
              {isAvatarVideo ? "Avatar Video" : "Voiceover"}
            </Badge>

            <span className="flex items-center gap-0.5">
              <span className="font-emoji">{flag}</span>
              <span>{langName}</span>
            </span>

            <span className="text-muted-foreground/60">•</span>
            <span>{getRelativeTime(item.createdAt)}</span>
          </div>

          {/* Right side: action buttons */}
          <div className="flex items-center gap-0.5">
            {isCompleted && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPlay(item.id, item.type, item.title)}
                    aria-label="Play"
                    className="text-muted-foreground hover:text-foreground rounded-full"
                  >
                    <Play className="size-4 fill-current" />
                  </Button>
                </TooltipTrigger>

                <TooltipContent>Play</TooltipContent>
              </Tooltip>
            )}

            {isCompleted && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground rounded-full"
                    asChild
                  >
                    <a
                      href={`/api/assets/${item.type}/${item.id}?download=1`}
                      aria-label="Download"
                    >
                      <DownloadCloud className="size-4" />
                    </a>
                  </Button>
                </TooltipTrigger>

                <TooltipContent>Download</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    onDelete(item.id, item.type, item.title, item.status)
                  }
                  aria-label="Delete"
                  className="text-muted-foreground hover:text-destructive rounded-full"
                >
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>

              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </article>
  );
}
