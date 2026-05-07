import { getUploadUrl } from "~/server/actions/upload";

/**
 * Calls the server action to get a presigned PUT URL, then uploads
 * the file directly to Cloudflare R2 from the browser.
 * Returns the R2 key to pass to the generate action.
 */
export async function uploadFileToR2(
  file: File,
  folder: string,
): Promise<string> {
  const { url, key } = await getUploadUrl(folder, file.type);

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
 * Convenience wrapper for Blob uploads (e.g. MediaRecorder output).
 * The filename is used only to derive the R2 key extension.
 */
export async function uploadBlobToR2(
  blob: Blob,
  filename: string,
  folder: string,
): Promise<string> {
  const file = new File([blob], filename, { type: blob.type });

  return uploadFileToR2(file, folder);
}
