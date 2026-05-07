"use client";

import { ShieldAlert } from "lucide-react";
import { formatResetTime } from "~/lib/utils";

interface LimitBannerProps {
  resetsAt: string | null;
  /** "avatar video" | "voiceover" */
  type: string;
  limit: number;
}

/**
 * Rendered inside a modal when the user has hit their daily generation limit.
 * Replaces the form content so the UI clearly communicates what happened and
 * when they can generate again — rather than just showing a disabled button.
 */
const LimitBanner = ({ resetsAt, type, limit }: LimitBannerProps) => (
  <div className="bg-destructive/5 border-destructive/20 flex flex-col items-center gap-4 rounded-xl border p-6 py-10 text-center">
    <div className="bg-destructive/10 flex size-14 items-center justify-center rounded-full">
      <ShieldAlert className="text-destructive size-7" />
    </div>

    <div className="flex flex-col gap-1.5">
      <p className="text-foreground text-base font-semibold">
        Daily limit reached
      </p>

      <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
        This is a free-tier portfolio project. You can generate up to{" "}
        <span className="text-foreground font-medium">
          {limit} {type}
          {limit !== 1 ? "s" : ""}
        </span>{" "}
        per 24-hour window.
      </p>
    </div>

    <div className="bg-muted/60 rounded-lg px-4 py-2.5">
      <p className="text-muted-foreground text-xs">
        Your quota resets{" "}
        <span className="text-foreground font-semibold">
          {formatResetTime(resetsAt)}
        </span>
      </p>
    </div>
  </div>
);

export default LimitBanner;
