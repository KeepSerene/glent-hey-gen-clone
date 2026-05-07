"use client";

import {
  CheckCircle2,
  DownloadCloud,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import type { GenerationJobType } from "~/hooks/useGenerationStatus";

interface GenerationProgressProps {
  type: GenerationJobType;
  jobId: string | null;
  status: string;
  errorMessage?: string | null;
  onReset: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  queued: "Warming up the GPU...",
  tts_generating: "Synthesizing voice from your script...",
  video_generating: "Animating your avatar — hang tight...",
  generating: "Synthesizing your voiceover...",
  completed: "Your creation is ready!",
  failed: "Something went wrong.",
};

export default function GenerationProgress({
  type,
  jobId,
  status,
  errorMessage,
  onReset,
}: GenerationProgressProps) {
  const [assetUrl, setAssetUrl] = useState<string | null>(null);

  // Fetch a fresh presigned URL from the assets endpoint once the job completes.
  // This runs whenever the component mounts with a completed status too, making
  // it safe to reuse on a history page without any URL-expiry concerns.
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

  const isComplete = status === "completed";
  const isFailed = status === "failed";
  const isActive = !isComplete && !isFailed;

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      {/* Status icon */}
      {isActive && <Loader2 className="text-primary size-14 animate-spin" />}
      {isComplete && <CheckCircle2 className="size-14 text-emerald-500" />}
      {isFailed && <XCircle className="text-destructive size-14" />}

      {/* Status label */}
      <p className="text-center text-base font-medium">
        {STATUS_LABELS[status] ?? "Processing..."}
      </p>

      {/* Active hint */}
      {isActive && (
        <p className="text-muted-foreground max-w-xs text-center text-sm">
          You can close this modal — the job keeps running in the background.
          Re-open to check back.
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
        <div className="w-full max-w-sm">
          {type === "voiceover" ? (
            <audio src={assetUrl} controls className="w-full" />
          ) : (
            <video
              src={assetUrl}
              controls
              playsInline
              className="w-full rounded-xl"
            />
          )}
        </div>
      )}

      {/* Loading indicator while URL is being fetched */}
      {isComplete && !assetUrl && (
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      )}

      {/* Actions */}
      {(isComplete || isFailed) && (
        <div className="flex gap-3">
          {isComplete && jobId && (
            <Button variant="outline" asChild>
              <a href={`/api/assets/${type}/${jobId}?download=1`}>
                <DownloadCloud className="mr-2 size-4" />
                Download
              </a>
            </Button>
          )}

          <Button type="button" variant="secondary" onClick={onReset}>
            <RefreshCw className="size-4" />
            Create another
          </Button>
        </div>
      )}
    </div>
  );
}
