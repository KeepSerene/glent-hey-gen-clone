import type { Metadata } from "next";
import HistoryClient from "~/components/history/HistoryClient";
import {
  getAvatarVideoHistory,
  getVoiceoverHistory,
} from "~/server/actions/history";

export const metadata: Metadata = {
  title: "History",
};

async function HistoryPage() {
  const [avatarVideosResult, voiceoversResult] = await Promise.allSettled([
    getAvatarVideoHistory(),
    getVoiceoverHistory(),
  ]);

  const avatarVideos =
    avatarVideosResult.status === "fulfilled" ? avatarVideosResult.value : [];
  const voiceovers =
    voiceoversResult.status === "fulfilled" ? voiceoversResult.value : [];

  return <HistoryClient avatarVideos={avatarVideos} voiceovers={voiceovers} />;
}

export default HistoryPage;
