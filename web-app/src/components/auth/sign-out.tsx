"use client";

import { useAuth, useSignOut } from "@better-auth-ui/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Spinner } from "~/components/ui/spinner";
import { cn } from "~/lib/utils";
import Logo from "../Logo";

export type SignOutProps = {
  className?: string;
};

/**
 * Signs the current user out on mount and renders a centered spinner while the operation completes.
 *
 * @param className - Optional additional class names appended to the root element
 * @returns The spinner shown during sign-out
 */
export function SignOut({ className }: SignOutProps) {
  const { basePaths, navigate, viewPaths } = useAuth();

  const { mutate: signOut } = useSignOut({
    onError: (error) => {
      toast.error(error.error?.message || error.message);

      navigate({
        to: `${basePaths.auth}/${viewPaths.auth.signIn}`,
        replace: true,
      });
    },
    onSuccess: () =>
      navigate({
        to: `${basePaths.auth}/${viewPaths.auth.signIn}`,
        replace: true,
      }),
  });

  const hasSignedOut = useRef(false);

  useEffect(() => {
    if (hasSignedOut.current) return;

    hasSignedOut.current = true;

    signOut();
  }, [signOut]);

  return (
    <div
      className={cn(
        "flex min-h-[50vh] flex-col items-center justify-center gap-6",
        className,
      )}
    >
      <div className="relative flex flex-col items-center justify-center gap-6">
        {/* Background glow */}
        <div
          aria-hidden="true"
          className="bg-primary/10 absolute -z-10 size-32 rounded-full blur-2xl"
        />

        <div className="animate-pulse">
          <Logo size={48} showText={false} className="text-primary" />
        </div>

        <div className="text-muted-foreground flex items-center gap-3">
          <Spinner className="size-4" />

          <p className="text-sm font-medium tracking-wide">
            Signing out safely...
          </p>
        </div>
      </div>
    </div>
  );
}
