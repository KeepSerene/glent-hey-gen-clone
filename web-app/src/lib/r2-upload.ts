import { getUploadUrl } from "~/server/actions/upload";
import type { GenerationEventType } from "~/lib/constants";

/**
 * Uploads a File directly to Cloudflare R2 using a pre-signed URL.
 * Fetches the required URL from the server and performs a PUT request.
 *
 * @param file - The File object to upload.
 * @param folder - The target subfolder inside the R2 bucket.
 * @param eventType - Optional. The generation type to check against the user's daily quota before uploading.
 * @returns A promise that resolves to the generated R2 key for the file.
 * @throws An error if the network request or the R2 upload fails.
 */
export async function uploadFileToR2(
  file: File,
  folder: string,
  eventType?: GenerationEventType,
): Promise<string> {
  const { url, key } = await getUploadUrl(folder, file.type, eventType);
  const res = await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!res.ok) {
    throw new Error(`R2 upload failed: ${res.status} ${res.statusText}`);
  }

  return key;
}

/**
 * Convenience wrapper for uploading Blob data (e.g., from MediaRecorder) to R2.
 * Converts the Blob into a File object and delegates to uploadFileToR2.
 *
 * @param blob - The raw Blob data to upload.
 * @param filename - The filename to assign to the created File object.
 * @param folder - The target subfolder inside the R2 bucket.
 * @param eventType - Optional. The generation type to check against the user's daily quota before uploading.
 * @returns A promise that resolves to the generated R2 key for the file.
 */
export async function uploadBlobToR2(
  blob: Blob,
  filename: string,
  folder: string,
  eventType?: GenerationEventType,
): Promise<string> {
  const file = new File([blob], filename, { type: blob.type });

  return uploadFileToR2(file, folder, eventType);
}
