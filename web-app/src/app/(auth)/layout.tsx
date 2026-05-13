import Link from "next/link";
import Logo from "~/components/Logo";
import { Badge } from "~/components/ui/badge";
import ThemeToggle from "~/components/theme/ThemeToggle";
import { Sparkles } from "lucide-react";

const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <main className="bg-background flex min-h-dvh w-full">
    {/* ── Visual / branding ────────────── */}
    <section className="bg-muted/30 border-border relative hidden w-0 flex-1 flex-col overflow-hidden border-r lg:flex lg:w-1/2 xl:w-7/12">
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Primary glow */}
        <div
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-primary), transparent 70%)",
          }}
          className="absolute -top-32 -left-32 size-120 rounded-full opacity-30 blur-[80px] dark:opacity-[0.28]"
        />

        {/* Emerald/accent glow */}
        <div
          style={{
            backgroundImage:
              "radial-gradient(circle, #10b981, transparent 70%)",
          }}
          className="absolute -right-32 -bottom-32 size-120 rounded-full opacity-[0.22] blur-[80px] dark:opacity-[0.18]"
        />
      </div>

      {/* Dot grid pattern */}
      <div
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(var(--color-border) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        className="absolute inset-0 opacity-65 mix-blend-multiply dark:opacity-55 dark:mix-blend-screen"
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between gap-4 p-10 xl:p-14">
        <Link
          href="/"
          aria-label="Glent home"
          className="group focus-visible:ring-primary focus-visible:ring-offset-background flex w-fit items-center rounded-md transition-all duration-300 ease-out hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]"
        >
          <Logo
            size={36}
            className="text-primary transition-transform duration-300 group-hover:-translate-y-px"
          />
        </Link>

        {/* Bottom: hero copy & badge */}
        <div className="flex max-w-lg grow flex-col justify-center gap-5">
          <Badge
            variant="outline"
            className="border-primary text-primary dark:bg-primary/10 bg-primary/5 rounded-full text-xs font-semibold tracking-wide select-none"
          >
            <Sparkles className="size-3" />
            Portrait & Voice Studio
          </Badge>

          <h1 className="font-heading text-foreground text-4xl leading-[1.15] font-bold tracking-tight xl:text-5xl">
            Animate portraits. <br />
            <span
              style={{
                backgroundImage:
                  "linear-gradient(125deg, var(--color-primary) 0%, #10b981 100%)",
              }}
              className="bg-clip-text text-transparent"
            >
              Clone voices.
            </span>
          </h1>

          <p className="text-muted-foreground text-base xl:text-lg">
            Step inside. Ready when you are.
          </p>
        </div>

        {/* Footer */}
        <footer className="text-muted-foreground/80 text-xs font-medium">
          &copy; {new Date().getFullYear()} Glent. All rights reserved.
        </footer>
      </div>
    </section>

    {/* ── Right column: Auth components ────────────────────────────────── */}
    <div className="relative flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:flex-none lg:px-20 xl:w-5/12 xl:px-24">
      {/* Topbar: mobile logo & theme toggle */}
      <div className="absolute top-4 right-4 left-4 flex items-center justify-between md:top-8 md:right-8 md:left-8 lg:justify-end">
        <div className="lg:hidden">
          <Link
            href="/"
            aria-label="Glent home"
            className="group focus-visible:ring-primary focus-visible:ring-offset-background flex w-fit items-center rounded-md transition-all duration-300 ease-out hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]"
          >
            <Logo
              size={28}
              className="text-primary transition-transform duration-300 group-hover:-translate-y-px"
            />
          </Link>
        </div>

        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Auth content */}
      <div className="mx-auto mt-12 w-full max-w-sm sm:max-w-md lg:mt-0 lg:max-w-sm xl:max-w-md">
        {children}
      </div>
    </div>
  </main>
);

export default AuthLayout;
