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
    img.onerror = (error) => reject(error);
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
