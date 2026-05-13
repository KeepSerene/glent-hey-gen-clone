import {
  AudioLines,
  Cpu,
  CreditCard,
  Download,
  FileText,
  Globe,
  History,
  ImagePlus,
  Languages,
  LayoutDashboard,
  LockKeyhole,
  Mic2,
  Settings2,
  Sparkles,
  Video,
  Zap,
} from "lucide-react";
import type { ActionMode } from "~/components/dashboard/DashboardClient";
import type { Feature } from "~/components/home/Features";
import type { HowItWorksStep } from "~/components/home/HowItWorks";
import type { PricingTier } from "~/components/home/Pricing";
import GithubIcon from "~/components/icons/GitHubIcon";
import LinkedInIcon from "~/components/icons/LinkedIn";
import XIcon from "~/components/icons/XIcon";
import type { Voice } from "~/components/modals/SampleVoiceModal";

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,32}$/;
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/billing",
  "/history",
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
    title: "History",
    href: "/history",
    icon: History,
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
    icon: AudioLines,
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
export const DASHBOARD_ACTION_THEMES: Record<
  ActionMode,
  { ring: string; gradient: string; border: string }
> = {
  "avatar-video": {
    ring: "focus-visible:ring-blue-500",
    gradient:
      "from-blue-500/0 to-blue-500/10 dark:from-blue-500/0 dark:to-blue-500/15",
    border: "hover:border-blue-200 dark:hover:border-blue-500/30",
  },
  "ai-voice-studio": {
    ring: "focus-visible:ring-emerald-500",
    gradient:
      "from-emerald-500/0 to-emerald-500/10 dark:from-emerald-500/0 dark:to-emerald-500/15",
    border: "hover:border-emerald-200 dark:hover:border-emerald-500/30",
  },
  "video-translation": {
    ring: "focus-visible:ring-orange-500",
    gradient:
      "from-orange-500/0 to-orange-500/10 dark:from-orange-500/0 dark:to-orange-500/15",
    border: "hover:border-orange-200 dark:hover:border-orange-500/30",
  },
  "video-dubbing": {
    ring: "focus-visible:ring-purple-500",
    gradient:
      "from-purple-500/0 to-purple-500/10 dark:from-purple-500/0 dark:to-purple-500/15",
    border: "hover:border-purple-200 dark:hover:border-purple-500/30",
  },
} as const;
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
export const TERMINAL_STATUSES = new Set(["completed", "failed"]);
export const DEFAULT_POLL_INTERVAL = 5_000 as const; // 5 secs
export const TTS_POLL_INTERVAL = 10_000 as const; // 10 secs
export const VIDEO_GEN_POLL_INTERVAL = 60_000 as const; // 1 min
export const GEN_STATUS_LABELS: Record<string, string> = {
  queued: "Warming up the GPU...",
  tts_generating: "Synthesizing voice from your script...",
  video_generating:
    "Animating your avatar... perfection takes time! Go hydrate, stretch, or fold some laundry. Your progress is saved.",
  generating: "Synthesizing your voiceover...",
  completed: "Your creation is ready!",
  failed: "Something went wrong.",
} as const;
export type GenerationEventType = keyof typeof DAILY_LIMITS;
export const GEN_QUOTA_WINDOWS_MS: Record<GenerationEventType, number> = {
  "avatar-video": 7 * 24 * 60 * 60 * 1000, // 1 week
  voiceover: 24 * 60 * 60 * 1000, // 24 hours
} as const;
export const RECENT_CARD_STATUS_DOT: Record<string, string> = {
  queued: "bg-muted-foreground",
  tts_generating: "bg-amber-400",
  video_generating: "bg-blue-400",
  generating: "bg-amber-400",
  completed: "bg-emerald-500",
  failed: "bg-destructive",
};
export const GEN_CARD_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  queued: {
    label: "Queued",
    className: "bg-secondary text-secondary-foreground",
  },
  tts_generating: {
    label: "Synthesizing",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  },
  video_generating: {
    label: "Animating",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  },
  generating: {
    label: "Generating",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  },
  completed: {
    label: "Ready",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  failed: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive",
  },
} as const;
export const GENERATION_COSTS = {
  "avatar-video": 35,
  voiceover: 5,
} as const;
export const POLAR_SPARK_PACK_ID =
  "2602da5d-f929-4c3e-a452-75364e9a2831" as const;
