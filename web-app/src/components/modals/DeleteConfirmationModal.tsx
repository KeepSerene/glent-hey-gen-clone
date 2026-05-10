"use client";

import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { GENERATION_COSTS } from "~/lib/constants";

export interface DeletingItem {
  id: string;
  type: "avatar-video" | "voiceover";
  title: string | null;
  status: string;
}

interface DeleteConfirmationModalProps {
  item: DeletingItem | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

function getDeleteTitle(item: DeletingItem): string {
  const isActive =
    item.status === "queued" ||
    item.status === "tts_generating" ||
    item.status === "video_generating" ||
    item.status === "generating";

  return isActive ? "Cancel this generation?" : "Delete this generation?";
}

function getDeleteDescription(item: DeletingItem): string {
  const isActive =
    item.status === "queued" ||
    item.status === "tts_generating" ||
    item.status === "video_generating" ||
    item.status === "generating";

  if (!isActive) {
    return item.status === "completed"
      ? "This will permanently remove the generation and its output file. This action cannot be undone."
      : "This will remove the failed generation record. No credits will be refunded.";
  }

  const cost = GENERATION_COSTS[item.type];
  const willRefund = item.status === "queued";

  return willRefund
    ? `This job hasn't started yet — canceling will refund all ${cost} credits back to your balance.`
    : `The GPU is already running this job. Canceling will stop it, but no credits will be refunded.`;
}

export default function DeleteConfirmationModal({
  item,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteConfirmationModalProps) {
  return (
    <AlertDialog open={!!item} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {item ? getDeleteTitle(item) : "Are you sure?"}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {item ? getDeleteDescription(item) : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Keep it</AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 size-3.5 animate-spin" />}
            {item?.status === "queued" ||
            item?.status === "tts_generating" ||
            item?.status === "video_generating" ||
            item?.status === "generating"
              ? "Yes, cancel"
              : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
