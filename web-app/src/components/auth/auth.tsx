"use client";

import { useAuth } from "@better-auth-ui/react";
import type { AuthView } from "@better-auth-ui/react/core";
import { SignIn } from "./sign-in";
import { SignOut } from "./sign-out";
import { SignUp } from "./sign-up";

export type AuthProps = {
  className?: string;
  path?: string;
  /** @remarks `AuthView` */
  view?: AuthView;
};

export function Auth({ className, view, path }: AuthProps) {
  const { viewPaths } = useAuth();

  if (!view && !path) {
    throw new Error(
      "[Better Auth UI] Either `view` or `path` must be provided",
    );
  }

  const authPathViews = Object.fromEntries(
    Object.entries(viewPaths.auth).map(([k, v]) => [v, k]),
  ) as Record<string, AuthView>;

  const currentView = view ?? (path ? authPathViews[path] : undefined);

  switch (currentView) {
    case "signIn":
      return <SignIn className={className} />;
    case "signUp":
      return <SignUp className={className} />;
    case "signOut":
      return <SignOut className={className} />;
    default:
      throw new Error(
        `[Better Auth UI] Valid views are: ${Object.keys(viewPaths.auth).join(", ")}`,
      );
  }
}
