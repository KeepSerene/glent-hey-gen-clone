import type { Metadata } from "next";
import { getSession } from "~/server/better-auth/server";
import Features from "~/components/home/Features";
import Footer from "~/components/home/Footer";
import Header from "~/components/home/Header";
import Hero from "~/components/home/Hero";
import HowItWorks from "~/components/home/HowItWorks";
import Pricing from "~/components/home/Pricing";

export const metadata: Metadata = {
  title: "Glent — AI Avatar Video & Voice Studio",
  description:
    "Generate lip-synced avatar videos and ultra-realistic multilingual voiceovers with Glent's AI studio. Powered by Hallo3 and ChatterboxTTS.",
};

export default async function HomePage() {
  const session = await getSession();
  const isAuthenticated = !!session?.user;

  return (
    <div className="bg-background relative flex min-h-dvh flex-col">
      <Header isAuthenticated={isAuthenticated} />

      <main className="flex-1">
        <Hero isAuthenticated={isAuthenticated} />
        <HowItWorks />
        <Features />
        <Pricing isAuthenticated={isAuthenticated} />
      </main>

      <Footer />
    </div>
  );
}
