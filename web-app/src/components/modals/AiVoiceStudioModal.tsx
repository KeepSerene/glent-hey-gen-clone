"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useAudioPlayer from "~/hooks/useAudioPlayer";
import { MAX_TTS_SCRIPT_LENGTH, MIN_TTS_SCRIPT_LENGTH } from "~/lib/constants";
import { cn } from "~/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import SampleVoiceModal, { type Voice } from "./SampleVoiceModal";
import TtsSettingsPanel from "./avatar-video/TtsSettingsPanel";
import { DEFAULT_TTS_SETTINGS, type TtsSettings } from "./avatar-video/types";
import VoiceIndicator from "./avatar-video/VoiceIndicator";

interface AiVoiceStudioModalProps {
  isOpen: boolean;
  onOpenStateChange: (isOpen: boolean) => void;
}

function AiVoiceStudioModal({
  isOpen,
  onOpenStateChange,
}: AiVoiceStudioModalProps) {
  const [script, setScript] = useState("");
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [userAudioFile, setUserAudioFile] = useState<File | null>(null);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);

  const [ttsSettings, setTtsSettings] =
    useState<TtsSettings>(DEFAULT_TTS_SETTINGS);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const { audioSrc, togglePlay } = useAudioPlayer();

  useEffect(() => {
    if (!userAudioFile) {
      setUserAudioUrl(null);
      return;
    }

    const url = URL.createObjectURL(userAudioFile);
    setUserAudioUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [userAudioFile]);

  const updateTts = <K extends keyof TtsSettings>(
    key: K,
    value: TtsSettings[K],
  ) => setTtsSettings((prev) => ({ ...prev, [key]: value }));

  // Validations
  const hasVoice = !!selectedVoice || !!userAudioFile;
  const isScriptLongEnough = script.trim().length >= MIN_TTS_SCRIPT_LENGTH;
  const canGenerate = isScriptLongEnough && hasVoice;

  const handleGenerate = () => {
    if (!canGenerate) return;

    toast.info("Voice generation queued — backend wiring coming next.");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenStateChange}>
        <DialogContent className="max-h-[85vh] w-full max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-emerald-500 dark:text-emerald-500">
              AI Voice Studio
            </DialogTitle>

            <DialogDescription className="mt-2 text-sm">
              Type your script, pick a voice or upload a clone sample, and
              generate ultra-realistic multi-lingual speech.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-4">
            {/* Script textarea */}
            <div className="relative">
              <Textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={7}
                maxLength={MAX_TTS_SCRIPT_LENGTH}
                placeholder="Type your script here..."
                className="placeholder:text-muted-foreground/70 min-h-32 resize-none pb-10 text-base break-all"
              />

              {/* Bottom toolbar */}
              <div className="absolute bottom-2 left-0 flex w-full items-center justify-between px-3">
                <VoiceIndicator
                  userAudioFile={userAudioFile}
                  userAudioUrl={userAudioUrl}
                  selectedVoice={selectedVoice}
                  activeAudioSrc={audioSrc}
                  onTogglePlay={(src) => void togglePlay(src)}
                  onOpenVoiceModal={() => setVoiceModalOpen(true)}
                />

                {/* Dynamic character counter */}
                <p
                  className={cn(
                    "text-xs transition-colors select-none",
                    script.trim().length > 0 && !isScriptLongEnough
                      ? "text-destructive font-medium"
                      : "text-muted-foreground/70",
                  )}
                >
                  {script.length} / {MAX_TTS_SCRIPT_LENGTH}{" "}
                  {script.trim().length > 0 &&
                    !isScriptLongEnough &&
                    `(Min ${MIN_TTS_SCRIPT_LENGTH})`}
                </p>
              </div>
            </div>

            <TtsSettingsPanel
              settings={ttsSettings}
              englishOnly={false}
              onUpdate={updateTts}
              onReset={() => setTtsSettings(DEFAULT_TTS_SETTINGS)}
              advancedOpen={advancedOpen}
              onAdvancedOpenChange={setAdvancedOpen}
            />

            <Button
              type="button"
              size="lg"
              className="mt-2 w-full shrink-0"
              disabled={!canGenerate}
              onClick={handleGenerate}
            >
              <Sparkles className="mr-2 size-4" />
              Generate Speech
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SampleVoiceModal
        isOpen={voiceModalOpen}
        onOpenStateChange={setVoiceModalOpen}
        onVoiceSelected={(voice: Voice) => {
          setSelectedVoice(voice);
          setUserAudioFile(null);
          setVoiceModalOpen(false);
        }}
        onAudioUploaded={(file: File) => {
          setSelectedVoice(null);
          setUserAudioFile(file);
          setVoiceModalOpen(false);
        }}
      />
    </>
  );
}

export default AiVoiceStudioModal;
