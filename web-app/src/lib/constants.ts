import {
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
];
export const AUTH_ROUTES = ["/auth"];
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
];
export const DASHBOARD_ACTIONS = [
  {
    mode: "avatar-video",
    label: "Avatar Video",
    icon: Video,
    iconWrapperClassName: "bg-blue-50 text-blue-500",
    description: "Animate a portrait photo with generated speech.",
  },
  {
    mode: "video-translation",
    label: "Video Translation",
    icon: Languages,
    iconWrapperClassName: "bg-orange-50 text-orange-500",
    description: "Translate speech while preserving voice and lip-sync.",
  },
  {
    mode: "video-dubbing",
    label: "AI Dubbing",
    icon: Mic2,
    iconWrapperClassName: "bg-purple-50 text-purple-500",
    description: "Replace a video's audio track and sync lip movements.",
  },
];
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
];
export const MAX_SCRIPT_LENGTH = 150; // ~10 sec of speech at average pace
export const MAX_AUDIO_DURATION_SECS = 10;
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
];
