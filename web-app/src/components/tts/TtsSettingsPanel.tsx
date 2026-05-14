"use client";

import { AlertTriangle, ChevronDown, Info } from "lucide-react";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "~/lib/constants";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import SliderRow from "./SliderRow";
import { type TtsSettings } from "./tts-types";

interface TtsSettingsPanelProps {
  settings: TtsSettings;
  englishOnly: boolean;
  onUpdate: <K extends keyof TtsSettings>(
    key: K,
    value: TtsSettings[K],
  ) => void;
  onReset: () => void;
  advancedOpen: boolean;
  onAdvancedOpenChange: (open: boolean) => void;
}

function TtsSettingsPanel({
  settings,
  englishOnly,
  onUpdate,
  onReset,
  advancedOpen,
  onAdvancedOpenChange,
}: TtsSettingsPanelProps) {
  return (
    <>
      {/* ── Language select ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="language-select" className="text-sm">
          Speech language
        </Label>

        <Select
          value={settings.language}
          onValueChange={(v) => onUpdate("language", v as LanguageCode)}
          disabled={englishOnly}
        >
          <SelectTrigger id="language-select" className="w-full">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>

          <SelectContent>
            {SUPPORTED_LANGUAGES.map(({ code, name, flag }) => (
              <SelectItem
                key={code}
                value={code}
                className="flex items-center gap-2"
              >
                <span className="font-emoji text-base">{flag}</span> {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {englishOnly ? (
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-500">
            <AlertTriangle className="size-3" />
            Locked to English to ensure perfect lip-sync accuracy for avatar
            videos.
          </p>
        ) : (
          <p className="text-muted-foreground text-xs">
            Match the language of your script for best results.
          </p>
        )}
      </div>

      {/* ── Advanced options collapsible ──────────────────────────────────── */}
      <Collapsible open={advancedOpen} onOpenChange={onAdvancedOpenChange}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground -ml-1 flex items-center gap-1.5 px-1"
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                advancedOpen && "rotate-180",
              )}
            />
            Advanced options
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3 flex flex-col gap-4 rounded-lg border p-4">
          <SliderRow
            label="Exaggeration"
            tooltip="Controls emotional intensity. Higher values make speech more expressive and dramatic; pair with lower CFG weight if it sounds too fast."
            min={0}
            max={1}
            step={0.01}
            value={settings.exaggeration}
            onChange={(v) => onUpdate("exaggeration", v)}
          />

          <SliderRow
            label="CFG Weight"
            tooltip="Balances how closely the output follows the voice sample's style and pacing. Set to 0 to reduce accent transfer when the reference clip is in a different language."
            min={0}
            max={1}
            step={0.01}
            value={settings.cfgWeight}
            onChange={(v) => onUpdate("cfgWeight", v)}
          />

          <SliderRow
            label="Temperature"
            tooltip="Controls output randomness. Lower values produce more consistent, predictable speech; higher values add natural variation."
            min={0.1}
            max={1}
            step={0.01}
            value={settings.temperature}
            onChange={(v) => onUpdate("temperature", v)}
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="seed-input" className="text-xs">
                Generation Seed
              </Label>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="text-muted-foreground size-3.5 cursor-help" />
                </TooltipTrigger>

                <TooltipContent className="max-w-52 text-xs">
                  Set a specific number to lock in the voice&apos;s pacing and
                  inflection, making it reproducible. Leave at 0 for a random
                  performance every time.
                </TooltipContent>
              </Tooltip>
            </div>

            <Input
              id="seed-input"
              type="number"
              min={0}
              placeholder="0"
              value={settings.seed || ""}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onUpdate("seed", isNaN(val) ? 0 : val);
              }}
              className="w-full text-xs tabular-nums"
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="self-end text-xs"
            onClick={onReset}
          >
            Reset to defaults
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}

export default TtsSettingsPanel;
