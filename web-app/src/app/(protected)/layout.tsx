import { redirect } from "next/navigation";
import AppHeader from "~/components/app-header/AppHeader";
import AppSidebar from "~/components/AppSidebar";
import CheckoutSuccessModal from "~/components/modals/CheckoutSuccessModal";
import { SidebarProvider } from "~/components/ui/sidebar";
import { getSession } from "~/server/better-auth/server";

async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  if (!session?.user) {
    return redirect("/auth/sign-in");
  }

  const currentYear = new Date().getFullYear();

  return (
    <SidebarProvider defaultOpen={false} className="h-dvh overflow-hidden">
      <AppSidebar />

      <div className="flex grow flex-col overflow-hidden">
        <AppHeader />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}

          <footer className="border-border/50 bg-background mt-auto flex shrink-0 items-center justify-center border-t py-4">
            <p className="text-muted-foreground/60 text-xs font-medium tracking-wide">
              &copy; {currentYear} Glent. All rights reserved.
            </p>
          </footer>
        </div>
      </div>

      <CheckoutSuccessModal />
    </SidebarProvider>
  );
}

export default ProtectedLayout;
