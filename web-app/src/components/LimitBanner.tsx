"use client";

import { CreditCard, ShieldAlert } from "lucide-react";
import { formatResetTime } from "~/lib/utils";
import { UpgradeButton } from "./UpgradeButton";
import {
  GEN_QUOTA_WINDOWS_MS,
  type GenerationEventType,
} from "~/lib/constants";

interface LimitBannerProps {
  resetsAt: string | null;
  /** "avatar video" | "voiceover" */
  type: string;
  limit: number;
  /**
   * True when the user has fewer credits than the cost of this generation type.
   * Takes visual priority over the daily-limit state.
   */
  noCredits?: boolean;
}

/**
 * Rendered inside a modal when the user cannot generate — either due to
 * insufficient credits (priority) or a daily quota limit.
 */
function LimitBanner({
  resetsAt,
  type,
  limit,
  noCredits = false,
}: LimitBannerProps) {
  const eventKey = type.replace(" ", "-") as GenerationEventType;
  const windowDays = GEN_QUOTA_WINDOWS_MS[eventKey] / (24 * 60 * 60 * 1000);
  const windowText = windowDays === 1 ? "24-hour" : `${windowDays}-day`;

  if (noCredits) {
    return (
      <div className="bg-destructive/5 border-destructive/20 flex flex-col items-center gap-4 rounded-xl border p-6 py-10 text-center">
        <div className="bg-destructive/10 flex size-14 items-center justify-center rounded-full">
          <CreditCard className="text-destructive size-7" />
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-foreground text-base font-semibold">
            Not enough credits
          </p>

          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
            Generating a{" "}
            <span className="text-foreground font-medium">{type}</span> costs
            more credits than your current balance. Purchase a pack to continue.
          </p>
        </div>

        <UpgradeButton label="Get more credits" />
      </div>
    );
  }

  return (
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
          per {windowText} window.
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
}

export default LimitBanner;
