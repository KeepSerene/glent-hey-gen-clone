import AudioCapture from "../AudioCapture";
import AudioInput from "../AudioInput";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export interface Voice {
  id: string;
  name: string;
  flag: string;
  accent: string;
  tags: string[];
  r2Key: string;
  audioSrc: string;
}

interface SampleVoiceModalProps {
  isOpen: boolean;
  onOpenStateChange: (isOpen: boolean) => void;
  onVoiceSelected: (voice: Voice) => void;
  onAudioUploaded: (file: File) => void;
}

interface SampleVoiceCardProps {
  voice: Voice;
  isPlaying: boolean;
  onTogglePlay: (voice: Voice) => void;
  onSelect: (voice: Voice) => void;
}

function SampleVoiceCard({
  voice,
  isPlaying,
  onTogglePlay,
  onSelect,
}: SampleVoiceCardProps) {}

function SampleVoiceModal({
  isOpen,
  onOpenStateChange,
  onVoiceSelected,
  onAudioUploaded,
}: SampleVoiceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenStateChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pick a voice</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="glent-library">
          <TabsList>
            <TabsTrigger value="my-voices">My Voices</TabsTrigger>
            <TabsTrigger value="glent-library">Glent Library</TabsTrigger>
          </TabsList>

          <TabsContent value="my-voices" className="p-4">
            <AudioInput
              onAudioReady={(audioBlob: Blob) => {
                const file = new File([audioBlob], "custom_voice.wav", {
                  type: audioBlob.type,
                });
                onAudioUploaded(file);
                onOpenStateChange(false);
              }}
            />
          </TabsContent>

          <TabsContent
            value="glent-library"
            className="flex max-h-[60vh] flex-wrap gap-4 overflow-y-auto p-4"
          ></TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default SampleVoiceModal;
