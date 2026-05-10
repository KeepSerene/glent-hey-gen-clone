"use client";

import { CheckCircle2, Loader2, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import type { GenerationJobType } from "~/hooks/useGenerationStatus";
import { GEN_STATUS_LABELS } from "~/lib/constants";

interface GenerationProgressProps {
  type: GenerationJobType;
  jobId: string | null;
  status: string;
  errorMessage?: string | null;
  onCancel?: () => Promise<void>;
}

/** Hint shown in the inline cancel confirmation based on the current status. */
function getCancelHint(status: string): string {
  if (status === "queued") {
    return "Job hasn't started yet — you'll get a full credit refund.";
  }

  return "The GPU is already running — no credits will be refunded.";
}

export default function GenerationProgress({
  type,
  jobId,
  status,
  errorMessage,
  onCancel,
}: GenerationProgressProps) {
  const [assetUrl, setAssetUrl] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Fetch a fresh presigned URL from the assets endpoint once the job completes
  useEffect(() => {
    if (status !== "completed" || !jobId) return;

    fetch(`/api/assets/${type}/${jobId}`)
      .then((response) => {
        if (!response.ok) throw new Error("Asset fetch failed");

        return response.json() as Promise<{ url: string }>;
      })
      .then((data) => setAssetUrl(data.url))
      .catch(() =>
        toast.error("Could not load your result. Try refreshing the page."),
      );
  }, [status, jobId, type]);

  // Reset cancel confirmation if status changes (e.g. job progresses past queued)
  useEffect(() => {
    setConfirmCancel(false);
  }, [status]);

  const isComplete = status === "completed";
  const isFailed = status === "failed";
  const isActive = !isComplete && !isFailed;

  const handleCancelConfirm = async () => {
    if (!onCancel || isCanceling) return;

    setIsCanceling(true);
    try {
      await onCancel();
      // Parent calls handleReset() which unmounts this component
    } catch {
      toast.error("Failed to cancel. Please try again.");
      setIsCanceling(false);
      setConfirmCancel(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      {/* Status icon */}
      {isActive && <Loader2 className="text-primary size-14 animate-spin" />}
      {isComplete && <CheckCircle2 className="size-14 text-emerald-500" />}
      {isFailed && <XCircle className="text-destructive size-14" />}

      {/* Status label */}
      <p className="text-center text-base font-medium">
        {GEN_STATUS_LABELS[status] ?? "Processing..."}
      </p>

      {/* Active hint */}
      {isActive && !confirmCancel && (
        <p className="text-muted-foreground max-w-xs text-center text-sm">
          You can close this modal. Re-open to check back.
        </p>
      )}

      {/* Error detail */}
      {isFailed && errorMessage && (
        <p className="text-destructive max-w-sm text-center text-sm">
          {errorMessage}
        </p>
      )}

      {/* Result preview */}
      {isComplete && assetUrl && (
        <p className="text-muted-foreground">Check your recent creations.</p>
      )}

      {/* Loading indicator while URL is being fetched */}
      {isComplete && !assetUrl && (
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      )}

      {/* Inline cancel confirmation */}
      {isActive && onCancel && confirmCancel && (
        <div className="bg-muted/60 border-border flex w-full max-w-xs flex-col items-center gap-3 rounded-xl border p-4 text-center">
          <p className="text-foreground text-sm font-medium">
            Cancel this generation?
          </p>

          <p className="text-muted-foreground text-xs">
            {getCancelHint(status)}
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleCancelConfirm}
              disabled={isCanceling}
            >
              {isCanceling && <Loader2 className="size-3 animate-spin" />}
              Yes, cancel
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmCancel(false)}
              disabled={isCanceling}
            >
              Keep waiting
            </Button>
          </div>
        </div>
      )}

      {/* Cancel affordance */}
      {isActive && onCancel && !confirmCancel && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setConfirmCancel(true)}
        >
          <X className="size-4" />
          Cancel generation
        </Button>
      )}
    </div>
  );
}
