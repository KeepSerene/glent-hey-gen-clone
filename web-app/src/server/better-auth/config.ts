import nodemailer from "nodemailer";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { env } from "~/env";
import { PASSWORD_REGEX } from "~/lib/constants";
import { getVerificationEmailHtml } from "~/lib/email-templates";
import { db } from "~/server/db";
import { multiSession } from "better-auth/plugins/multi-session";

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  session: {
    cookieCache: {
      enabled: env.NODE_ENV === "production",
      maxAge: 60 * 60, // 60 mins in prod
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 32,
    requireEmailVerification: true,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const password = (ctx.body as Record<string, unknown>)?.password as
          | string
          | undefined;

        if (password && !PASSWORD_REGEX.test(password)) {
          throw new APIError("BAD_REQUEST", {
            message:
              "Password must be 8-32 characters and include at least one uppercase letter, one lowercase letter, one digit, and one special character.",
          });
        }
      }
    }),
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const htmlContent = getVerificationEmailHtml({
        name: user.name ?? "there",
        url: url,
        appUrl: env.NEXT_PUBLIC_APP_URL,
      });

      void mailer.sendMail({
        from: `"Glent" <${env.GMAIL_USER}>`,
        to: user.email,
        subject: "Verify your Glent email",
        html: htmlContent,
      });
    },
  },
  plugins: [multiSession()],
});

export type Session = typeof auth.$Infer.Session;
