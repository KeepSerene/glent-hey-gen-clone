import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Area } from "react-easy-crop";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);

    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    });

    audio.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read audio metadata."));
    });
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

/**
 * Crops an image to the specified pixel area and returns a JPEG File.
 */
export async function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: Area,
  fileName = "cropped-avatar.jpg",
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(new File([blob], fileName, { type: "image/jpeg" }));
        } else {
          reject(new Error("Canvas toBlob returned null"));
        }
      },
      "image/jpeg",
      0.92,
    );
  });
}

/**
 * Encodes a mono Float32 PCM array into a standard 16-bit WAV ArrayBuffer.
 */
function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const dataLength = samples.length * 2; // 16-bit = 2 bytes per sample
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF chunk descriptor
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  // fmt sub-chunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM audio format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate (sr * channels * bitsPerSample/8)
  view.setUint16(32, 2, true); // block align (channels * bitsPerSample/8)
  view.setUint16(34, 16, true); // bits per sample
  // data sub-chunk
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  // Convert Float32 [-1, 1] -> Int16 and write samples
  let offset = 44;

  for (const sample of samples) {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(
      offset,
      clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff,
      true,
    );
    offset += 2;
  }

  return buffer;
}

/**
 * Decodes any browser-recorded audio Blob (webm, ogg, mp4 — whatever the
 * browser's MediaRecorder produced) and re-encodes it as a 16-bit mono WAV
 * Blob. Required because both ChatterboxTTS and Hallo3 only accept WAV.
 */
export async function convertBlobToWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new AudioContext();

  let audioBuffer: AudioBuffer;

  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } finally {
    await audioCtx.close();
  }

  // Mix all channels down to mono by averaging them
  const numChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  const mono = new Float32Array(length);

  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = audioBuffer.getChannelData(ch);

    for (let i = 0; i < length; i++) {
      mono[i] = (mono[i] ?? 0) + (channelData[i] ?? 0) / numChannels;
    }
  }

  return new Blob([encodeWav(mono, sampleRate)], { type: "audio/wav" });
}

/**
 * Generates a human-readable title for a generation job.
 *
 * If a script is provided, we use the first ~50 characters of it.
 * Otherwise we fall back to a type + date label.
 */
export function generateTitle(
  script: string | null | undefined,
  type: "avatar-video" | "voiceover",
): string {
  if (script?.trim()) {
    const clean = script.trim().replace(/\s+/g, " ");
    return clean.length > 52 ? clean.slice(0, 49) + "..." : clean;
  }

  const dateStr = new Date().toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });

  return type === "avatar-video"
    ? `Avatar Video · ${dateStr}`
    : `Voiceover · ${dateStr}`;
}

export function formatResetTime(resetsAt: string | null): string {
  if (!resetsAt) return "in 24 hours";

  const resetDate = new Date(resetsAt);
  const now = new Date();

  const isToday =
    resetDate.getDate() === now.getDate() &&
    resetDate.getMonth() === now.getMonth() &&
    resetDate.getFullYear() === now.getFullYear();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    resetDate.getDate() === tomorrow.getDate() &&
    resetDate.getMonth() === tomorrow.getMonth() &&
    resetDate.getFullYear() === tomorrow.getFullYear();

  const timeStr = resetDate.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `today at ${timeStr}`;
  if (isTomorrow) return `tomorrow at ${timeStr}`;

  return `on ${resetDate.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })} at ${timeStr}`;
}

/**
 * Derives a deterministic bar pattern from an item's id so
 * every UI card looks unique without storing any extra data.
 */
export function getWaveformBars(id: string, count = 20): number[] {
  let hash = 0;

  for (const char of id) {
    hash = Math.imul(hash, 31) + char.charCodeAt(0);
    hash |= 0;
  }

  return Array.from({ length: count }, (_, i) => {
    const x = Math.abs(Math.imul(hash, i * 1664525 + 1013904223));

    return 18 + (x % 64); // 18–82 percent height
  });
}

export function getRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);

  if (hrs < 24) return `${hrs}h ago`;

  const days = Math.floor(hrs / 24);

  if (days < 7) return `${days}d ago`;

  return new Date(isoString).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}