export const POLAR_FLARE_PACK_ID =
  "b0ac7b03-a1cd-4ccb-a352-fe904f9e5779" as const;
export const POLAR_BRILLIANCE_PACK_ID =
  "4dfdd053-1af2-453e-8ba2-fa4ec6b8ee6b" as const;
export const HOME_HEADER_NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
] as const;
export const HOME_AVATAR_STEPS: HowItWorksStep[] = [
  {
    icon: ImagePlus,
    title: "Upload Your Portrait",
    description:
      "Choose a clear front-facing portrait photo. JPEG, PNG, or WebP — our AI handles the rest.",
  },
  {
    icon: Mic2,
    title: "Write a Script & Pick a Voice",
    description:
      "Type up to 150 characters as your script. Select a voice from the Glent library or upload your own WAV clone sample.",
  },
  {
    icon: Cpu,
    title: "AI Generates the Video",
    description:
      "ChatterboxTTS synthesises your audio, then Hallo3 animates the portrait with perfectly timed lip-sync on an A100 GPU.",
  },
  {
    icon: Download,
    title: "Download Your MP4",
    description:
      "Your talking-head video is ready. Stream it in-browser or download it — yours to share anywhere.",
  },
];
export const HOME_VOICEOVER_STEPS: HowItWorksStep[] = [
  {
    icon: FileText,
    title: "Write Your Script",
    description:
      "Type up to 240 characters — roughly 16 seconds of natural-paced speech in any of 23 supported languages.",
  },
  {
    icon: Mic2,
    title: "Pick or Clone a Voice",
    description:
      "Select a pre-made voice from the Glent library, or upload a short WAV sample to clone any voice you like.",
  },
  {
    icon: Cpu,
    title: "AI Synthesises Speech",
    description:
      "ChatterboxMultilingualTTS runs on a T4 GPU, generating ultra-realistic speech with configurable expressiveness and tone.",
  },
  {
    icon: Download,
    title: "Download Your WAV",
    description:
      "Stream the result directly in-browser or download the broadcast-ready WAV file instantly.",
  },
];
export const HOME_FEATURES: Feature[] = [
  {
    icon: Video,
    title: "Talking Avatar Video",
    description:
      "Animate any front-facing portrait photo with perfectly lip-synced speech.",
    accent: "blue",
  },
  {
    icon: AudioLines,
    title: "Voice Cloning",
    description:
      "Upload a short WAV sample and clone any voice. We capture timbre, accent, and expressiveness with remarkable accuracy.",
    accent: "emerald",
  },
  {
    icon: Languages,
    title: "23 Languages",
    description:
      "Generate speech in Arabic, Chinese, French, Hindi, Japanese, Spanish, and 17 more languages — all from a single script.",
    accent: "purple",
  },
  {
    icon: Zap,
    title: "Real-time Progress",
    description:
      "Live status tracking polls every few seconds. Watch your job move from queued → synthesising → animating → ready.",
    accent: "amber",
  },
  {
    icon: LockKeyhole,
    title: "Private Secure Storage",
    description:
      "Every generated file lives in a private Cloudflare R2 bucket. Access via short-lived presigned URLs — never publicly exposed.",
    accent: "neutral",
  },
  {
    icon: Sparkles,
    title: "Fine-grained Controls",
    description:
      "Tune exaggeration, CFG weight, temperature, and seed per generation. Dial in exactly the tone, pace, and energy you want.",
    accent: "blue",
  },
] as const;
export const HOME_FEATURE_CARD_ACCENT_STYLES = {
  blue: {
    wrapper: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    glow: "rgba(65, 95, 145, 0.08)",
    hoverBorder: "hover:border-blue-200 dark:hover:border-blue-500/20",
  },
  emerald: {
    wrapper:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    glow: "rgba(16, 185, 129, 0.07)",
    hoverBorder: "hover:border-emerald-200 dark:hover:border-emerald-500/20",
  },
  purple: {
    wrapper:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    glow: "rgba(139, 92, 246, 0.07)",
    hoverBorder: "hover:border-violet-200 dark:hover:border-violet-500/20",
  },
  amber: {
    wrapper:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    glow: "rgba(245, 158, 11, 0.07)",
    hoverBorder: "hover:border-amber-200 dark:hover:border-amber-500/20",
  },
  neutral: {
    wrapper: "bg-muted text-muted-foreground",
    glow: "rgba(100, 116, 139, 0.06)",
    hoverBorder: "hover:border-border",
  },
} as const;
export const HOME_PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    price: "Free",
    priceNote: "50 credits on sign-up",
    credits: 50,
    productId: null,
    description:
      "Try the full Glent experience. Rate limits apply to keep the portfolio demo fair for everyone.",
    features: [
      "50 credits on account creation",
      `1 avatar video per 7-day window`,
      `2 voiceovers per 24-hour window`,
      "Access to all 3 sample voices",
      "23 supported languages",
      "Private secure storage",
    ],
    ctaLabel: "Get started free",
  },
  {
    name: "Spark",
    price: "$5",
    priceNote: "one-time · 500 credits",
    credits: 500,
    productId: POLAR_SPARK_PACK_ID,
    description:
      "A solid top-up for personal projects or occasional generation needs.",
    features: [
      "500 credits added to balance",
      `~${Math.floor(500 / GENERATION_COSTS["avatar-video"])} avatar videos`,
      `~${Math.floor(500 / GENERATION_COSTS.voiceover)} voiceovers`,
      "Same daily rate limits as Starter",
      "Credits never expire",
      "All Starter features",
    ],
    ctaLabel: "Buy Spark pack",
  },
  {
    name: "Flare",
    price: "$12",
    priceNote: "one-time · 1,500 credits",
    credits: 1500,
    productId: POLAR_FLARE_PACK_ID,
    badge: "Most Popular",
    badgeStyle: "primary",
    description:
      "Great value for creators who generate regularly. More credits, lower cost per generation.",
    features: [
      "1,500 credits added to balance",
      `~${Math.floor(1500 / GENERATION_COSTS["avatar-video"])} avatar videos`,
      `~${Math.floor(1500 / GENERATION_COSTS.voiceover)} voiceovers`,
      "Same daily rate limits as Starter",
      "Credits never expire",
      "All Starter features",
    ],
    ctaLabel: "Buy Flare pack",
  },
  {
    name: "Brilliance",
    price: "$25",
    priceNote: "one-time · 3,500 credits",
    credits: 3500,
    productId: POLAR_BRILLIANCE_PACK_ID,
    badge: "Best Value",
    badgeStyle: "accent",
    description:
      "The most credits per dollar. Ideal for teams, demos, or high-volume content production.",
    features: [
      "3,500 credits added to balance",
      `~${Math.floor(3500 / GENERATION_COSTS["avatar-video"])} avatar videos`,
      `~${Math.floor(3500 / GENERATION_COSTS.voiceover)} voiceovers`,
      "Same daily rate limits as Starter",
      "Credits never expire",
      "All Starter features",
    ],
    ctaLabel: "Buy Brilliance pack",
  },
] as const;
export const HOME_FOOTER_SOCIALS = [
  {
    label: "Portfolio",
    href: "https://math-to-dev.vercel.app",
    icon: Globe,
  },
  {
    label: "GitHub",
    href: "https://github.com/KeepSerene",
    icon: GithubIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/dhrubajyoti-bhattacharjee-320822318/",
    icon: LinkedInIcon,
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/UsualLearner",
    icon: XIcon,
  },
] as const;
export const HOME_FOOTER_NAV_GROUPS = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    heading: "App",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "History", href: "/history" },
      { label: "Billing", href: "/billing" },
      { label: "Settings", href: "/settings/account" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign in", href: "/auth/sign-in" },
      { label: "Sign up", href: "/auth/sign-up" },
      { label: "Sign out", href: "/auth/sign-out" },
    ],
  },
] as const;
