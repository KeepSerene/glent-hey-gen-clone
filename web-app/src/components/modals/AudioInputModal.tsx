import AudioInput from "../audio/AudioInput";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface AudioInputModalProps {
  isOpen: boolean;
  onOpenStateChange: (isOpen: boolean) => void;
  onAudioRecorded: (audioBlob: Blob) => void;
}

const AudioInputModal = ({
  isOpen,
  onOpenStateChange,
  onAudioRecorded,
}: AudioInputModalProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenStateChange}>
    <DialogContent className="max-w-md overflow-hidden">
      {/* Accent glow */}
      <div
        aria-hidden
        className="bg-accent pointer-events-none absolute -top-20 -left-20 -z-10 size-72 rounded-full opacity-[0.28] blur-[60px] dark:opacity-[0.32]"
      />

      <DialogHeader className="mb-4">
        <DialogTitle className="mt-2 tracking-tight">
          Upload or record audio
        </DialogTitle>

        <DialogDescription className="text-muted-foreground mt-1.5 text-sm">
          Record your own audio, or upload/drop one you like.
        </DialogDescription>
      </DialogHeader>

      <AudioInput
        onAudioReady={(blob: Blob) => {
          onAudioRecorded(blob);
          onOpenStateChange(false);
        }}
      />
    </DialogContent>
  </Dialog>
);

export default AudioInputModal;
