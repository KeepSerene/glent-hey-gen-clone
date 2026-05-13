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
      emailAndPassword={{
        enabled: true,
        minPasswordLength: 8,
        maxPasswordLength: 32,
        forgotPassword: false,
        requireEmailVerification: true,
      }}
      localization={{
        auth: {
          signIn: "Sign in",
          signUp: "Sign up",
          email: "Email address",
          emailPlaceholder: "you@example.com",
          password: "Password",
          passwordPlaceholder: "Enter your password",
          name: "Full Name",
          namePlaceholder: "Jane Doe",
          alreadyHaveAnAccount: "Been here before?",
          needToCreateAnAccount: "New to the studio?",
          verifyYourEmail:
            "Account created! Check your inbox to verify your email.",
          verificationEmailSent:
            "A new verification link has been sent to your inbox.",
          resend: "Resend Link",
          showPassword: "Show password",
          hidePassword: "Hide password",
        },
      }}
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
