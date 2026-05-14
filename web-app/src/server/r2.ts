import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~/env";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Returns a presigned PUT URL so the browser can upload a file directly to the
 * private R2 bucket without routing through Next.js. Expires in 5 minutes.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.R2_PRIVATE_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2, command, { expiresIn: 300 });
}

/**
 * Returns a presigned GET URL so the browser can stream private content
 * (videos, audio) without exposing the bucket publicly. Expires in 30 minutes.
 */
export async function getPresignedViewUrl(
  key: string,
  expiresIn = 1800,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.R2_PRIVATE_BUCKET,
    Key: key,
  });

  return getSignedUrl(r2, command, { expiresIn });
}

/**
 * Returns a presigned GET URL configured to force the browser to download the file
 * as an attachment rather than viewing it inline. Expires in 1 minute by default.
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 60,
): Promise<string> {
  const raw = key.split("/").pop() ?? "download";
  const extDotIndex = raw.lastIndexOf(".");
  const filename =
    extDotIndex !== -1
      ? `${raw.slice(0, extDotIndex)}_Glent${raw.slice(extDotIndex)}`
      : `${raw}_Glent`;

  const command = new GetObjectCommand({
    Bucket: env.R2_PRIVATE_BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  });

  return getSignedUrl(r2, command, { expiresIn });
}

/**
 * Permanently deletes an object from the private R2 bucket.
 * Used for post-deletion cleanup of generated output files.
 */
export async function deleteR2Object(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: env.R2_PRIVATE_BUCKET,
      Key: key,
    }),
  );
}
