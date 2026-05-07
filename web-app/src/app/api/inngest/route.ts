import { serve } from "inngest/next";
import { inngest } from "~/server/inngest/client";
import {
  generateAvatarVideo,
  generateVoiceover,
} from "~/server/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateAvatarVideo, generateVoiceover],
});
