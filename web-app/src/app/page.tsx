import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Welcome",
};

function LandingPage() {
  return (
    <main className="flex flex-col gap-2 p-4">
      <p>LandingPage</p>
      <Link href="/dashboard">Dashboard</Link>
    </main>
  );
}

export default LandingPage;
