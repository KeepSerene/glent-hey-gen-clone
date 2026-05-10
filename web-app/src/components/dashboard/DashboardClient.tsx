"use client";

import { useState } from "react";
import {
  DASHBOARD_ACTIONS,
  DAILY_LIMITS,
  GENERATION_COSTS,
} from "~/lib/constants";
import { cn } from "~/lib/utils";
import AvatarVideoModal from "../modals/AvatarVideoModal";
import { Badge } from "../ui/badge";
import AiVoiceStudioModal from "../modals/AiVoiceStudioModal";
import useGenerationQuota from "~/hooks/useGenerationQuota";
import type { RecentItem } from "~/server/actions/history";
import RecentGenerationsStrip from "./RecentGenerationsStrip";

type ActionMode =
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
  const isVoiceoverLimitReached = quota?.["voiceover"].isExceeded ?? false;
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
    <main className="overflow-y-auto p-8">
      {/* ── Action cards ───────────────────────────────────────────────── */}
      <section className="mb-8 flex flex-col gap-1">
        <h2 className="font-heading text-foreground text-2xl font-bold tracking-tight">
          What are we producing today?
        </h2>

        <p className="text-muted-foreground text-sm">
          Choose a Glent AI tool to bring your ideas to life.
        </p>
      </section>

      <ul className="mb-2 flex flex-wrap gap-5">
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

            return (
              <li key={label} className="max-w-md min-w-[320px] flex-1">
                <button
                  type="button"
                  onClick={() =>
                    !comingSoon && handleModalOpen(mode as ActionMode)
                  }
                  disabled={comingSoon}
                  className={cn(
                    "group bg-card focus-visible:ring-primary relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:outline-none",
                    comingSoon
                      ? "cursor-not-allowed opacity-60 grayscale-[0.3]"
                      : limited
                        ? "hover:border-destructive/20 hover:bg-secondary/10 cursor-pointer hover:shadow-sm"
                        : "hover:border-primary/20 hover:bg-secondary/20 cursor-pointer hover:shadow-md",
                  )}
                >
                  <span
                    className={cn(
                      "flex shrink-0 items-center justify-center rounded-xl p-3.5 transition-transform duration-300 group-hover:scale-110",
                      iconWrapperClassName,
                      limited && "opacity-50 grayscale",
                    )}
                  >
                    <Icon className="size-6" />
                  </span>

                  <span className="flex w-full flex-col justify-center overflow-hidden">
                    <span className="flex items-center gap-2 text-base font-semibold transition-transform duration-300 group-hover:-translate-y-1">
                      {label}

                      {comingSoon && (
                        <Badge className="rounded-full px-2 py-0 text-[10px] font-semibold">
                          Coming soon
                        </Badge>
                      )}

                      {!comingSoon && limited && (
                        <Badge
                          variant="destructive"
                          className="rounded-full px-2 py-0 text-[10px] font-semibold"
                        >
                          Limit reached
                        </Badge>
                      )}
                    </span>

                    <span className="text-muted-foreground max-h-0 text-sm opacity-0 transition-all duration-300 group-hover:max-h-10 group-hover:-translate-y-0.5 group-hover:opacity-100">
                      {limited
                        ? "Daily limit reached — open to see when it resets."
                        : description}
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
      />

      <AiVoiceStudioModal
        isOpen={voiceStudioOpen}
        onOpenStateChange={setVoiceStudioOpen}
        isLimitReached={isVoiceoverLimitReached}
        resetsAt={quota?.["voiceover"].resetsAt ?? null}
        isNoCredits={isVoiceNoCredits}
      />
    </main>
  );
}

export default DashboardClient;
