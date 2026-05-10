"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AudioWaveform, FolderArchive, Video } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import type {
  ClientAvatarVideo,
  ClientVoiceover,
} from "~/server/actions/history";
import { cn } from "~/lib/utils";
import GenerationCard from "./GenerationCard";
import { deleteGeneration } from "~/server/actions/delete";
import DeleteConfirmationModal, {
  type DeletingItem,
} from "../modals/DeleteConfirmationModal";
import MediaPlayerModal, { type PlayingItem } from "../modals/MediaPlayerModal";

type TabValue = "all" | "avatar-video" | "voiceover";

interface HistoryClientProps {
  avatarVideos: ClientAvatarVideo[];
  voiceovers: ClientVoiceover[];
}

// Merge both lists into a single sorted array for the "All" tab
function mergeAndSort(
  avatarVideos: (ClientAvatarVideo & { type: "avatar-video" })[],
  voiceovers: (ClientVoiceover & { type: "voiceover" })[],
) {
  return [...avatarVideos, ...voiceovers].sort(
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
  avatarVideos: initialAvatarVideos,
  voiceovers: initialVoiceovers,
}: HistoryClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabValue>("all");

  const [localAvatarVideos, setLocalAvatarVideos] = useState(() =>
    initialAvatarVideos.map((v) => ({ ...v, type: "avatar-video" as const })),
  );
  const [localVoiceovers, setLocalVoiceovers] = useState(() =>
    initialVoiceovers.map((v) => ({ ...v, type: "voiceover" as const })),
  );

  const [playingItem, setPlayingItem] = useState<PlayingItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<DeletingItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const allItems = mergeAndSort(localAvatarVideos, localVoiceovers);
  const totalCount = localAvatarVideos.length + localVoiceovers.length;

  const handlePlay = (
    id: string,
    type: "avatar-video" | "voiceover",
    title: string | null,
  ) => {
    setPlayingItem({ id, type, title });
  };

  const handleDeleteRequest = (
    id: string,
    type: "avatar-video" | "voiceover",
    title: string | null,
    status: string,
  ) => {
    setDeletingItem({ id, type, title, status });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem || isDeleting) return;

    const { id, type, status } = deletingItem;
    setIsDeleting(true);

    // Optimistic UI update
    if (type === "avatar-video") {
      setLocalAvatarVideos((prev) => prev.filter((v) => v.id !== id));
    } else {
      setLocalVoiceovers((prev) => prev.filter((v) => v.id !== id));
    }

    setDeletingItem(null);
    setIsDeleting(false);

    try {
      const { refunded } = await deleteGeneration(id, type);

      const isActive =
        status === "queued" ||
        status === "tts_generating" ||
        status === "video_generating" ||
        status === "generating";

      if (refunded > 0) {
        toast.success(`Canceled — ${refunded} credits refunded.`);
      } else if (isActive) {
        toast.info("Generation canceled.");
      } else {
        toast.success("Deleted successfully.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete. Refreshing...");
      router.refresh();
    }
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

  const renderGrid = (items: typeof allItems, emptyTab: TabValue) => {
    if (items.length === 0) return renderEmpty(emptyTab);

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <GenerationCard
            key={`${item.type}-${item.id}`}
            item={item}
            onPlay={handlePlay}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>
    );
  };

  const tabContent = {
    all: renderGrid(allItems, "all"),
    "avatar-video": renderGrid(localAvatarVideos, "avatar-video"),
    voiceover: renderGrid(localVoiceovers, "voiceover"),
  }[activeTab];

  return (
    <main className="flex flex-col gap-8 overflow-y-auto p-6 sm:p-8">
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
              count={localAvatarVideos.length}
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
              count={localVoiceovers.length}
              active={activeTab === "voiceover"}
            />
          </TabsTrigger>
        </TabsList>

        {tabContent}
      </Tabs>

      <MediaPlayerModal
        item={playingItem}
        onClose={() => setPlayingItem(null)}
      />

      <DeleteConfirmationModal
        item={deletingItem}
        isDeleting={isDeleting}
        onOpenChange={(open: boolean) =>
          !open && !isDeleting && setDeletingItem(null)
        }
        onConfirm={handleDeleteConfirm}
      />
    </main>
  );
}
