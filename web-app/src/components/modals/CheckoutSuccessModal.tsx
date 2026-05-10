"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CheckCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
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
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="flex flex-col items-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
            <CheckCheck className="size-6 text-emerald-600 dark:text-emerald-500" />
          </div>

          <AlertDialogTitle className="text-xl font-semibold">
            Payment successful!
          </AlertDialogTitle>

          <AlertDialogDescription className="mt-2 text-center">
            You&apos;re all set to create more magic with Glent.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 sm:justify-center">
          <AlertDialogAction onClick={handleClose} className="w-full">
            Let's go
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
