"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CheckCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export default function CheckoutSuccessModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const isSuccess = searchParams.get("status") === "success";
  const checkoutId = searchParams.get("checkout_id");

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isSuccess && checkoutId) {
      setIsOpen(true);
    }
  }, [isSuccess, checkoutId]);

  const handleClose = () => {
    setIsOpen(false);
    // Remove the ?status=success&checkout_id=... from the URL cleanly
    router.replace(pathname);
    // Invalidate the React Query cache to instantly update the sidebar
    void queryClient.invalidateQueries({ queryKey: ["generation-quota"] });
    // Refresh server components (if any!)
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-col items-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
            <CheckCheck className="size-6 text-emerald-600 dark:text-emerald-500" />
          </div>

          <DialogTitle className="text-xl font-semibold">
            Payment Successful!
          </DialogTitle>

          <DialogDescription className="mt-2 text-base">
            You&apos;re all set to create more magic with Glent.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 sm:justify-end">
          <Button
            type="button"
            onClick={handleClose}
            size="lg"
            className="w-full"
          >
            Let's go
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
