"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

export default function AppBreadcrumbs() {
  const pathname = usePathname();
  // Split pathname into segments and remove empty strings (like the first slash at the home route)
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  // Helper to turn "my-project-name" into "My Project Name"
  const formatTitle = (segment: string) => {
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const focusClasses =
    "rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Always start with Home */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className={focusClasses}>
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const isLast = index === pathSegments.length - 1;
          const title = formatTitle(segment);

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator />

              <BreadcrumbItem>
                {isLast ? (
                  // The current page is not clickable
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                ) : (
                  // Intermediate pages are clickable links
                  <BreadcrumbLink asChild>
                    <Link href={href} className={focusClasses}>
                      {title}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
