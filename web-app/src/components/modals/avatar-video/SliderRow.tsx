import { Info } from "lucide-react";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export interface SliderRowProps {
  label: string;
  tooltip: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}

const SliderRow = ({
  label,
  tooltip,
  min,
  max,
  step,
  value,
  onChange,
}: SliderRowProps) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Label className="text-xs">{label}</Label>

        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="text-muted-foreground size-3.5 cursor-help" />
          </TooltipTrigger>

          <TooltipContent className="max-w-52 text-xs">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </div>

      <span className="text-muted-foreground font-mono text-xs tabular-nums">
        {value.toFixed(2)}
      </span>
    </div>

    <Slider
      min={min}
      max={max}
      step={step}
      value={[value]}
      onValueChange={([v]) => onChange(v!)}
    />
  </div>
);

export default SliderRow;
