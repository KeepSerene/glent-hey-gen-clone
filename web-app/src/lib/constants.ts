import {
  AudioWaveform,
  CreditCard,
  Languages,
  LayoutDashboard,
  Mic2,
  Settings2,
  Video,
} from "lucide-react";
import type { Voice } from "~/components/modals/SampleVoiceModal";

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,32}$/;
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/billing",
  "/settings",
  "/settings/account",
  "/settings/security",
] as const;
export const AUTH_ROUTES = ["/auth"] as const;
export const APP_SIDEBAR_MENU_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/settings/account",
    icon: Settings2,
  },
] as const;
export const DASHBOARD_ACTIONS = [
  {
    mode: "avatar-video",
    label: "Avatar Video",
    icon: Video,
    iconWrapperClassName:
      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500",
    description: "Animate a portrait photo with generated speech.",
    comingSoon: false,
  },
  {
    mode: "ai-voice-studio",
    label: "AI Voice Studio",
    icon: AudioWaveform,
    iconWrapperClassName:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500",
    description: "Generate multi-lingual speech with AI voice cloning.",
    comingSoon: false,
  },
  {
    mode: "video-translation",
    label: "Video Translation",
    icon: Languages,
    iconWrapperClassName:
      "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500",
    description: "Translate speech while preserving voice and lip-sync.",
    comingSoon: true,
  },
  {
    mode: "video-dubbing",
    label: "AI Dubbing",
    icon: Mic2,
    iconWrapperClassName:
      "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-500",
    description: "Replace a video's audio track and sync lip movements.",
    comingSoon: true,
  },
] as const;
export const SAMPLE_AVATARS = [
  {
    r2Key: "samples/avatars/avatar-01.jpg",
    publicUrl:
      "https://pub-7c4555bc118048e2bc8551884359e9a8.r2.dev/samples/avatars/avatar-01.jpg",
  },
  {
    r2Key: "samples/avatars/avatar-02.jpg",
    publicUrl:
      "https://pub-7c4555bc118048e2bc8551884359e9a8.r2.dev/samples/avatars/avatar-02.jpg",
  },
  {
    r2Key: "samples/avatars/avatar-03.jpg",
    publicUrl:
      "https://pub-7c4555bc118048e2bc8551884359e9a8.r2.dev/samples/avatars/avatar-03.jpg",
  },
] as const;
export const MAX_SCRIPT_LENGTH = 150 as const; // ~10 sec of speech at average pace
export const MIN_SCRIPT_LENGTH = 10;
export const MAX_TTS_SCRIPT_LENGTH = 240 as const; // ~16 sec
export const MIN_TTS_SCRIPT_LENGTH = 10;
export const MAX_AUDIO_DURATION_SECS = 10 as const;
export const SAMPLE_VOICES: Voice[] = [
  {
    id: "voice_01_jasper",
    name: "Jasper",
    flag: "🇺🇸",
    accent: "American (West Coast)",
    tags: ["Corporate", "Commanding", "Direct", "Mature"],
    r2Key: "samples/voices/voice-01.wav",
    audioSrc:
      "https://pub-7c4555bc118048e2bc8551884359e9a8.r2.dev/samples/voices/voice-01.wav",
  },
  {
    id: "voice_02_ruby",
    name: "Ruby",
    flag: "🇨🇦",
    accent: "North American",
    tags: ["Authoritative", "Professional", "Expressive", "Dynamic"],
    r2Key: "samples/voices/voice-02.wav",
    audioSrc:
      "https://pub-7c4555bc118048e2bc8551884359e9a8.r2.dev/samples/voices/voice-02.wav",
  },
  {
    id: "voice_03_finn",
    name: "Finn",
    flag: "🇦🇺",
    accent: "Australian (Neutral)",
    tags: ["Analytical", "Calm", "Tech", "Conversational"],
    r2Key: "samples/voices/voice-03.wav",
    audioSrc:
      "https://pub-7c4555bc118048e2bc8551884359e9a8.r2.dev/samples/voices/voice-03.wav",
  },
] as const;
export const SUPPORTED_LANGUAGES = [
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "el", name: "Greek", flag: "🇬🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "he", name: "Hebrew", flag: "🇮🇱" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ms", name: "Malay", flag: "🇲🇾" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "no", name: "Norwegian", flag: "🇳🇴" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "sw", name: "Swahili", flag: "🇰🇪" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
] as const;
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "audio/wav": "wav",
} as const;
export const DAILY_LIMITS = {
  "avatar-video": 1,
  voiceover: 2,
} as const;
export type GenerationEventType = keyof typeof DAILY_LIMITS;
export const QUOTA_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
