import type { Metadata } from "next";
import { viewPaths } from "@better-auth-ui/react/core";
import { notFound } from "next/navigation";
import { Settings } from "~/components/settings/settings";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage({
  params,
}: {
  params: Promise<{
    path: string;
  }>;
}) {
  const { path } = await params;

  if (!Object.values(viewPaths.settings).includes(path)) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <Settings path={path} />
    </main>
  );
}
