"use client";

import { useState } from "react";
import { DASHBOARD_ACTIONS } from "~/lib/constants";
import { cn } from "~/lib/utils";
import AvatarVideoModal from "./modals/AvatarVideoModal";

type ActionMode = "avatar-video" | "video-translation" | "video-dubbing";

function DashboardClient() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [translateModalOpen, setTranslateModalOpen] = useState(false);
  const [dubbingModalOpen, setDubbingModalOpen] = useState(false);

  const handleModalOpen = (mode: ActionMode) => {
    switch (mode) {
      case "avatar-video":
        setVideoModalOpen(true);
        break;
      case "video-translation":
        setTranslateModalOpen(true);
        break;
      case "video-dubbing":
        setDubbingModalOpen(true);
        break;
      default:
        return;
    }
  };

  return (
    <main className="p-8">
      <h2 className="mb-6 text-lg font-semibold">Create something new</h2>

      <ul className="mb-2 flex flex-wrap gap-4">
        {DASHBOARD_ACTIONS.map(
          ({ mode, label, icon: Icon, iconWrapperClassName, description }) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => handleModalOpen(mode as ActionMode)}
                className="group bg-muted hover:bg-muted/80 relative flex w-full min-w-80 cursor-pointer items-center gap-4 overflow-hidden rounded-lg p-2 text-left transition-colors"
              >
                <span
                  className={cn(
                    "flex items-center justify-center rounded-lg p-3",
                    iconWrapperClassName,
                  )}
                >
                  <Icon className="size-5" />
                </span>

                <span className="flex w-full flex-col justify-center">
                  <span className="text-sm font-medium">{label}</span>

                  <span className="text-muted-foreground max-w-[30ch] text-xs">
                    {description}
                  </span>
                </span>
              </button>
            </li>
          ),
        )}
      </ul>

      <AvatarVideoModal
        isOpen={videoModalOpen}
        onOpenStateChange={setVideoModalOpen}
      />
    </main>
  );
}

export default DashboardClient;
