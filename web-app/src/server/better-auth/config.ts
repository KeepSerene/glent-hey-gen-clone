import nodemailer from "nodemailer";
import { Polar } from "@polar-sh/sdk";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { env } from "~/env";
import {
  PASSWORD_REGEX,
  POLAR_BRILLIANCE_PACK_ID,
  POLAR_FLARE_PACK_ID,
  POLAR_SPARK_PACK_ID,
} from "~/lib/constants";
import { getVerificationEmailHtml } from "~/lib/email-templates";
import { db } from "~/server/db";
import { multiSession } from "better-auth/plugins/multi-session";
import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth";

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD,
  },
});

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
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
  plugins: [
    multiSession(),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            // Spark pack: $5 — 500 credits
            { productId: POLAR_SPARK_PACK_ID, slug: "spark" },
            // Flare pack: $12 — 1500 credits
            { productId: POLAR_FLARE_PACK_ID, slug: "flare" },
            // Brilliance pack: $25 — 3500 credits
            { productId: POLAR_BRILLIANCE_PACK_ID, slug: "brilliance" },
          ],
          successUrl: "/dashboard?status=success&checkout_id={CHECKOUT_ID}",
          authenticatedUsersOnly: true,
          returnUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
        }),
        portal({ returnUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard` }),
        webhooks({
          secret: env.POLAR_WEBHOOK_SECRET,
          onOrderPaid: async (payload) => {
            const order = payload.data;
            const userId = order.customer.externalId as string | undefined;
            const creditsToAdd = Number(
              order.product?.metadata.credits_to_add ?? 0,
            );

            if (userId && creditsToAdd > 0) {
              await db.user.update({
                where: { id: userId },
                data: { credits: { increment: creditsToAdd } },
              });
            }
          },
        }),
      ],
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
