"use client";

import { useState } from "react";
import { DASHBOARD_ACTIONS } from "~/lib/constants";
import { cn } from "~/lib/utils";
import AvatarVideoModal from "./modals/AvatarVideoModal";
import { Badge } from "./ui/badge";

type ActionMode = "avatar-video" | "video-translation" | "video-dubbing";

function DashboardClient() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const handleModalOpen = (mode: ActionMode) => {
    if (mode === "avatar-video") {
      setVideoModalOpen(true);
    }

    // video-translation and video-dubbing are coming soon — no-op
  };

  return (
    <main className="p-8">
      <h2 className="font-heading mb-6 text-xl font-semibold tracking-wide">
        Create something new
      </h2>

      <ul className="mb-2 flex flex-wrap gap-5">
        {DASHBOARD_ACTIONS.map(
          ({
            mode,
            label,
            icon: Icon,
            iconWrapperClassName,
            description,
            comingSoon,
          }) => (
            <li key={label} className="max-w-md min-w-[320px] flex-1">
              <button
                type="button"
                onClick={() =>
                  !comingSoon && handleModalOpen(mode as ActionMode)
                }
                disabled={comingSoon}
                className={cn(
                  "group bg-card focus-visible:ring-primary relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:outline-none",
                  comingSoon
                    ? "cursor-not-allowed opacity-60 grayscale-[0.3]"
                    : "hover:border-primary/20 hover:bg-secondary/20 cursor-pointer hover:shadow-md",
                )}
              >
                <span
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-xl p-3.5 transition-transform duration-300 group-hover:scale-110",
                    iconWrapperClassName,
                  )}
                >
                  <Icon className="size-6" />
                </span>

                <span className="flex w-full flex-col justify-center overflow-hidden">
                  <span className="flex items-center gap-2 text-base font-semibold transition-transform duration-300 group-hover:-translate-y-1">
                    {label}

                    {comingSoon && (
                      <Badge
                        variant="secondary"
                        className="bg-muted rounded-full px-2 py-0 text-[10px]"
                      >
                        Coming soon
                      </Badge>
                    )}
                  </span>

                  <span className="text-muted-foreground max-h-0 text-sm opacity-0 transition-all duration-300 group-hover:max-h-10 group-hover:-translate-y-0.5 group-hover:opacity-100">
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
