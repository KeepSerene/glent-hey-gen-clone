"use client";

import { useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "~/server/better-auth/client";
import {
  POLAR_BRILLIANCE_PACK_ID,
  POLAR_FLARE_PACK_ID,
  POLAR_SPARK_PACK_ID,
} from "~/lib/constants";
import { cn } from "~/lib/utils";

interface UpgradeButtonProps {
  variant?: "highlight" | "link";
  label?: string;
  className?: string;
}

export default function UpgradeButton({
  variant = "highlight",
  label = "Upgrade",
  className,
}: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      await authClient.checkout({
        products: [
          POLAR_SPARK_PACK_ID,
          POLAR_FLARE_PACK_ID,
          POLAR_BRILLIANCE_PACK_ID,
        ],
      });
    } catch (error) {
      console.error("Failed to open checkout:", error);
      toast.error("Couldn't open checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleUpgrade}
      className={cn(
        variant === "highlight" && "btn-highlight gap-1",
        variant === "link" &&
          "text-primary focus-visible:ring-ring inline-flex items-center justify-center gap-1 text-sm font-medium underline-offset-4 transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin" />
          Redirecting...
        </>
      ) : (
        <>
          <Zap className="size-4 shrink-0 fill-current" />
          {label}
        </>
      )}
    </button>
  );
}
