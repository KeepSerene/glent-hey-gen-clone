import { redirect } from "next/navigation";
import AppHeader from "~/components/AppHeader";
import AppSidebar from "~/components/AppSidebar";
import { SidebarProvider } from "~/components/ui/sidebar";
import { getSession } from "~/server/better-auth/server";

async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  if (!session?.user) {
    return redirect("/auth/sign-in");
  }

  return (
    <SidebarProvider defaultOpen={false} className="h-dvh overflow-hidden">
      <AppSidebar />

      <div className="flex grow flex-col overflow-hidden">
        <AppHeader />

        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </SidebarProvider>
  );
}

export default ProtectedLayout;
