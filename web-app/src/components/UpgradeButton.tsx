"use client";

import { useEffect, useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "~/server/better-auth/client";
import {
  POLAR_BRILLIANCE_PACK_ID,
  POLAR_FLARE_PACK_ID,
  POLAR_SPARK_PACK_ID,
} from "~/lib/constants";
import { Button } from "./ui/button";

interface UpgradeButtonProps {
  label?: string;
  variant?:
    | "default"
    | "secondary"
    | "ghost"
    | "link"
    | "outline"
    | "destructive";
  className?: string;
}

/**
 * M3-styled upgrade CTA with a one-time shimmer sweep on mount.
 * Opens Polar's hosted checkout page with all three credit packs.
 */
export function UpgradeButton({
  label = "Upgrade",
  variant = "outline",
  className,
}: UpgradeButtonProps) {
  const [sweepActive, setSweepActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Small delay so the layout settles before the sweep fires
    const startSweepAnimId = setTimeout(() => setSweepActive(true), 400);
    // Clear class after animation completes (400ms delay + 1500ms anim)
    const endSweepAnimId = setTimeout(() => setSweepActive(false), 2050);

    return () => {
      clearTimeout(startSweepAnimId);
      clearTimeout(endSweepAnimId);
    };
  }, []);

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
    <Button
      type="button"
      variant={variant}
      size="sm"
      disabled={isLoading}
      onClick={() => void handleUpgrade()}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin" />
          Redirecting...
        </>
      ) : (
        <>
          <Zap className="size-4 shrink-0" />
          {label}
        </>
      )}
    </Button>
  );
}
