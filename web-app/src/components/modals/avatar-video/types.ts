import type { LanguageCode } from "~/lib/constants";

export interface TtsSettings {
  language: LanguageCode;
  exaggeration: number;
  cfgWeight: number;
  temperature: number;
  seed: number;
}

export const DEFAULT_TTS_SETTINGS: TtsSettings = {
  language: "en",
  exaggeration: 0.5,
  cfgWeight: 0.5,
  temperature: 0.8,
  seed: 0,
};
