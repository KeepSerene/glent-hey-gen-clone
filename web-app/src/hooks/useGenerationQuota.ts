import { useQuery } from "@tanstack/react-query";
import { getQuotaStatus, type QuotaStatus } from "~/server/actions/quota";

/**
 * Polls the user's 24-hour generation quota every 30 seconds.
 * Returns stale data while revalidating so the UI never flickers.
 */
export default function useGenerationQuota() {
  return useQuery<QuotaStatus>({
    queryKey: ["generation-quota"],
    queryFn: () => getQuotaStatus(),
    // Refetch every 30s so the badge updates when the window rolls over
    refetchInterval: 30_000,
    // Keep showing old data while the new fetch is in-flight
    staleTime: 15_000,
    // Don't throw on network errors — just keep the last good value
    retry: 1,
  });
}
