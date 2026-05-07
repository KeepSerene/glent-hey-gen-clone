import { useQuery } from "@tanstack/react-query";

export type GenerationJobType = "avatar-video" | "voiceover";

export interface GenerationStatusResponse {
  status: string;
  errorMessage: string | null;
  hasResult: boolean;
}

const TERMINAL_STATUSES = new Set(["completed", "failed"]);

// Poll interval per job type (ms)
const POLL_INTERVALS: Record<GenerationJobType, number> = {
  "avatar-video": 15_000,
  voiceover: 5_000,
};

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

export default function useGenerationStatus(
  type: GenerationJobType,
  jobId: string | null,
) {
  return useQuery({
    queryKey: ["generation-status", type, jobId],
    queryFn: () => fetchStatus(type, jobId!),
    enabled: !!jobId,
    // Stop polling once we hit a terminal state
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      if (!status || TERMINAL_STATUSES.has(status)) return false;

      return POLL_INTERVALS[type];
    },
    // Show stale data while refetching to avoid flicker
    staleTime: 0,
  });
}
