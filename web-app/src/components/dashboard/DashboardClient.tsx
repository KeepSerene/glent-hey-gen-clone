"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  DASHBOARD_ACTIONS,
  type DAILY_LIMITS,
  GENERATION_COSTS,
  DASHBOARD_ACTION_THEMES,
} from "~/lib/constants";
import { cn } from "~/lib/utils";
import AvatarVideoModal from "../modals/AvatarVideoModal";
import { Badge } from "../ui/badge";
import AiVoiceStudioModal from "../modals/AiVoiceStudioModal";
import useGenerationQuota from "~/hooks/useGenerationQuota";
import type { RecentItem } from "~/server/actions/history";
import RecentGenerationsStrip from "./RecentGenerationsStrip";

export type ActionMode =
  | "avatar-video"
  | "ai-voice-studio"
  | "video-translation"
  | "video-dubbing";

const MODE_TO_QUOTA_KEY: Partial<
  Record<ActionMode, keyof typeof DAILY_LIMITS>
> = {
  "avatar-video": "avatar-video",
  "ai-voice-studio": "voiceover",
};

interface DashboardClientProps {
  recentItems: RecentItem[];
}

function DashboardClient({ recentItems }: DashboardClientProps) {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [voiceStudioOpen, setVoiceStudioOpen] = useState(false);

  const { data: quota } = useGenerationQuota();

  const isAvatarLimitReached = quota?.["avatar-video"].isExceeded ?? false;
  const isVoiceoverLimitReached = quota?.voiceover.isExceeded ?? false;
  const isAvatarNoCredits = quota
    ? quota.credits < GENERATION_COSTS["avatar-video"]
    : false;
  const isVoiceNoCredits = quota
    ? quota.credits < GENERATION_COSTS.voiceover
    : false;

  const handleModalOpen = (mode: ActionMode) => {
    if (mode === "avatar-video") {
      setVideoModalOpen(true);
    } else if (mode === "ai-voice-studio") {
      setVoiceStudioOpen(true);
    }
  };

  const isCardLimited = (mode: string): boolean => {
    const quotaKey = MODE_TO_QUOTA_KEY[mode as ActionMode];

    if (!quotaKey || !quota) return false;

    return quota[quotaKey].isExceeded;
  };

  return (
    <main className="p-6 sm:p-8">
      {/* ── Action cards ───────────────────────────────────────────────── */}
      <section className="mb-8 flex flex-col gap-1.5">
        <h2 className="font-heading text-foreground text-2xl font-bold tracking-tight">
          What are we producing today?
        </h2>

        <p className="text-muted-foreground text-sm">
          Choose a Glent studio tool to bring your ideas to life.
        </p>
      </section>

      <ul className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_ACTIONS.map(
          ({
            mode,
            label,
            icon: Icon,
            iconWrapperClassName,
            description,
            comingSoon,
          }) => {
            const limited = isCardLimited(mode);
            const theme = DASHBOARD_ACTION_THEMES[mode];

            return (
              <li key={label} className="flex size-full">
                <button
                  type="button"
                  onClick={() => !comingSoon && handleModalOpen(mode)}
                  disabled={comingSoon}
                  className={cn(
                    "group bg-card focus-visible:ring-offset-background relative flex w-full flex-col items-start gap-6 overflow-hidden rounded-[24px] border p-6 text-left transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                    theme.ring,
                    comingSoon
                      ? "cursor-not-allowed opacity-60 grayscale-[0.4]"
                      : limited
                        ? "hover:border-destructive/30 cursor-pointer hover:shadow-sm"
                        : cn("cursor-pointer hover:shadow-md", theme.border),
                  )}
                >
                  {/* Gradient bg on hover */}
                  {!comingSoon && !limited && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                        theme.gradient,
                      )}
                    />
                  )}

                  {/* Destructive tint bg if limited */}
                  {limited && (
                    <span
                      aria-hidden
                      className="bg-destructive/5 absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                  )}

                  {/* Content container */}
                  <span className="relative z-10 flex size-full flex-col gap-4">
                    <span className="flex w-full items-start justify-between gap-3">
                      <span
                        className={cn(
                          "flex items-center justify-center rounded-2xl p-3.5 transition-transform duration-300 group-hover:scale-105",
                          iconWrapperClassName,
                          limited && "opacity-60 grayscale",
                        )}
                      >
                        <Icon className="size-6" />
                      </span>

                      {/* Status badges */}
                      {comingSoon && (
                        <Badge
                          variant="secondary"
                          className="bg-secondary/60 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide"
                        >
                          Coming soon
                        </Badge>
                      )}

                      {!comingSoon && limited && (
                        <Badge
                          variant="destructive"
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide shadow-none"
                        >
                          Limit Reached
                        </Badge>
                      )}
                    </span>

                    <span className="mt-auto flex flex-col gap-1 pt-2">
                      <span className="flex items-center gap-2">
                        <span className="font-heading text-foreground text-lg font-bold">
                          {label}
                        </span>

                        {!comingSoon && (
                          <ArrowRight
                            aria-hidden
                            className="text-foreground/70 group-hover:text-foreground size-4 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                          />
                        )}
                      </span>

                      <span className="text-muted-foreground text-sm leading-relaxed">
                        {limited ? "Open to see when it resets." : description}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          },
        )}
      </ul>

      {/* ── Recent generations ─────────────────────────────────────────── */}
      {recentItems.length > 0 && <RecentGenerationsStrip items={recentItems} />}

      {/* ── Generation modals ─────────────────────────────────────────── */}
      <AvatarVideoModal
        isOpen={videoModalOpen}
        onOpenStateChange={setVideoModalOpen}
        isLimitReached={isAvatarLimitReached}
        resetsAt={quota?.["avatar-video"].resetsAt ?? null}
        isNoCredits={isAvatarNoCredits}
        themeColor="blue"
      />

      <AiVoiceStudioModal
        isOpen={voiceStudioOpen}
        onOpenStateChange={setVoiceStudioOpen}
        isLimitReached={isVoiceoverLimitReached}
        resetsAt={quota?.voiceover.resetsAt ?? null}
        isNoCredits={isVoiceNoCredits}
        themeColor="emerald"
      />
    </main>
  );
}

export default DashboardClient;
