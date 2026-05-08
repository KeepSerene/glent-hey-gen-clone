import type { Metadata } from "next";
import DashboardClient from "~/components/dashboard/DashboardClient";
import { getRecentGenerations } from "~/server/actions/history";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function DashboardPage() {
  // Silently swallow errors — the dashboard is fully functional without recent items!
  const recentItems = await getRecentGenerations(4).catch(() => []);

  return <DashboardClient recentItems={recentItems} />;
}

export default DashboardPage;
