import type { Metadata } from "next";
import { viewPaths } from "@better-auth-ui/react/core";
import { notFound } from "next/navigation";
import { Settings } from "~/components/settings/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    path: string;
  }>;
}): Promise<Metadata> {
  const { path } = await params;

  if (!Object.values(viewPaths.settings).includes(path)) {
    return { title: "Not Found" };
  }

  const formattedTitle = path.charAt(0).toUpperCase() + path.slice(1);

  return {
    title: `${formattedTitle} Settings`,
  };
}

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
