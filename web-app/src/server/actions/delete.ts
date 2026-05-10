"use server";

import { db } from "~/server/db";
import { getSession } from "../better-auth/server";
import { GENERATION_COSTS, type GenerationEventType } from "~/lib/constants";
import { deleteR2Object } from "~/server/r2";

/**
 * Smart refund rules:
 *   "queued"          -> full refund (job hasn't touched the GPU yet)
 *   "tts_generating"  -> no refund (GPU is actively running)
 *   "video_generating"-> no refund (GPU is actively running)
 *   "generating"      -> no refund (GPU is actively running)
 *   "failed"          -> no refund (GPU already ran — credits already spent)
 *   "completed"       -> no refund (user received their content)
 */
function calcRefund(status: string, type: GenerationEventType): number {
  if (status === "queued") return GENERATION_COSTS[type];

  return 0;
}

/**
 * Keys that live under "samples/" are shared library files — never delete them.
 */
function isSafeToDelete(key: string): boolean {
  return !key.startsWith("samples/");
}

export interface DeleteGenerationResult {
  refunded: number;
}

/**
 * Cancels or deletes a generation job owned by the current user.
 */
export async function deleteGeneration(
  id: string,
  type: GenerationEventType,
): Promise<DeleteGenerationResult> {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id;
  let refunded = 0;
  const keysToCleanUp: string[] = [];

  await db.$transaction(async (tx) => {
    if (type === "avatar-video") {
      const job = await tx.avatarVideo.findFirst({
        where: { id, userId },
        select: {
          status: true,
          videoR2Key: true,
          audioR2Key: true,
        },
      });

      if (!job) throw new Error("Generation not found");

      refunded = calcRefund(job.status, type);

      // Collect output keys for cleanup:
      //   videoR2Key  → always a generated render ("renders/...")
      //   audioR2Key  → may be TTS output ("voiceovers/...") or user upload
      //                 ("uploads/audios/..."). Either belongs to this job.
      if (job.videoR2Key && isSafeToDelete(job.videoR2Key)) {
        keysToCleanUp.push(job.videoR2Key);
      }

      if (job.audioR2Key && isSafeToDelete(job.audioR2Key)) {
        keysToCleanUp.push(job.audioR2Key);
      }

      if (refunded > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { credits: { increment: refunded } },
        });
      }

      await tx.avatarVideo.delete({ where: { id } });
    } else if (type === "voiceover") {
      const job = await tx.voiceover.findFirst({
        where: { id, userId },
        select: {
          status: true,
          audioR2Key: true,
        },
      });

      if (!job) throw new Error("Generation not found");

      refunded = calcRefund(job.status, type);

      if (job.audioR2Key && isSafeToDelete(job.audioR2Key)) {
        keysToCleanUp.push(job.audioR2Key);
      }

      if (refunded > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { credits: { increment: refunded } },
        });
      }

      await tx.voiceover.delete({ where: { id } });
    } else {
      throw new Error("Invalid generation type");
    }
  });

  // Fire-and-forget: R2 cleanup runs after the transaction commits.
  // Failures here are non-critical — the DB record is already gone.
  void Promise.allSettled(keysToCleanUp.map((key) => deleteR2Object(key)));

  return { refunded };
}
