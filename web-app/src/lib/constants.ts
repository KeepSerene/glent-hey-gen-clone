import { CreditCard, LayoutDashboard, Settings2 } from "lucide-react";

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,32}$/;
export const PROTECTED_ROUTES = ["/dashboard", "/billing", "/settings"];
export const AUTH_ROUTES = ["/auth"];
export const APP_SIDEBAR_MENU_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/settings/account",
    icon: Settings2,
  },
];
