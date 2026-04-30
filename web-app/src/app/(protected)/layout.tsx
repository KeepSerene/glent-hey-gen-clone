import { redirect } from "next/navigation";
import { getSession } from "~/server/better-auth/server";

async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  if (!session?.user) {
    return redirect("/auth/sign-in");
  }

  return <div>{children}</div>;
}

export default ProtectedLayout;
