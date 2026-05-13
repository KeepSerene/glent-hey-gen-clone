import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  DEFAULT_POLL_INTERVAL,
  TERMINAL_STATUSES,
  TTS_POLL_INTERVAL,
  VIDEO_GEN_POLL_INTERVAL,
} from "~/lib/constants";

export type GenerationJobType = "avatar-video" | "voiceover";

export interface GenerationStatusResponse {
  status: string;
  errorMessage: string | null;
  hasResult: boolean;
}

async function fetchStatus(
  type: GenerationJobType,
  jobId: string,
): Promise<GenerationStatusResponse> {
  const res = await fetch(`/api/jobs/${type}/${jobId}/status`);

  if (!res.ok) {
    throw new Error(`Status fetch failed: ${res.status}`);
  }

  return res.json() as Promise<GenerationStatusResponse>;
}

interface UseGenerationStatusOptions {
  /** Called exactly once when the job transitions to "completed". */
  onCompleted?: () => void;
}

export default function useGenerationStatus(
  type: GenerationJobType,
  jobId: string | null,
  { onCompleted }: UseGenerationStatusOptions = {},
) {
  // Keep a ref so the effect below never needs onCompleted in its dep array,
  // preventing re-subscriptions on every render.
  const onCompletedRef = useRef(onCompleted);

  useEffect(() => {
    onCompletedRef.current = onCompleted;
  }, [onCompleted]);

  const query = useQuery({
    queryKey: ["generation-status", type, jobId],
    queryFn: () => fetchStatus(type, jobId!),
    enabled: !!jobId,
    refetchInterval: (q) => {
      const status = q.state.data?.status;

      if (!status || TERMINAL_STATUSES.has(status)) return false;

      if (status === "tts_generating") {
        return TTS_POLL_INTERVAL;
      }

      if (type === "avatar-video" && status === "video_generating") {
        return VIDEO_GEN_POLL_INTERVAL;
      }

      return DEFAULT_POLL_INTERVAL;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // Fire onCompleted exactly once, from the modal level, regardless of whether
  // GenerationProgress is mounted (i.e. regardless of dialog open state)
  const prevStatusRef = useRef<string | null>(null);

  useEffect(() => {
    const status = query.data?.status;

    if (status === "completed" && prevStatusRef.current !== "completed") {
      onCompletedRef.current?.();
    }

    prevStatusRef.current = status ?? null;
  }, [query.data?.status]);

  return query;
}
