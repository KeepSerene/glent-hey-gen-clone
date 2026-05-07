"use server";

import { db } from "~/server/db";
import { getSession } from "../better-auth/server";
import {
  DAILY_LIMITS,
  QUOTA_WINDOW_MS,
  type GenerationEventType,
} from "~/lib/constants";

export interface QuotaEntry {
  used: number;
  limit: number;
  /** Earliest time the quota will tick down (oldest event in window + 24h). */
  resetsAt: string | null; // ISO string
  isExceeded: boolean;
}

export interface QuotaStatus {
  "avatar-video": QuotaEntry;
  voiceover: QuotaEntry;
}

function buildEntry(
  type: GenerationEventType,
  eventsInWindow: Date[],
): QuotaEntry {
  const limit = DAILY_LIMITS[type];
  const used = eventsInWindow.length;

  // The quota starts freeing up when the oldest event in the window expires
  // Sort ascending (oldest first) to find that event
  const oldest = eventsInWindow
    .slice()
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const resetsAt =
    used > 0 && oldest
      ? new Date(oldest.getTime() + QUOTA_WINDOW_MS).toISOString()
      : null;

  return { used, limit, resetsAt, isExceeded: used >= limit };
}

/**
 * Returns the current 24-hour generation quota for the signed-in user.
 * Safe to call from any client component via React Query.
 */
export async function getQuotaStatus(): Promise<QuotaStatus> {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const windowStart = new Date(Date.now() - QUOTA_WINDOW_MS);
  const recentEvents = await db.generationEvent.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: windowStart },
    },
    select: { type: true, createdAt: true },
  });

  const avatarEvents = recentEvents
    .filter((e) => e.type === "avatar-video")
    .map((e) => e.createdAt);

  const voiceoverEvents = recentEvents
    .filter((e) => e.type === "voiceover")
    .map((e) => e.createdAt);

  return {
    "avatar-video": buildEntry("avatar-video", avatarEvents),
    voiceover: buildEntry("voiceover", voiceoverEvents),
  };
}
