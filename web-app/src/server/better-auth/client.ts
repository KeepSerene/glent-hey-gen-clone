import { multiSession } from "better-auth/plugins/multi-session";
import { polarClient } from "@polar-sh/better-auth/client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [multiSession(), polarClient()],
});

export type Session = typeof authClient.$Infer.Session;
