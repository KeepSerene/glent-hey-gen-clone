"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AudioWaveform,
  Download,
  FolderArchive,
  Loader2,
  Video,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import type {
  ClientAvatarVideo,
  ClientVoiceover,
} from "~/server/actions/history";
import { cn } from "~/lib/utils";
import GenerationCard from "./GenerationCard";

type TabValue = "all" | "avatar-video" | "voiceover";

interface PlayingItem {
  id: string;
  type: "avatar-video" | "voiceover";
  title: string | null;
}

interface HistoryClientProps {
  avatarVideos: ClientAvatarVideo[];
  voiceovers: ClientVoiceover[];
}

// Merge both lists into a single sorted array for the "All" tab
function mergeAndSort(
  avatarVideos: ClientAvatarVideo[],
  voiceovers: ClientVoiceover[],
) {
  const videos = avatarVideos.map((v) => ({
    ...v,
    type: "avatar-video" as const,
  }));
  const audio = voiceovers.map((v) => ({ ...v, type: "voiceover" as const }));

  return [...videos, ...audio].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function TabCount({ count, active }: { count: number; active: boolean }) {
  if (count === 0) return null;

  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground",
      )}
    >
      {count}
    </span>
  );
}

export default function HistoryClient({
  avatarVideos,
  voiceovers,
}: HistoryClientProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [playingItem, setPlayingItem] = useState<PlayingItem | null>(null);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);

  const allItems = mergeAndSort(avatarVideos, voiceovers);
  const totalCount = avatarVideos.length + voiceovers.length;

  const handlePlay = async (
    id: string,
    type: "avatar-video" | "voiceover",
    title: string | null,
  ) => {
    setPlayingItem({ id, type, title });
    setPlayerUrl(null);
    setIsLoadingPlayer(true);

    try {
      const res = await fetch(`/api/assets/${type}/${id}`);
      if (!res.ok) throw new Error("Asset fetch failed");
      const data = (await res.json()) as { url: string };
      setPlayerUrl(data.url);
    } catch {
      toast.error("Could not load the player. Try again.");
      setPlayingItem(null);
    } finally {
      setIsLoadingPlayer(false);
    }
  };

  const closePlayer = () => {
    setPlayingItem(null);
    setPlayerUrl(null);
  };

  const renderEmpty = (type: TabValue) => {
    const config = {
      all: {
        icon: <FolderArchive className="text-muted-foreground/40 size-10" />,
        heading: "Nothing generated yet",
        body: "Create your first avatar video or voiceover from the dashboard.",
      },
      "avatar-video": {
        icon: <Video className="text-muted-foreground/40 size-10" />,
        heading: "No avatar videos yet",
        body: "Head to the dashboard and animate your first portrait photo.",
      },
      voiceover: {
        icon: <AudioWaveform className="text-muted-foreground/40 size-10" />,
        heading: "No voiceovers yet",
        body: "Open the AI Voice Studio from the dashboard to generate speech.",
      },
    }[type];

    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        {config.icon}

        <div>
          <p className="font-heading text-base font-semibold">
            {config.heading}
          </p>

          <p className="text-muted-foreground mt-1 text-sm">{config.body}</p>
        </div>

        <Button variant="link" asChild>
          <a href="/dashboard">Go to dashboard</a>
        </Button>
      </div>
    );
  };

  const renderGrid = (items: typeof allItems) => {
    if (items.length === 0) return renderEmpty(activeTab);

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <GenerationCard
            key={`${item.type}-${item.id}`}
            item={item}
            onPlay={handlePlay}
          />
        ))}
      </div>
    );
  };

  const tabContent = {
    all: renderGrid(allItems),
    "avatar-video": renderGrid(
      avatarVideos.map((v) => ({ ...v, type: "avatar-video" as const })),
    ),
    voiceover: renderGrid(
      voiceovers.map((v) => ({ ...v, type: "voiceover" as const })),
    ),
  }[activeTab];

  return (
    <main className="flex flex-col gap-8 p-6 sm:p-8">
      <section className="flex flex-col gap-1">
        <h1 className="font-heading text-foreground text-2xl font-bold tracking-tight">
          Generation history
        </h1>

        <p className="text-muted-foreground text-sm">
          {totalCount === 0
            ? "Your creations will appear here."
            : `${totalCount} creation${totalCount !== 1 ? "s" : ""} across all types.`}
        </p>
      </section>

      {/* ── Tabs + grid ──────────────────────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <TabsList className="mb-6 h-10">
          <TabsTrigger type="button" value="all" className="gap-2 px-4 text-sm">
            All
            <TabCount count={totalCount} active={activeTab === "all"} />
          </TabsTrigger>

          <TabsTrigger
            type="button"
            value="avatar-video"
            className="gap-2 px-4 text-sm"
          >
            Avatar Videos
            <TabCount
              count={avatarVideos.length}
              active={activeTab === "avatar-video"}
            />
          </TabsTrigger>

          <TabsTrigger
            type="button"
            value="voiceover"
            className="gap-2 px-4 text-sm"
          >
            Voiceovers
            <TabCount
              count={voiceovers.length}
              active={activeTab === "voiceover"}
            />
          </TabsTrigger>
        </TabsList>

        {tabContent}
      </Tabs>

      {/* ── Player dialog ────────────────────────────────────────────────── */}
      <Dialog
        open={!!playingItem}
        onOpenChange={(open) => !open && closePlayer()}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="truncate pr-6 text-base font-semibold">
              {playingItem?.title ?? "Playing..."}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Player area */}
            <div
              className={cn(
                "bg-muted flex min-h-30 items-center justify-center rounded-xl",
                playingItem?.type === "avatar-video" && "aspect-video min-h-0",
              )}
            >
              {isLoadingPlayer && (
                <Loader2 className="text-muted-foreground size-8 animate-spin" />
              )}

              {!isLoadingPlayer &&
                playerUrl &&
                playingItem?.type === "avatar-video" && (
                  <video
                    src={playerUrl}
                    controls
                    autoPlay
                    playsInline
                    className="h-full w-full rounded-xl object-contain"
                  />
                )}

              {!isLoadingPlayer &&
                playerUrl &&
                playingItem?.type === "voiceover" && (
                  <div className="w-full px-4">
                    <audio
                      src={playerUrl}
                      controls
                      autoPlay
                      className="w-full"
                    />
                  </div>
                )}
            </div>

            {/* Actions */}
            {playerUrl && playingItem && (
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`/api/assets/${playingItem.type}/${playingItem.id}?download=1`}
                  >
                    <Download className="mr-1.5 size-3.5" />
                    Download
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
