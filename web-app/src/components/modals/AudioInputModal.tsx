import AudioInput from "../AudioInput";
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

function AudioInputModal({
  isOpen,
  onOpenStateChange,
  onAudioRecorded,
}: AudioInputModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenStateChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload or record audio</DialogTitle>

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
}

export default AudioInputModal;
