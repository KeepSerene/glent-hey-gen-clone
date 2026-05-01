"use client";

import {
  useAuth,
  useRevokeMultiSession,
  useSession,
  useSetActiveSession,
} from "@better-auth-ui/react";
import type { Session, User } from "better-auth";
import { ArrowLeftRight, LogOut, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Spinner } from "~/components/ui/spinner";
import { UserView } from "~/components/settings/user-view";

export type DeviceSession = {
  session: Session;
  user: User;
};

export type ManageAccountProps = {
  deviceSession?: DeviceSession | null;
  isPending?: boolean;
};

/**
 * Render a single account row with user info and switch/revoke controls.
 *
 * Shows the user's avatar and info. For the active session, shows a sign-out button.
 * For non-active sessions, shows a dropdown menu with switch and sign-out options.
 *
 * @param deviceSession - The device session object containing session and user data
 * @param isPending - Whether the device session is pending
 * @returns A JSX element containing the account row
 */
export function ManageAccount({
  deviceSession,
  isPending,
}: ManageAccountProps) {
  const { localization, basePaths, viewPaths, navigate } = useAuth();
  const { data: session } = useSession();
  const router = useRouter();

  const { mutate: setActiveSession, isPending: isSwitching } =
    useSetActiveSession({
      onSuccess: () => {
        toast.success("Account switched successfully");
        router.refresh(); // Re-fetch the new session state for server components
      },
    });

  const { mutate: revokeSession, isPending: isRevoking } =
    useRevokeMultiSession({
      onSuccess: () =>
        toast.success(localization.settings.revokeSessionSuccess),
    });

  const isActive = deviceSession?.session.userId === session?.session.userId;
  const isBusy = isSwitching || isRevoking;

  return (
    <Card className="border-0 bg-transparent shadow-none ring-0">
      <CardContent className="flex items-center justify-between gap-3">
        <UserView user={deviceSession?.user} isPending={isPending} />

        {/* ACTIVE SESSION */}
        {deviceSession && isActive && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              navigate({
                to: `${basePaths.auth}/${viewPaths.auth.signOut}`,
              })
            }
            disabled={isBusy}
            className="shrink-0"
          >
            {isRevoking ? <Spinner /> : <LogOut />}
            {localization.auth.signOut}
          </Button>
        )}

        {/* INACTIVE SESSIONS */}
        {deviceSession && !isActive && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
                disabled={isBusy}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="min-w-fit">
              <DropdownMenuItem
                onClick={() =>
                  setActiveSession({
                    sessionToken: deviceSession.session.token,
                  })
                }
              >
                <ArrowLeftRight className="text-muted-foreground mr-2 size-4" />
                {localization.auth.switchAccount}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  revokeSession({
                    sessionToken: deviceSession.session.token,
                  })
                }
              >
                <LogOut className="text-muted-foreground mr-2 size-4" />
                {localization.auth.signOut}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardContent>
    </Card>
  );
}
