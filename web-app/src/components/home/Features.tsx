import { AudioWaveform, Cpu, Globe } from "lucide-react";
import {
  HOME_FEATURE_CARD_ACCENT_STYLES,
  HOME_FEATURES,
} from "~/lib/constants";
import { cn } from "~/lib/utils";

export interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  accent: "blue" | "emerald" | "purple" | "amber" | "neutral";
}

function FeatureCard({ icon: Icon, title, description, accent }: Feature) {
  const styles = HOME_FEATURE_CARD_ACCENT_STYLES[accent];

  return (
    <article
      className={cn(
        "bg-card group relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-5 transition-all duration-300",
        "hover:shadow-md",
        styles.hoverBorder,
      )}
    >
      {/* Hover glow */}
      <div
        aria-hidden
        style={{
          background: `radial-gradient(ellipse at 20% 20%, ${styles.glow}, transparent 70%)`,
        }}
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <span
        className={cn(
          "flex w-fit items-center justify-center rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-110",
          styles.wrapper,
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>

      <div className="flex flex-col gap-1.5">
        <h3 className="font-heading text-sm leading-snug font-semibold">
          {title}
        </h3>

        <p className="text-muted-foreground text-xs leading-relaxed">
          {description}
        </p>
      </div>
    </article>
  );
}

const Features = () => (
  <section id="features" className="relative py-20 sm:py-28">
    {/* Ambient glow */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        style={{
          backgroundImage: "radial-gradient(circle, #415f91, transparent 70%)",
        }}
        className="absolute top-1/2 left-1/4 size-120 -translate-y-1/2 rounded-full opacity-[0.07] blur-[80px] dark:opacity-[0.06]"
      />

      <div
        style={{
          backgroundImage: "radial-gradient(circle, #10b981, transparent 70%)",
        }}
        className="absolute top-1/2 right-1/4 size-90 -translate-y-1/2 rounded-full opacity-[0.06] blur-[72px] dark:opacity-[0.05]"
      />
    </div>

    {/* Subtle separator */}
    <div
      aria-hidden
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent, var(--color-border, #c4c6d0), transparent)",
      }}
      className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-50"
    />

    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Section header */}
      <div className="mb-14 flex flex-col items-center gap-3 text-center">
        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          Capabilities
        </p>

        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Everything You Need
        </h2>

        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          A focused set of powerful AI tools — built to produce
          professional-grade results with minimal friction.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HOME_FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>

      {/* Tech stack callout */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {[
          { icon: Cpu, label: "Hallo3 — Lip-sync video generation" },
          {
            icon: AudioWaveform,
            label: "ChatterboxTTS — Multilingual speech",
          },
          { icon: Globe, label: "Cloudflare R2 — Private media storage" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="text-muted-foreground flex items-center gap-2 text-xs"
          >
            <Icon className="size-3.5 shrink-0" aria-hidden />
            {label}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
