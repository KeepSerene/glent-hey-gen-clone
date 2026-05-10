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
export type GenerationItem = AvatarVideoItem | VoiceoverItem;

interface GenerationCardProps {
  item: GenerationItem;
  onPlay: (
    id: string,
    type: GenerationItem["type"],
    title: string | null,
  ) => void;
  onDelete: (
    id: string,
    type: GenerationItem["type"],
    title: string | null,
    status: string,
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

export default function GenerationCard({
  item,
  onPlay,
  onDelete,
}: GenerationCardProps) {
  const isCompleted = item.status === "completed";
  const statusCfg =
    GEN_CARD_STATUS_CONFIG[item.status] ?? GEN_CARD_STATUS_CONFIG.queued!;
  const isAvatarVideo = item.type === "avatar-video";

  // Separate flag and name so we can apply the emoji font specifically
  const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === item.language);
  const flag = langObj?.flag ?? "";
  const langName = langObj?.name ?? item.language.toUpperCase();

  return (
    <article className="group bg-card flex flex-col overflow-hidden rounded-2xl border transition-shadow duration-200 hover:shadow-md">
      {/* ── Media Header ─────────────────────────────────────────────────── */}
      <div className="bg-muted relative aspect-video w-full overflow-hidden">
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
          <div className="flex h-full w-full items-center justify-center bg-blue-50 dark:bg-blue-500/10">
            <Video className="size-10 text-blue-300 dark:text-blue-500/50" />
          </div>
        ) : (
          <VoiceoverThumbnail id={item.id} />
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide shadow-sm",
              statusCfg.className,
            )}
          >
            {statusCfg.label}
          </Badge>
        </div>
      </div>

      {/* ── Card Content ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4 pb-3">
        <h3
          className="text-foreground mb-1 line-clamp-1 text-base font-semibold"
          title={item.title ?? undefined}
        >
          {item.title ??
            (isAvatarVideo ? "Untitled video" : "Untitled voiceover")}
        </h3>

        {/* Metadata Row */}
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Badge
            variant="secondary"
            className={cn(
              "rounded-full border-none px-2 py-0 text-[10px] font-semibold",
              isAvatarVideo
                ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
            )}
          >
            {isAvatarVideo ? "Avatar Video" : "Voiceover"}
          </Badge>

          <span className="flex items-center gap-1">
            <span style={{ fontFamily: "var(--font-emoji)" }}>{flag}</span>
            <span>{langName}</span>
          </span>

          <span>•</span>
          <span>{getRelativeTime(item.createdAt)}</span>
        </div>

        {/* ── Actions Bar ────────────────────────────────────────────────── */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
          {isCompleted ? (
            <Button
              type="button"
              onClick={() => onPlay(item.id, item.type, item.title)}
              className="grow rounded-full"
            >
              <Play className="size-4 fill-current" />
              Play
            </Button>
          ) : (
            <div className="flex-1" /> /* Empty space to push icons right */
          )}

          <div className="flex items-center gap-1">
            {isCompleted && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
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
                  variant="destructive"
                  size="icon"
                  onClick={() =>
                    onDelete(item.id, item.type, item.title, item.status)
                  }
                  aria-label="Delete generation"
                  className="rounded-full"
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
