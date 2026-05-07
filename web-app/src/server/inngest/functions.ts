import { inngest } from "./client";
import { env } from "~/env";
import { db } from "~/server/db";

interface AvatarVideoEventData {
  jobId: string;
  userId: string;
  avatarR2Key: string;
  // Script mode
  script?: string;
  voiceR2Key?: string;
  language: string;
  exaggeration: number;
  cfgWeight: number;
  temperature: number;
  seed: number;
  // Audio mode (mutually exclusive with script mode!)
  audioR2Key?: string;
}

interface VoiceoverEventData {
  jobId: string;
  userId: string;
  script: string;
  voiceR2Key?: string;
  language: string;
  exaggeration: number;
  cfgWeight: number;
  temperature: number;
  seed: number;
}

interface TtsModalResponse {
  speech_r2_key: string;
}

interface VideoModalResponse {
  video_r2_key: string;
}

export const generateAvatarVideo = inngest.createFunction(
  {
    id: "generate-avatar-video",
    triggers: { event: "avatar-video/generate" },
    concurrency: { limit: 1, key: "event.data.userId" },
    retries: 1,
    onFailure: async ({ event, step }) => {
      const { jobId } = event.data.event.data as AvatarVideoEventData;
      const error = event.data.error as { message?: string } | string;
      const errorMessage =
        typeof error === "string"
          ? error
          : (error?.message ?? "Generation failed after retries.");

      await step.run("mark-failed", async () => {
        // Guard: user may have deleted the record while job was in-flight
        const job = await db.avatarVideo.findUnique({
          where: { id: jobId },
          select: { id: true },
        });

        if (!job) return;

        await db.avatarVideo.update({
          where: { id: jobId },
          data: { status: "failed", errorMessage: errorMessage.slice(0, 500) },
        });
      });
    },
  },
  async ({ event, step }) => {
    const {
      jobId,
      avatarR2Key,
      script,
      voiceR2Key,
      audioR2Key,
      language,
      exaggeration,
      cfgWeight,
      temperature,
      seed,
    } = event.data as AvatarVideoEventData;

    const isScriptMode = !!script && !audioR2Key;
    let drivingAudioR2Key = audioR2Key;

    // ── Stage 1: TTS (script mode only) ──────────────────────────────────────
    if (isScriptMode) {
      await step.run("mark-tts-generating", async () => {
        await db.avatarVideo.update({
          where: { id: jobId },
          data: { status: "tts_generating" },
        });
      });

      const ttsResponse = await step.fetch(env.MODAL_MTL_TTS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Modal-Key": env.MODAL_API_KEY,
          "Modal-Secret": env.MODAL_API_SECRET,
        },
        body: JSON.stringify({
          text: script,
          language,
          voice_sample_r2_key: voiceR2Key ?? null,
          exaggeration,
          cfg_weight: cfgWeight,
          temperature,
          seed,
        }),
      });

      const ttsResult = await step.run("parse-tts-response", async () => {
        if (!ttsResponse.ok) {
          const errorText = await ttsResponse.text();
          throw new Error(
            `TTS API error ${ttsResponse.status}: ${errorText.slice(0, 300)}`,
          );
        }

        return (await ttsResponse.json()) as TtsModalResponse;
      });

      drivingAudioR2Key = ttsResult.speech_r2_key;

      // Persist the TTS result so the client can see it and for crash recovery
      await step.run("save-tts-audio-key", async () => {
        await db.avatarVideo.update({
          where: { id: jobId },
          data: { audioR2Key: drivingAudioR2Key },
        });
      });
    }

    // ── Stage 2: Video generation (Hallo3) ───────────────────────────────────
    await step.run("mark-video-generating", async () => {
      await db.avatarVideo.update({
        where: { id: jobId },
        data: { status: "video_generating" },
      });
    });

    const videoResponse = await step.fetch(env.MODAL_VIDEO_GEN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Modal-Key": env.MODAL_API_KEY,
        "Modal-Secret": env.MODAL_API_SECRET,
      },
      body: JSON.stringify({
        photo_r2_key: avatarR2Key,
        audio_r2_key: drivingAudioR2Key,
        transcript: script ?? "",
      }),
    });

    const videoResult = await step.run("parse-video-response", async () => {
      if (!videoResponse.ok) {
        const errorText = await videoResponse.text();
        throw new Error(
          `Video API error ${videoResponse.status}: ${errorText.slice(0, 300)}`,
        );
      }

      return (await videoResponse.json()) as VideoModalResponse;
    });

    // ── Stage 3: Finalise ─────────────────────────────────────────────────────
    await step.run("finalise", async () => {
      await db.avatarVideo.update({
        where: { id: jobId },
        data: { videoR2Key: videoResult.video_r2_key, status: "completed" },
      });
    });

    return { jobId, status: "completed" };
  },
);

export const generateVoiceover = inngest.createFunction(
  {
    id: "generate-voiceover",
    triggers: { event: "voiceover/generate" },
    concurrency: { limit: 2, key: "event.data.userId" },
    retries: 2,
    onFailure: async ({ event, step }) => {
      const { jobId } = event.data.event.data as VoiceoverEventData;
      const error = event.data.error as { message?: string } | string;
      const errorMessage =
        typeof error === "string"
          ? error
          : (error?.message ?? "Generation failed after retries.");

      await step.run("mark-failed", async () => {
        const job = await db.voiceover.findUnique({
          where: { id: jobId },
          select: { id: true },
        });

        if (!job) return;

        await db.voiceover.update({
          where: { id: jobId },
          data: { status: "failed", errorMessage: errorMessage.slice(0, 500) },
        });
      });
    },
  },
  async ({ event, step }) => {
    const {
      jobId,
      script,
      voiceR2Key,
      language,
      exaggeration,
      cfgWeight,
      temperature,
      seed,
    } = event.data as VoiceoverEventData;

    await step.run("mark-generating", async () => {
      await db.voiceover.update({
        where: { id: jobId },
        data: { status: "generating" },
      });
    });

    const ttsResponse = await step.fetch(env.MODAL_MTL_TTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Modal-Key": env.MODAL_API_KEY,
        "Modal-Secret": env.MODAL_API_SECRET,
      },
      body: JSON.stringify({
        text: script,
        language,
        voice_sample_r2_key: voiceR2Key ?? null,
        exaggeration,
        cfg_weight: cfgWeight,
        temperature,
        seed,
      }),
    });

    const ttsResult = await step.run("parse-tts-response", async () => {
      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        throw new Error(
          `TTS API error ${ttsResponse.status}: ${errorText.slice(0, 300)}`,
        );
      }

      return (await ttsResponse.json()) as TtsModalResponse;
    });

    await step.run("finalise", async () => {
      await db.voiceover.update({
        where: { id: jobId },
        data: { audioR2Key: ttsResult.speech_r2_key, status: "completed" },
      });
    });

    return { jobId, status: "completed" };
  },
);
