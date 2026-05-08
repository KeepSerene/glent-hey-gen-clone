"use server";

import { db } from "~/server/db";
import { inngest } from "~/server/inngest/client";
import { getSession } from "../better-auth/server";
import {
  DAILY_LIMITS,
  GEN_QUOTA_WINDOW_MS,
  type GenerationEventType,
} from "~/lib/constants";
import { generateTitle } from "~/lib/utils";

/**
 * Atomically checks the 24-hour quota and records a new GenerationEvent in a
 * single DB transaction. Throws a descriptive error if the limit is exceeded.
 */
async function checkAndRecordEvent(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  userId: string,
  type: GenerationEventType,
): Promise<void> {
  const windowStart = new Date(Date.now() - GEN_QUOTA_WINDOW_MS);
  const limit = DAILY_LIMITS[type];

  const count = await tx.generationEvent.count({
    where: {
      userId,
      type,
      createdAt: { gte: windowStart },
    },
  });

  if (count >= limit) {
    const oldest = await tx.generationEvent.findFirst({
      where: { userId, type, createdAt: { gte: windowStart } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });

    const resetsAt = oldest
      ? new Date(oldest.createdAt.getTime() + GEN_QUOTA_WINDOW_MS)
      : null;

    const resetsAtStr = resetsAt
      ? resetsAt.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "24 hours from your first generation";

    throw new Error(`DAILY_LIMIT_EXCEEDED:${type}:Resets at ${resetsAtStr}`);
  }

  await tx.generationEvent.create({
    data: { userId, type },
  });
}

export interface CreateAvatarVideoJobInput {
  avatarR2Key: string;
  // Script mode
  script?: string;
  voiceR2Key?: string;
  language?: string;
  exaggeration?: number;
  cfgWeight?: number;
  temperature?: number;
  seed?: number;
  // Audio mode (mutually exclusive with script mode!)
  audioR2Key?: string;
}

export async function createAvatarVideoJob(
  input: CreateAvatarVideoJobInput,
): Promise<{ jobId: string }> {
  const session = await getSession();

  if (!session?.user) throw new Error("Unauthorized");

  const title = generateTitle(input.script, "avatar-video");

  const job = await db.$transaction(async (tx) => {
    await checkAndRecordEvent(tx, session.user.id, "avatar-video");

    return tx.avatarVideo.create({
      data: {
        userId: session.user.id,
        title,
        avatarR2Key: input.avatarR2Key,
        audioR2Key: input.audioR2Key,
        script: input.script,
        voiceR2Key: input.voiceR2Key,
        language: input.language ?? "en",
        exaggeration: input.exaggeration ?? 0.5,
        cfgWeight: input.cfgWeight ?? 0.5,
        temperature: input.temperature ?? 0.8,
        seed: input.seed ?? 0,
        status: "queued",
      },
    });
  });

  await inngest.send({
    name: "avatar-video/generate",
    data: {
      jobId: job.id,
      userId: session.user.id,
      avatarR2Key: input.avatarR2Key,
      audioR2Key: input.audioR2Key,
      script: input.script,
      voiceR2Key: input.voiceR2Key,
      language: input.language ?? "en",
      exaggeration: input.exaggeration ?? 0.5,
      cfgWeight: input.cfgWeight ?? 0.5,
      temperature: input.temperature ?? 0.8,
      seed: input.seed ?? 0,
    },
  });

  return { jobId: job.id };
}

export interface CreateVoiceoverJobInput {
  script: string;
  voiceR2Key?: string;
  language?: string;
  exaggeration?: number;
  cfgWeight?: number;
  temperature?: number;
  seed?: number;
}

export async function createVoiceoverJob(
  input: CreateVoiceoverJobInput,
): Promise<{ jobId: string }> {
  const session = await getSession();

  if (!session?.user) throw new Error("Unauthorized");

  const title = generateTitle(input.script, "voiceover");

  const job = await db.$transaction(async (tx) => {
    await checkAndRecordEvent(tx, session.user.id, "voiceover");

    return tx.voiceover.create({
      data: {
        userId: session.user.id,
        title,
        script: input.script,
        voiceR2Key: input.voiceR2Key,
        language: input.language ?? "en",
        exaggeration: input.exaggeration ?? 0.5,
        cfgWeight: input.cfgWeight ?? 0.5,
        temperature: input.temperature ?? 0.8,
        seed: input.seed ?? 0,
        status: "queued",
      },
    });
  });

  await inngest.send({
    name: "voiceover/generate",
    data: {
      jobId: job.id,
      userId: session.user.id,
      script: input.script,
      voiceR2Key: input.voiceR2Key,
      language: input.language ?? "en",
      exaggeration: input.exaggeration ?? 0.5,
      cfgWeight: input.cfgWeight ?? 0.5,
      temperature: input.temperature ?? 0.8,
      seed: input.seed ?? 0,
    },
  });

  return { jobId: job.id };
}
