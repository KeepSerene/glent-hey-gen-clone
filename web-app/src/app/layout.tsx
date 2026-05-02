import "~/styles/globals.css";
import { type Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import ThemeProvider from "~/components/theme/ThemeProvider";
import { Providers } from "~/components/auth/providers";
import { env } from "~/env";
import { cn } from "~/lib/utils";
import { CheckCircle, Info, Loader2, TriangleAlert, X } from "lucide-react";

const APP_URL = env.NEXT_PUBLIC_APP_URL;
const APP_TITLE = "Glent";
const APP_DESCRIPTION = "A HeyGen clone";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    template: "%s | Glent",
    default: APP_TITLE,
  },
  description: APP_DESCRIPTION,
  keywords: [],
  authors: [
    {
      name: "Dhrubajyoti Bhattacharjee",
      url: "https://math-to-dev.vercel.app",
    },
  ],
  creator: "Dhrubajyoti Bhattacharjee",
  publisher: "Glent",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    siteName: "Glent",
    images: [
      {
        url: "/images/hero-banner-dark.webp",
        width: 1200,
        height: 630,
        alt: "",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    creator: "@UsualLearner",
    site: "@glent",
    images: ["/images/hero-banner-dark.webp"],
  },
  icons: [{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }],
  alternates: {
    canonical: APP_URL,
  },
};

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(fraunces.variable, dmSans.variable)}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="selection:bg-primary selection:text-primary-foreground antialiased">
        <ThemeProvider
          attribute="class"
          enableSystem
          enableColorScheme
          defaultTheme="system"
        >
          <Providers>
            <TooltipProvider>{children}</TooltipProvider>
          </Providers>

          <Toaster
            position="top-right"
            icons={{
              success: <CheckCircle size={16} />,
              error: <X size={16} />,
              info: <Info size={16} />,
              warning: <TriangleAlert size={16} />,
              loading: <Loader2 size={16} />,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
