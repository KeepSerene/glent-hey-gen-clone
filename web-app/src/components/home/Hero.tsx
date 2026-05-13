import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import Image from "next/image";
import { Badge } from "../ui/badge";

interface HeroProps {
  isAuthenticated: boolean;
}

const Hero = ({ isAuthenticated }: HeroProps) => (
  <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32">
    {/* ── Ambient glow layer ──────────────────────────────────────── */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Primary */}
      <div
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #415f91, transparent 70%)",
        }}
        className="absolute -top-20 -right-20 size-70 rounded-full opacity-[0.15] blur-[50px] transition-all sm:size-100 sm:opacity-20 sm:blur-3xl lg:-top-32 lg:-right-32 lg:size-150 lg:opacity-[0.28] lg:blur-[96px] dark:opacity-20 lg:dark:opacity-[0.3]"
      />

      {/* Accent */}
      <div
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #a78bfa, transparent 70%)",
        }}
        className="absolute top-1/4 -left-20 size-60 rounded-full opacity-[0.12] blur-[48px] transition-all sm:size-87.5 sm:opacity-[0.18] sm:blur-3xl lg:top-1/3 lg:left-1/2 lg:size-125 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:opacity-[0.35] lg:blur-3xl dark:opacity-[0.15] lg:dark:opacity-[0.25]"
      />

      {/* Emerald */}
      <div
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #10b981, transparent 70%)",
        }}
        className="absolute -right-20 -bottom-20 size-60 rounded-full opacity-[0.12] blur-[48px] transition-all sm:size-87.5 sm:opacity-[0.15] sm:blur-3xl lg:-bottom-24 lg:-left-24 lg:size-125 lg:opacity-[0.2] lg:blur-[80px] lg:dark:opacity-[0.18]"
      />
    </div>

    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* ── Eyebrow badge ──────────────────────────────────── */}
        <Badge
          variant="outline"
          className="text-primary border-primary dark:bg-primary/10 bg-primary/5 rounded-full text-xs font-semibold select-none"
        >
          <Sparkles className="size-3 shrink-0" />
          Powered by Hallo3 &amp; ChatterboxTTS
        </Badge>

        {/* ── Headline ───────────────────────────────────────── */}
        <h1 className="font-heading max-w-3xl text-3xl leading-[1.1] font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-[68px]">
          Animate portraits.
          <br />
          <span
            style={{
              backgroundImage:
                "linear-gradient(125deg, var(--color-primary, #415f91) 0%, #10b981 100%)",
            }}
            className="bg-clip-text text-transparent"
          >
            Clone voices.
          </span>
        </h1>

        {/* ── Sub-headline ───────────────────────────────────── */}
        <p className="text-muted-foreground max-w-lg text-base sm:text-lg">
          High-fidelity talking portraits and multilingual speech generation. No
          gear required.
        </p>

        {/* ── CTAs ───────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          {isAuthenticated ? (
            <Button size="lg" asChild className="gap-2">
              <Link href="/dashboard">
                Open dashboard
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild className="gap-2">
                <Link href="/auth/sign-in">
                  Start for Free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>

              <Button variant="outline" size="lg" asChild>
                <a href="#how-it-works">See how it works</a>
              </Button>
            </>
          )}
        </div>

        {/* ── Free credits note ──────────────────────────────── */}
        {!isAuthenticated && (
          <p className="text-muted-foreground/70 text-xs">
            50 free credits on sign-up. No credit card required.
          </p>
        )}

        {/* ── Hero illustrations ─────────────────────────── */}
        <div className="relative mt-8 w-full max-w-4xl">
          {/* Gradient border ring */}
          <div
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(135deg, #415f91 0%, #10b981 50%, #a78bfa 100%)",
              filter: "blur(0.5px)",
            }}
            className="absolute inset-[-1.5px] rounded-2xl opacity-50 dark:opacity-40"
          />

          {/* Placeholder frame */}
          <div className="bg-card border-border relative aspect-video w-full overflow-hidden rounded-2xl border">
            {/* Light theme illustration */}
            <Image
              src="/images/illustration-light.webp"
              alt="Glent AI Avatar & Voice Studio Interface"
              width={1920}
              height={1081}
              priority
              className="w-full object-cover dark:hidden"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1024px, 1280px"
            />

            {/* Dark theme illustration */}
            <Image
              src="/images/illustration-dark.webp"
              alt="Glent AI Avatar & Voice Studio Interface"
              width={1920}
              height={1081}
              priority
              className="w-full object-cover not-dark:hidden"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1024px, 1280px"
            />
          </div>
        </div>

        {/* ── Trust indicators ──────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2.5 pt-2">
          {[
            {
              color: "bg-emerald-500",
              label: "Real-time generation tracking",
            },
            { color: "bg-primary", label: "23 supported languages" },
            { color: "bg-blue-400", label: "Private secure storage" },
          ].map(({ color, label }) => (
            <span
              key={label}
              className="text-muted-foreground flex items-center gap-2 text-xs"
            >
              <span
                aria-hidden
                className={cn(color, "inline-block size-1.5 rounded-full")}
              />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
