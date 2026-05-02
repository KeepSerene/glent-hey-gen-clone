import type { Metadata } from "next";
import DashboardClient from "~/components/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
};

function DashboardPage() {
  return <DashboardClient />;
}

export default DashboardPage;
