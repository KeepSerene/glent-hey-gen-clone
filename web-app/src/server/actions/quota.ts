"use server";

import { db } from "~/server/db";
import { getSession } from "../better-auth/server";
import {
  DAILY_LIMITS,
  GEN_QUOTA_WINDOWS_MS,
  type GenerationEventType,
} from "~/lib/constants";

export interface QuotaEntry {
  used: number;
  limit: number;
  /** Earliest time the quota will tick down (oldest event in window + 24h/7d). */
  resetsAt: string | null; // ISO string
  isExceeded: boolean;
}

export interface QuotaStatus {
  "avatar-video": QuotaEntry;
  voiceover: QuotaEntry;
  credits: number;
}

function buildEntry(
  type: GenerationEventType,
  eventsInWindow: Date[],
): QuotaEntry {
  const limit = DAILY_LIMITS[type];
  const used = eventsInWindow.length;
  const windowMs = GEN_QUOTA_WINDOWS_MS[type];

  const oldest = eventsInWindow
    .slice()
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const resetsAt =
    used > 0 && oldest
      ? new Date(oldest.getTime() + windowMs).toISOString()
      : null;

  return { used, limit, resetsAt, isExceeded: used >= limit };
}

/**
 * Returns the current generation quotas AND credit balance for the
 * signed-in user. Safe to call from any client component via React Query.
 */
export async function getQuotaStatus(): Promise<QuotaStatus> {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const avatarWindowMs = GEN_QUOTA_WINDOWS_MS["avatar-video"];
  const voiceoverWindowMs = GEN_QUOTA_WINDOWS_MS.voiceover;
  const avatarWindowStart = new Date(Date.now() - avatarWindowMs);
  const voiceoverWindowStart = new Date(Date.now() - voiceoverWindowMs);

  // Fetch all events from the oldest possible window
  const oldestWindowStart = new Date(
    Math.min(avatarWindowStart.getTime(), voiceoverWindowStart.getTime()),
  );

  const [recentEvents, user] = await Promise.all([
    db.generationEvent.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: oldestWindowStart },
      },
      select: { type: true, createdAt: true },
    }),

    db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    }),
  ]);

  const avatarEvents = recentEvents
    .filter(
      (e) => e.type === "avatar-video" && e.createdAt >= avatarWindowStart,
    )
    .map((e) => e.createdAt);

  const voiceoverEvents = recentEvents
    .filter(
      (e) => e.type === "voiceover" && e.createdAt >= voiceoverWindowStart,
    )
    .map((e) => e.createdAt);

  return {
    "avatar-video": buildEntry("avatar-video", avatarEvents),
    voiceover: buildEntry("voiceover", voiceoverEvents),
    credits: user?.credits ?? 0,
  };
}
