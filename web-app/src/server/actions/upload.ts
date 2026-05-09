"use server";

import { getPresignedUploadUrl } from "~/server/r2";
import { getSession } from "../better-auth/server";
import { randomUUID } from "node:crypto";
import {
  EXT_MAP,
  GENERATION_COSTS,
  type GenerationEventType,
} from "~/lib/constants";
import { getQuotaStatus } from "./quota";

/**
 * Generates a presigned PUT URL for Cloudflare R2 uploads.
 * Validates user authentication and performs an optional pre-flight quota check
 * to prevent unnecessary uploads if the daily generation limit is reached.
 *
 * @param folder - The target subfolder inside the R2 bucket (e.g., "avatars", "voices").
 * @param mimeType - The content type of the file being uploaded.
 * @param eventType - Optional. The generation type to check against the user's daily quota.
 * @returns An object containing the presigned `url` and the generated R2 `key`.
 * @throws Error if the user is unauthorized or if the daily limit is exceeded.
 */
export async function getUploadUrl(
  folder: string,
  mimeType: string,
  eventType?: GenerationEventType,
): Promise<{ url: string; key: string }> {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (eventType) {
    const quota = await getQuotaStatus();

    if (quota[eventType].isExceeded) {
      throw new Error(
        `DAILY_LIMIT_EXCEEDED:${eventType}:Resets at ${quota[eventType].resetsAt}`,
      );
    }

    const cost = GENERATION_COSTS[eventType];

    if (quota.credits < cost) {
      throw new Error(
        `INSUFFICIENT_CREDITS:${eventType}:You need ${cost} credits to generate this content.`,
      );
    }
  }

  const ext = EXT_MAP[mimeType] ?? "bin";
  const key = `uploads/${folder}/${session.user.id}/${randomUUID()}.${ext}`;
  const url = await getPresignedUploadUrl(key, mimeType);

  return { url, key };
}
