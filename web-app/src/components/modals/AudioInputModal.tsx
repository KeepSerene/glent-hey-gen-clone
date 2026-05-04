import AudioInput from "../AudioInput";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

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
