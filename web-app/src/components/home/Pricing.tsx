"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Info, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { GENERATION_COSTS, HOME_PRICING_TIERS } from "~/lib/constants";
import { authClient } from "~/server/better-auth/client";

export interface PricingTier {
  name: string;
  price: string;
  priceNote: string;
  credits: number;
  productId: string | null;
  badge?: string;
  badgeStyle?: "primary" | "accent";
  description: string;
  features: string[];
  ctaLabel: string;
}

function PricingCard({
  tier,
  isAuthenticated,
}: {
  tier: PricingTier;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isFeatured = !!tier.badge;

  const handleClick = async () => {
    // Free plan
    if (!tier.productId) {
      router.push(isAuthenticated ? "/dashboard" : "/auth/sign-up");
      return;
    }

    // Paid plan — not logged in
    if (!isAuthenticated) {
      router.push("/auth/sign-in");
      return;
    }

    // Paid plan — logged in → Polar checkout
    try {
      setIsLoading(true);
      await authClient.checkout({ products: [tier.productId] });
    } catch (err) {
      console.error("Checkout failed:", err);
      toast.error("Couldn't open checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article
      className={cn(
        "relative flex flex-col rounded-2xl border p-6 transition-all duration-300",
        isFeatured
          ? "bg-card ring-primary/20 dark:ring-primary/15 shadow-lg ring-1"
          : "bg-card hover:shadow-md",
      )}
    >
      {/* Featured glow */}
      {isFeatured && (
        <div
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, #415f91, transparent 60%)",
          }}
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.06] dark:opacity-[0.04]"
        />
      )}

      {/* Badge */}
      {tier.badge && (
        <div className="mb-4 w-fit">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
              tier.badgeStyle === "primary"
                ? "bg-primary/10 text-primary ring-primary/20 ring-1"
                : "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/20",
            )}
          >
            <Sparkles className="size-2.5" aria-hidden />
            {tier.badge}
          </span>
        </div>
      )}

      {/* Name & price */}
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h3 className="font-heading text-lg font-bold">{tier.name}</h3>
      </div>

      <div className="mb-1">
        <span className="font-heading text-3xl font-bold">{tier.price}</span>
      </div>

      <p className="text-muted-foreground mb-3 text-xs">{tier.priceNote}</p>

      {/* Description */}
      <p className="text-muted-foreground border-border mb-6 border-b pb-6 text-xs leading-relaxed">
        {tier.description}
      </p>

      {/* Features */}
      <ul className="mb-8 flex flex-col gap-2.5" role="list">
        {tier.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5 text-xs">
            <Check
              className="mt-0.5 size-3.5 shrink-0 text-emerald-500"
              aria-hidden
            />
            <span className="text-foreground/80 leading-snug">{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        variant={isFeatured ? "default" : "outline"}
        onClick={() => void handleClick()}
        disabled={isLoading}
        aria-label={tier.ctaLabel}
        className="mt-auto w-full"
      >
        {isLoading ? (
          <>
            <Loader2 aria-hidden className="size-4 animate-spin" />
            Redirecting...
          </>
        ) : (
          tier.ctaLabel
        )}
      </Button>
    </article>
  );
}

interface PricingProps {
  isAuthenticated: boolean;
}

const Pricing = ({ isAuthenticated }: PricingProps) => (
  <section id="pricing" className="relative py-20 sm:py-28">
    {/* Separator */}
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-50"
      style={{
        background:
          "linear-gradient(90deg, transparent, var(--color-border, #c4c6d0), transparent)",
      }}
      aria-hidden
    />

    {/* Bottom ambient glow */}
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute -bottom-24 left-1/2 h-80 w-96 -translate-x-1/2 rounded-full opacity-[0.10] blur-[72px] dark:opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, #415f91, transparent 70%)",
        }}
      />
    </div>

    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Section header */}
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          Transparent Pricing
        </p>

        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Pay for What You Generate
        </h2>

        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          No subscriptions. No hidden fees. Buy a credit pack once and use it
          whenever you need it. Credits never expire.
        </p>
      </div>

      {/* Credit cost breakdown */}
      <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
        {[
          {
            label: "Avatar Video",
            cost: GENERATION_COSTS["avatar-video"],
            color:
              "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
            dot: "bg-primary",
          },
          {
            label: "Voiceover",
            cost: GENERATION_COSTS.voiceover,
            color:
              "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
            dot: "bg-emerald-500",
          },
        ].map(({ label, cost, color, dot }) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium",
              color,
            )}
          >
            <span aria-hidden className={cn("size-1.5 rounded-full", dot)} />

            <span>
              {label} — <strong>{cost} credits</strong> per generation
            </span>
          </div>
        ))}
      </div>

      {/* Portfolio note */}
      <div className="bg-muted/40 border-border mb-10 flex items-start gap-3 rounded-xl border px-4 py-3">
        <Info
          className="text-muted-foreground mt-0.5 size-3.5 shrink-0"
          aria-hidden
        />

        <p className="text-muted-foreground text-xs leading-relaxed">
          <strong className="text-foreground">Portfolio Demo:</strong> Rate
          limits (1 avatar/week, 2 voiceovers/day) apply to manage GPU costs.
        </p>
      </div>

      {/* Pricing cards grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {HOME_PRICING_TIERS.map((tier) => (
          <PricingCard
            key={tier.name}
            tier={tier}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>

      {/* Billing footnote */}
      <p className="text-muted-foreground/70 mt-8 text-center text-xs">
        Payments are processed securely by{" "}
        <a
          href="https://polar.sh"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground underline-offset-2 hover:underline"
        >
          Polar
        </a>
        . Credits are added to your account immediately after payment.
      </p>
    </div>
  </section>
);

export default Pricing;
