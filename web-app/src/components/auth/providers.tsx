"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { authClient } from "~/server/better-auth/client";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  return (
    <AuthProvider
      authClient={authClient}
      appearance={{ theme, setTheme }}
      multiSession
      redirectTo="/dashboard"
      navigate={({ to, replace }) =>
        replace ? router.replace(to) : router.push(to)
      }
      Link={Link}
    >
      {children}
    </AuthProvider>
  );
}
