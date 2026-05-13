import Link from "next/link";
import Logo from "~/components/Logo";
import { HOME_FOOTER_SOCIALS } from "~/lib/constants";
import { cn } from "~/lib/utils";
import { HOME_FOOTER_NAV_GROUPS } from "../../lib/constants";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border bg-card/50 relative overflow-hidden border-t">
      {/* Top separator glow */}
      <div
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, #415f91 30%, #10b981 70%, transparent 100%)",
        }}
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-30"
      />

      {/* Bottom center accent blob */}
      <div
        aria-hidden
        className="bg-accent pointer-events-none absolute -bottom-32 left-1/2 h-80 w-full max-w-3xl -translate-x-1/2 rounded-full opacity-45 blur-[80px] dark:opacity-35"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Main footer row */}
        <div className="grid grid-cols-2 gap-10 py-12 sm:grid-cols-4 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-2">
            <Link
              href="/"
              aria-label="Glent home"
              className="group focus-visible:outline-ring flex w-fit items-center rounded-md transition-all duration-300 ease-out hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 active:scale-[0.98]"
            >
              <Logo
                size={24}
                className="text-primary transition-transform duration-300 group-hover:-translate-y-px"
              />
            </Link>

            <p className="text-muted-foreground mt-3 max-w-xs text-xs">
              Where still portraits find their natural voice.
            </p>

            {/* Social icons */}
            <div className="mt-5 flex items-center gap-1">
              {HOME_FOOTER_SOCIALS.map(({ label, href, icon: Icon }) => (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={cn(
                        "text-muted-foreground hover:text-foreground rounded-full p-2 transition-colors duration-200",
                        "focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none",
                      )}
                    >
                      <Icon aria-hidden className="size-4" />
                    </a>
                  </TooltipTrigger>

                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Nav groups */}
          {HOME_FOOTER_NAV_GROUPS.map(({ heading, links }) => (
            <div key={heading} className="flex flex-col gap-1">
              <h4 className="text-foreground text-xs font-semibold tracking-wider uppercase">
                {heading}
              </h4>

              <ul className="flex flex-col" role="list">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    {href.startsWith("#") ? (
                      <a
                        href={href}
                        className="text-muted-foreground hover:text-foreground focus-visible:ring-primary rounded text-xs underline underline-offset-1 transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-none"
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="text-muted-foreground hover:text-foreground focus-visible:ring-primary rounded text-xs underline underline-offset-1 transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-none"
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-border flex flex-col items-center justify-between gap-3 border-t py-6 sm:flex-row">
          <p className="text-muted-foreground/70 text-xs">
            &copy; {currentYear} Glent. Built with sleepless nights and a whole
            lot of hydration.
          </p>

          <p className="text-muted-foreground/70 text-xs">
            Developed by{" "}
            <a
              href="https://github.com/KeepSerene"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground focus-visible:ring-primary rounded underline underline-offset-2 transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-none"
            >
              @KeepSerene
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
