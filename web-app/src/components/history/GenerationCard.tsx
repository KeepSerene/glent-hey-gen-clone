"use client";

import { Download, DownloadCloud, Play, Video } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type {
  ClientAvatarVideo,
  ClientVoiceover,
} from "~/server/actions/history";
import { GEN_CARD_STATUS_CONFIG } from "~/lib/constants";
import {
  cn,
  getLanguageLabel,
  getRelativeTime,
  getWaveformBars,
} from "~/lib/utils";
import Image from "next/image";

type AvatarVideoItem = ClientAvatarVideo & { type: "avatar-video" };
type VoiceoverItem = ClientVoiceover & { type: "voiceover" };
export type GenerationItem = AvatarVideoItem | VoiceoverItem;

interface GenerationCardProps {
  item: GenerationItem;
  onPlay: (
    id: string,
    type: GenerationItem["type"],
    title: string | null,
  ) => void;
}

function VoiceoverThumbnail({ id }: { id: string }) {
  const bars = getWaveformBars(id);
  const maxBar = Math.max(...bars);

  return (
    <div className="flex h-full w-full items-center justify-center gap-0.75 bg-linear-to-br from-emerald-50 to-emerald-100/60 px-6 dark:from-emerald-500/10 dark:to-emerald-500/5">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-1 shrink-0 rounded-full bg-emerald-400/80 dark:bg-emerald-400/60"
          style={{ height: `${(h / maxBar) * 56}%` }}
        />
      ))}
    </div>
  );
}

export default function GenerationCard({ item, onPlay }: GenerationCardProps) {
  const isCompleted = item.status === "completed";
  const statusCfg =
    GEN_CARD_STATUS_CONFIG[item.status] ?? GEN_CARD_STATUS_CONFIG.queued!;
  const isAvatarVideo = item.type === "avatar-video";

  return (
    <article className="group bg-card flex flex-col overflow-hidden rounded-2xl border transition-shadow duration-200 hover:shadow-md">
      {/* ── Thumbnail ──────────────────────────────────────────────────────── */}
      <div className="bg-muted relative aspect-video w-full overflow-hidden">
        {isAvatarVideo && item.avatarUrl ? (
          <Image
            src={item.avatarUrl}
            alt={item.title ?? "Avatar"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={(e) => e.currentTarget.setAttribute("data-loaded", "true")}
            className="img-scale-down-blur-up transition-transform duration-300 group-hover:scale-105"
          />
        ) : isAvatarVideo ? (
          // Fallback when no avatar URL is available yet
          <div className="flex h-full w-full items-center justify-center bg-blue-50 dark:bg-blue-500/10">
            <Video className="size-10 text-blue-300 dark:text-blue-500/50" />
          </div>
        ) : (
          <VoiceoverThumbnail id={item.id} />
        )}

        {/* Status badge overlaid on thumbnail */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
              statusCfg.className,
            )}
          >
            {statusCfg.label}
          </span>
        </div>

        {/* Play overlay */}
        {isCompleted && (
          <button
            type="button"
            onClick={() => onPlay(item.id, item.type, item.title)}
            aria-label={`Play ${item.title ?? "generation"}`}
            className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100"
          >
            <span className="text-foreground flex size-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
              <Play className="ml-0.5 size-5 fill-current" />
            </span>
          </button>
        )}
      </div>

      {/* ── Card body ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Type + language row */}
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "rounded-full px-2 py-0 text-[10px] font-semibold",
              isAvatarVideo
                ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
            )}
          >
            {isAvatarVideo ? "Avatar Video" : "Voiceover"}
          </Badge>

          <span className="text-muted-foreground text-xs">
            {getLanguageLabel(item.language)}
          </span>
        </div>

        {/* Title */}
        <p
          className="text-foreground line-clamp-2 text-sm leading-snug font-medium"
          title={item.title ?? undefined}
        >
          {item.title ??
            (isAvatarVideo ? "Untitled video" : "Untitled voiceover")}
        </p>

        {/* Date */}
        <p className="text-muted-foreground mt-auto text-xs">
          {getRelativeTime(item.createdAt)}
        </p>

        {/* Actions — only when completed */}
        {isCompleted && (
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              onClick={() => onPlay(item.id, item.type, item.title)}
              className="h-8 flex-1 text-xs"
            >
              <Play className="size-3 fill-current" />
              Play
            </Button>

            <Button variant="outline" size="sm" className="h-8 px-3" asChild>
              <a
                href={`/api/assets/${item.type}/${item.id}?download=1`}
                aria-label="Download"
              >
                <DownloadCloud className="size-3.5" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
