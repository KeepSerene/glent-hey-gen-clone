import "~/styles/globals.css";
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import ThemeProvider from "~/components/theme/ThemeProvider";
import { Providers } from "~/components/auth/providers";
import { env } from "~/env";

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

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={geist.variable}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="selection:bg-primary antialiased selection:text-white">
        <ThemeProvider
          attribute="class"
          enableSystem
          enableColorScheme
          defaultTheme="system"
        >
          <Providers>
            <TooltipProvider>{children}</TooltipProvider>
          </Providers>

          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
