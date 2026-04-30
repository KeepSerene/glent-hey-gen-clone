import { cn } from "~/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// ICON — LOGO MARK
// ─────────────────────────────────────────────────────────────────────────────
export const GlentIcon = ({ size = 32 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    aria-label="Glent logo mark"
  >
    {/* Left Side: Human Silhouette */}
    <path
      d="M 31 10 C 19 10, 13 18, 13 28 C 13 34, 17 38, 21 42 C 11 46, 3 54, 3 64 L 31 64 Z"
      fill="currentColor"
    />

    {/* Right Side: Audio Equalizer Bars */}
    <rect x="35" y="12" width="6" height="52" rx="2" fill="currentColor" />
    <rect x="44" y="24" width="6" height="40" rx="2" fill="currentColor" />
    <rect x="53" y="38" width="6" height="26" rx="2" fill="currentColor" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// LOGO — ICON + WORDMARK
// ─────────────────────────────────────────────────────────────────────────────
interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = 32, showText = true, className = "" }: LogoProps) => (
  <div
    style={{
      gap: `${Math.round(size * 0.28)}px`,
    }}
    className={cn("flex items-center", className)}
    suppressHydrationWarning
  >
    <GlentIcon size={size} />
    {showText && (
      <span
        style={{
          fontFamily:
            "var(--font-sans), 'Geist', ui-sans-serif, system-ui, sans-serif",
          fontSize: `${size * 0.72}px`,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        Glent
      </span>
    )}
  </div>
);

export default Logo;
