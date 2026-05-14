import { useQueryClient } from "@tanstack/react-query";
import type { BetterFetchError } from "better-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";

export function ErrorToaster() {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.getQueryCache().config.onError = (error) => {
      const err = error as BetterFetchError;
      const errError = err?.error as { message?: string } | undefined;

      if (errError?.message) toast.error(errError.message);
    };

    queryClient.setMutationDefaults([], {
      onError: (error) => {
        const errError = (error as BetterFetchError)?.error as
          | { message?: string }
          | undefined;
        toast.error(errError?.message ?? error.message);
      },
    });
  }, [queryClient]);

  return null;
}
