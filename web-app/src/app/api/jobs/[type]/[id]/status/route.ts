import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, id } = await params;

  if (type === "avatar-video") {
    const job = await db.avatarVideo.findFirst({
      where: { id, userId: session.user.id },
      select: { status: true, errorMessage: true, videoR2Key: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: job.status,
      errorMessage: job.errorMessage ?? null,
      hasResult: job.status === "completed" && !!job.videoR2Key,
    });
  }

  if (type === "voiceover") {
    const job = await db.voiceover.findFirst({
      where: { id, userId: session.user.id },
      select: { status: true, errorMessage: true, audioR2Key: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: job.status,
      errorMessage: job.errorMessage ?? null,
      hasResult: job.status === "completed" && !!job.audioR2Key,
    });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
