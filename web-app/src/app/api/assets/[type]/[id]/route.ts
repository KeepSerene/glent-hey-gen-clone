import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";
import { getPresignedDownloadUrl, getPresignedViewUrl } from "~/server/r2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, id } = await params;
  const isDownload = request.nextUrl.searchParams.get("download") === "1";

  let r2Key: string | null = null;

  if (type === "avatar-video") {
    const job = await db.avatarVideo.findFirst({
      where: { id, userId: session.user.id, status: "completed" },
      select: { videoR2Key: true },
    });
    r2Key = job?.videoR2Key ?? null;
  } else if (type === "voiceover") {
    const job = await db.voiceover.findFirst({
      where: { id, userId: session.user.id, status: "completed" },
      select: { audioR2Key: true },
    });
    r2Key = job?.audioR2Key ?? null;
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (!r2Key) {
    return NextResponse.json(
      { error: "Asset not found or not ready" },
      { status: 404 },
    );
  }

  if (isDownload) {
    const url = await getPresignedDownloadUrl(r2Key);

    return NextResponse.redirect(url, { status: 302 });
  }

  const url = await getPresignedViewUrl(r2Key, 3600);

  return NextResponse.json({ url });
}
