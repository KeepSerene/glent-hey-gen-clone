"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import Link from "next/link";
import Logo from "./Logo";
import { APP_SIDEBAR_MENU_ITEMS } from "~/lib/constants";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "~/lib/utils";
import { Separator } from "./ui/separator";
import { UserView } from "./settings/user-view";

function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <Link
          href="/"
          replace
          aria-label="Back to home"
          className="group focus-visible:outline-ring flex w-fit items-center rounded-md transition-all duration-300 ease-out hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 active:scale-[0.98]"
          suppressHydrationWarning
        >
          <Logo className="text-primary transition-transform duration-300 group-hover:-translate-y-px" />
        </Link>
      </SidebarHeader>

      <Separator className="opacity-70" />

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarMenu className="gap-0.5">
            {APP_SIDEBAR_MENU_ITEMS.map(({ title, href, icon: Icon }) => {
              const baseSection = `/${href.split("/")[1]}`;
              const isActive = pathname.startsWith(baseSection);

              return (
                <SidebarMenuItem key={title}>
                  <SidebarMenuButton
                    type="button"
                    isActive={isActive}
                    onClick={() => router.push(href)}
                    className={cn(
                      "group relative h-9 rounded-lg px-3 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="bg-primary absolute top-1/2 left-0 h-4 w-1 -translate-y-1/2 rounded-lg" />
                    )}

                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors duration-150",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />

                    <span>{title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup />
      </SidebarContent>

      <Separator className="opacity-70" />

      <SidebarFooter>
        {/* Credits */}
        {/* Upgrade */}

        <UserView />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
