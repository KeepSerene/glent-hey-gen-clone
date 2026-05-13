import { AudioLines, Video } from "lucide-react";
import { HOME_AVATAR_STEPS, HOME_VOICEOVER_STEPS } from "~/lib/constants";
import { cn } from "~/lib/utils";

export interface HowItWorksStep {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface TrackProps {
  icon: React.ElementType;
  label: string;
  steps: HowItWorksStep[];
  accent: "blue" | "emerald";
}

const StepConnector = ({ accent }: { accent: "blue" | "emerald" }) => (
  <div
    aria-hidden
    className={cn(
      "mx-auto my-1 h-6 w-px opacity-30",
      accent === "blue" ? "bg-primary" : "bg-emerald-500",
    )}
  />
);

function WorkflowTrack({ icon: TrackIcon, label, steps, accent }: TrackProps) {
  const isBlue = accent === "blue";

  const accentClasses = {
    iconWrapper: isBlue
      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
      : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500",
    badge: isBlue
      ? "bg-blue-50 text-blue-600 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20"
      : "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
    stepNum: isBlue
      ? "bg-primary/10 text-primary dark:bg-primary/15"
      : "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    glow: isBlue ? "rgba(65, 95, 145, 0.12)" : "rgba(16, 185, 129, 0.10)",
  };

  return (
    <div className="flex flex-col">
      {/* Track header */}
      <div className="mb-6 flex items-center gap-3">
        <span
          className={cn(
            "flex items-center justify-center rounded-xl p-2.5",
            accentClasses.iconWrapper,
          )}
        >
          <TrackIcon className="size-5" />
        </span>

        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold ring-1",
            accentClasses.badge,
          )}
        >
          {label}
        </span>
      </div>

      {/* Steps */}
      <div className="flex flex-col">
        {steps.map((step, i) => {
          const StepIcon = step.icon;

          return (
            <div key={step.title}>
              <div className="bg-card border-border hover:border-border/80 group flex items-start gap-4 rounded-2xl border p-4 transition-all duration-200 hover:shadow-sm">
                {/* Step number */}
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums",
                    accentClasses.stepNum,
                  )}
                  aria-label={`Step ${i + 1}`}
                >
                  {i + 1}
                </div>

                <div className="flex flex-col gap-0.5 pt-0.5">
                  <div className="flex items-center gap-2">
                    <StepIcon
                      className="text-muted-foreground size-3.5 shrink-0"
                      aria-hidden
                    />

                    <h3 className="font-heading text-sm leading-snug font-semibold">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {i < steps.length - 1 && <StepConnector accent={accent} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const HowItWorks = () => (
  <section id="how-it-works" className="relative py-20 sm:py-28">
    {/* Subtle section separator */}
    <div
      aria-hidden
      style={{
        background:
          "linear-gradient(90deg, transparent, var(--color-border, #c4c6d0), transparent)",
      }}
      className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-50"
    />

    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Section header */}
      <div className="mb-14 flex flex-col items-center gap-3 text-center">
        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          Workflow
        </p>

        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          How It Works
        </h2>

        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          Two powerful AI tools. Each follows the same intuitive four-step
          process — from input to download in minutes.
        </p>
      </div>

      {/* Two-track grid */}
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        <WorkflowTrack
          icon={Video}
          label="Avatar Video"
          steps={HOME_AVATAR_STEPS}
          accent="blue"
        />

        <WorkflowTrack
          icon={AudioLines}
          label="AI Voice Studio"
          steps={HOME_VOICEOVER_STEPS}
          accent="emerald"
        />
      </div>
    </div>
  </section>
);

export default HowItWorks;
