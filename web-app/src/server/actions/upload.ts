"use server";

import { getPresignedUploadUrl } from "~/server/r2";
import { getSession } from "../better-auth/server";
import { randomUUID } from "node:crypto";
import { EXT_MAP } from "~/lib/constants";

/**
 * Server action: validates auth, generates a presigned PUT URL for R2,
 * and returns the URL + the key the client should reference later.
 *
 * @param folder  Subfolder inside the private bucket, e.g. "avatars" | "voices" | "audios"
 * @param mimeType  The content type of the file being uploaded
 */
export async function getUploadUrl(
  folder: string,
  mimeType: string,
): Promise<{ url: string; key: string }> {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const ext = EXT_MAP[mimeType] ?? "bin";
  const key = `uploads/${folder}/${session.user.id}/${randomUUID()}.${ext}`;
  const url = await getPresignedUploadUrl(key, mimeType);

  return { url, key };
}
