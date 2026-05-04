import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function useAudioPlayer() {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handlePlaybackEnded = () => setAudioSrc(null);

    audio.addEventListener("ended", handlePlaybackEnded);

    return () => {
      audio.removeEventListener("ended", handlePlaybackEnded);
      audio.pause();
    };
  }, []);

  const togglePlay = async (src: string) => {
    const audio = audioRef.current;

    if (!audio) return;

    if (audioSrc === src) {
      audio.pause();
      setAudioSrc(null);
    } else {
      audio.src = src;
      audio.load();

      try {
        await audio.play();
        setAudioSrc(src);
      } catch (error) {
        console.error("Error toggling audio playback:", error);
        toast.error("Failed to play audio. Try again.");
      }
    }
  };

  return { audioSrc, togglePlay };
}
