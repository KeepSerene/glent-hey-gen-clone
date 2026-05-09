"use client";

import { AlertCircle, CreditCard, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Badge } from "~/components/ui/badge";
import useGenerationQuota from "~/hooks/useGenerationQuota";
import { DAILY_LIMITS, GENERATION_COSTS } from "~/lib/constants";
import type { QuotaEntry } from "~/server/actions/quota";
import { formatResetTime } from "~/lib/utils";
import { UpgradeButton } from "../UpgradeButton";

const QuotaLine = ({ label, entry }: { label: string; entry: QuotaEntry }) => (
  <li className="flex items-start gap-2">
    <span
      className={
        entry.isExceeded
          ? "text-destructive font-semibold"
          : "text-muted-foreground"
      }
    >
      {entry.isExceeded ? "✗" : "✓"}
    </span>

    <span>
      <span className="font-medium">{label}</span>
      {" — "}
      {entry.used}/{entry.limit} used
      {entry.isExceeded && entry.resetsAt && (
        <span className="text-muted-foreground block text-[11px]">
          Resets {formatResetTime(entry.resetsAt)}
        </span>
      )}
    </span>
  </li>
);

export default function GenerationQuotaBadge() {
  const { data: quota } = useGenerationQuota();

  if (!quota) return null;

  const avatarEntry = quota["avatar-video"];
  const voiceEntry = quota.voiceover;
  const credits = quota.credits;

  // No-credits: user can't afford the respective action
  const avatarNoCredits = credits < GENERATION_COSTS["avatar-video"];
  const voiceNoCredits = credits < GENERATION_COSTS.voiceover;
  const anyNoCredits = avatarNoCredits || voiceNoCredits;

  const anyExceeded = avatarEntry.isExceeded || voiceEntry.isExceeded;

  // Only render badge when there's something to surface
  if (!anyNoCredits && !anyExceeded) return null;

  // Soonest quota reset across exceeded types
  const exceedTimes = [
    avatarEntry.isExceeded ? avatarEntry.resetsAt : null,
    voiceEntry.isExceeded ? voiceEntry.resetsAt : null,
  ]
    .filter(Boolean)
    .map((t) => new Date(t!).getTime());

  const soonestReset =
    exceedTimes.length > 0
      ? new Date(Math.min(...exceedTimes)).toISOString()
      : null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={
            anyNoCredits
              ? "Insufficient credits — see details"
              : "Daily generation limit reached — see details"
          }
          className="focus-visible:ring-ring flex cursor-default items-center rounded focus-visible:ring-2 focus-visible:outline-none"
        >
          {anyNoCredits ? (
            <Badge
              variant="destructive"
              className="gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
            >
              <CreditCard className="size-2.5" />
              No Credits
            </Badge>
          ) : (
            <Badge
              variant="destructive"
              className="gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
            >
              <AlertCircle className="size-2.5" />
              Limit Hit
            </Badge>
          )}
        </button>
      </TooltipTrigger>

      <TooltipContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="max-w-65 p-3 text-xs"
      >
        {anyNoCredits ? (
          // ── No-credits state (takes priority) ──────────────────────────
          <>
            <p className="mb-2 leading-snug font-semibold">
              Insufficient credits
            </p>

            <p className="text-muted-foreground mb-3 leading-relaxed">
              Your current balance ({credits} cr) isn't enough to start a new
              generation.
            </p>

            <ul className="mb-3 flex flex-col gap-1.5">
              {avatarNoCredits && (
                <li className="flex items-center gap-1.5">
                  <X className="text-destructive size-4" />

                  <span>
                    Avatar Video — needs {GENERATION_COSTS["avatar-video"]} cr
                  </span>
                </li>
              )}

              {voiceNoCredits && (
                <li className="flex items-center gap-1.5">
                  <span className="text-destructive">✗</span>
                  <span>Voiceover — needs {GENERATION_COSTS.voiceover} cr</span>
                </li>
              )}
            </ul>

            <UpgradeButton
              size="sm"
              label="Get more credits"
              className="w-full justify-center"
            />

            {/* Still show daily limits if they're also hit, as secondary info */}
            {anyExceeded && (
              <p className="text-muted-foreground mt-2.5 border-t pt-2 text-[11px] leading-snug">
                Note: daily quotas are also active. They reset{" "}
                <span className="text-foreground font-medium">
                  {formatResetTime(soonestReset)}
                </span>
                .
              </p>
            )}
          </>
        ) : (
          // ── Daily-limit state ────────────────────────────────────────────
          <>
            <p className="mb-2 leading-snug font-semibold">
              Daily generation limits apply
            </p>

            <ul className="flex flex-col gap-1.5">
              <QuotaLine
                label={`Avatar Video (${DAILY_LIMITS["avatar-video"]}/day)`}
                entry={avatarEntry}
              />
              <QuotaLine
                label={`Voiceover (${DAILY_LIMITS["voiceover"]}/day)`}
                entry={voiceEntry}
              />
            </ul>

            {soonestReset && (
              <p className="text-muted-foreground mt-2.5 border-t pt-2 text-[11px] leading-snug">
                Free-tier portfolio project. Limits reset on a rolling 24-hour
                window. Next slot opens{" "}
                <span className="text-foreground font-medium">
                  {formatResetTime(soonestReset)}
                </span>
                .
              </p>
            )}
          </>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
