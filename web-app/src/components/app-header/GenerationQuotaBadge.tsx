"use client";

import { AlertCircle, CreditCard, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Badge } from "~/components/ui/badge";
import useGenerationQuota from "~/hooks/useGenerationQuota";
import { GENERATION_COSTS } from "~/lib/constants";
import { formatResetTime } from "~/lib/utils";
import { UpgradeButton } from "../UpgradeButton";

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
              className="text-sm font-semibold capitalize"
            >
              <CreditCard className="size-4" />
              No credits
            </Badge>
          ) : (
            <Badge
              variant="destructive"
              className="text-sm font-semibold capitalize"
            >
              <AlertCircle className="size-4" />
              Limit hit
            </Badge>
          )}
        </button>
      </TooltipTrigger>

      <TooltipContent
        side="bottom"
        align="end"
        className="flex max-w-65 flex-col gap-2 px-3 py-2"
      >
        {anyNoCredits ? (
          // ── No-credits state (takes priority) ──────────────────────────
          <>
            <p className="text-base font-semibold">Insufficient Credits</p>

            <ul className="flex flex-col gap-1 text-sm">
              {avatarNoCredits && (
                <li className="flex items-center gap-1">
                  <X className="text-destructive size-4" />

                  <span>
                    Avatar Video — needs {GENERATION_COSTS["avatar-video"]}{" "}
                    creds
                  </span>
                </li>
              )}

              {voiceNoCredits && (
                <li className="flex items-center gap-1">
                  <X className="text-destructive size-4" />
                  <span>
                    Voiceover — needs {GENERATION_COSTS.voiceover} creds
                  </span>
                </li>
              )}
            </ul>

            <UpgradeButton
              label="Get more credits"
              variant="link"
              className="w-full justify-center text-blue-600"
            />

            {/* Still show daily limits if they're also hit, as secondary info */}
            {anyExceeded && (
              <p className="border-t pt-2 text-xs">
                Note: daily quotas are also active. The soonest resets{" "}
                <span className="font-medium">
                  {formatResetTime(soonestReset)}
                </span>
                .
              </p>
            )}
          </>
        ) : (
          // ── Daily-limit state ────────────────────────────────────────────
          <>
            <p className="text-base font-semibold">Generation Limits Apply</p>

            <div className="text-sm">
              {(avatarEntry.isExceeded || voiceEntry.isExceeded) && (
                <ul className="flex flex-col gap-1">
                  {avatarEntry.isExceeded && avatarEntry.resetsAt && (
                    <li className="ml-3 list-disc">
                      Your avatar video quota opens{" "}
                      <strong>{formatResetTime(avatarEntry.resetsAt)}</strong>.
                    </li>
                  )}

                  {voiceEntry.isExceeded && voiceEntry.resetsAt && (
                    <li className="ml-3 list-disc">
                      Your voiceover quota opens{" "}
                      <strong>{formatResetTime(voiceEntry.resetsAt)}</strong>.
                    </li>
                  )}
                </ul>
              )}
            </div>
          </>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
