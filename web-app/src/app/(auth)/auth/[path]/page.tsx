import type { Metadata } from "next";
import { viewPaths } from "@better-auth-ui/react/core";
import { notFound } from "next/navigation";
import { Auth } from "~/components/auth/auth";

type AuthPageProps = {
  params: Promise<{
    path: string;
  }>;
};

export async function generateMetadata({
  params,
}: AuthPageProps): Promise<Metadata> {
  const { path } = await params;

  if (!Object.values(viewPaths.auth).includes(path)) {
    return { title: "Not Found" };
  }

  const title = path
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return { title };
}

export default async function AuthPage({ params }: AuthPageProps) {
  const { path } = await params;

  if (!Object.values(viewPaths.auth).includes(path)) {
    notFound();
  }

  return (
    <main className="w-full">
      <Auth path={path} className="mx-auto" />
    </main>
  );
}
