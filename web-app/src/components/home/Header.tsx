"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  UserPlus2,
} from "lucide-react";
import { cn } from "~/lib/utils";
import Logo from "~/components/Logo";
import ThemeToggle from "~/components/theme/ThemeToggle";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { HOME_HEADER_NAV_LINKS } from "~/lib/constants";
import { authClient } from "~/server/better-auth/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface HeaderProps {
  isAuthenticated: boolean;
}

export default function Header({ isAuthenticated }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const router = useRouter();

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await authClient.signOut();
      router.refresh();
      toast.success("Signed out successfully.");
    } catch {
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/80 border-border/60 border-b shadow-sm backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Logo ─────────────────────────────────────────── */}
        <Link
          href="/"
          aria-label="Glent home"
          className="group focus-visible:ring-primary focus-visible:ring-offset-background flex w-fit items-center rounded-md transition-all duration-300 ease-out hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]"
        >
          <Logo
            size={30}
            className="text-primary transition-transform duration-300 group-hover:-translate-y-px"
          />
        </Link>

        {/* ── Desktop Nav ──────────────────────────────────── */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 md:flex"
        >
          {HOME_HEADER_NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-primary focus-visible:ring-offset-background rounded-sm text-sm font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* ── Desktop Actions ──────────────────────────────── */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <Button variant="outline" size="lg" onClick={handleSignOut}>
                {isSigningOut ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>Sign out</>
                )}
              </Button>

              <Button size="lg" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>

              <Button size="lg" asChild>
                <Link href="/auth/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </div>

        {/* ── Mobile nav toggle & actions ──────────────────── */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>

            {/* Mobile nav drawer */}
            <SheetContent side="right" className="flex w-72 flex-col gap-6 p-6">
              <SheetHeader className="text-left">
                <SheetTitle>
                  <Logo size={28} className="text-primary" />
                </SheetTitle>

                <SheetDescription className="sr-only">
                  Mobile navigation menu
                </SheetDescription>
              </SheetHeader>

              <nav
                aria-label="Mobile navigation"
                className="mt-4 flex flex-col gap-2"
              >
                {HOME_HEADER_NAV_LINKS.map(({ label, href }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className="text-foreground hover:bg-secondary/50 focus-visible:bg-secondary/50 focus-visible:ring-primary flex h-10 items-center rounded-full px-4 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98]"
                  >
                    {label}
                  </a>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-3 pb-6">
                {isAuthenticated ? (
                  <>
                    <Button
                      size="lg"
                      onClick={() => setIsOpen(false)}
                      className="w-full"
                      asChild
                    >
                      <Link href="/dashboard">
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        void handleSignOut();
                        setIsOpen(false);
                      }}
                      className="w-full"
                    >
                      {isSigningOut ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Signing out...
                        </>
                      ) : (
                        <>
                          <LogOut className="size-4" />
                          Sign out
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      asChild
                      className="w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/auth/sign-up">
                        <UserPlus2 className="size-4" />
                        Get started
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      asChild
                      className="w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/auth/sign-in">
                        <LogIn className="size-4" />
                        Sign in
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
