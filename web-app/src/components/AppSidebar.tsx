"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "./ui/sidebar";
import Link from "next/link";
import Logo from "./Logo";

function AppSidebar() {
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

      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}

export default AppSidebar;
