"use server";

import { db } from "~/server/db";
import { getSession } from "~/server/better-auth/server";
import { getPresignedViewUrl } from "~/server/r2";

export interface ClientAvatarVideo {
  id: string;
  title: string | null;
  status: string;
  errorMessage: string | null;
  /** Presigned GET URL for the avatar thumbnail. Valid ~1 hour. */
  avatarUrl: string | null;
  /** R2 key of the finished video — used to request a fresh play URL on demand. */
  videoR2Key: string | null;
  script: string | null;
  language: string;
  createdAt: string;
}

export interface ClientVoiceover {
  id: string;
  title: string | null;
  status: string;
  errorMessage: string | null;
  /** R2 key of the finished audio — used to request a fresh play URL on demand. */
  audioR2Key: string | null;
  script: string;
  language: string;
  createdAt: string;
}

export interface RecentItem {
  id: string;
  type: "avatar-video" | "voiceover";
  title: string | null;
  status: string;
  createdAt: string;
  /** Presigned avatar thumbnail URL (only for avatar-video items). */
  avatarUrl: string | null;
}

export async function getAvatarVideoHistory(): Promise<ClientAvatarVideo[]> {
  const session = await getSession();

  if (!session?.user) throw new Error("Unauthorized");

  const rows = await db.avatarVideo.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      status: true,
      errorMessage: true,
      avatarR2Key: true,
      videoR2Key: true,
      script: true,
      language: true,
      createdAt: true,
    },
  });

  // Fetch presigned thumbnail URLs in parallel — expires in 1 hour!
  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      errorMessage: row.errorMessage,
      avatarUrl: row.avatarR2Key
        ? await getPresignedViewUrl(row.avatarR2Key, 3600)
        : null,
      videoR2Key: row.videoR2Key,
      script: row.script,
      language: row.language,
      createdAt: row.createdAt.toISOString(),
    })),
  );
}

export async function getVoiceoverHistory(): Promise<ClientVoiceover[]> {
  const session = await getSession();

  if (!session?.user) throw new Error("Unauthorized");

  const rows = await db.voiceover.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      status: true,
      errorMessage: true,
      audioR2Key: true,
      script: true,
      language: true,
      createdAt: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    errorMessage: row.errorMessage,
    audioR2Key: row.audioR2Key,
    script: row.script,
    language: row.language,
    createdAt: row.createdAt.toISOString(),
  }));
}

/**
 * Returns the most recent N generations across both types, sorted newest-first.
 */
export async function getRecentGenerations(limit = 4): Promise<RecentItem[]> {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  // Fetch more than `limit` from each table so the merge has room to sort
  const [videos, voiceovers] = await Promise.all([
    db.avatarVideo.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        status: true,
        avatarR2Key: true,
        createdAt: true,
      },
    }),
    db.voiceover.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  // Presign avatar thumbnails in parallel
  const videoItems = await Promise.all(
    videos.map(async (v) => ({
      id: v.id,
      type: "avatar-video" as const,
      title: v.title,
      status: v.status,
      createdAt: v.createdAt.toISOString(),
      avatarUrl: v.avatarR2Key
        ? await getPresignedViewUrl(v.avatarR2Key, 3600)
        : null,
    })),
  );

  const voiceItems: RecentItem[] = voiceovers.map((v) => ({
    id: v.id,
    type: "voiceover" as const,
    title: v.title,
    status: v.status,
    createdAt: v.createdAt.toISOString(),
    avatarUrl: null,
  }));

  return [...videoItems, ...voiceItems]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
}
