import AudioInput from "../AudioInput";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface AudioModalProps {
  isOpen: boolean;
  onOpenStateChange: (isOpen: boolean) => void;
  onAudioRecorded: (audioBlob: Blob) => void;
}

function AudioInputModal({
  isOpen,
  onOpenStateChange,
  onAudioRecorded,
}: AudioModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenStateChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload or record audio</DialogTitle>
        </DialogHeader>

        <AudioInput onAudioReady={() => {}} />
      </DialogContent>
    </Dialog>
  );
}

export default AudioInputModal;
