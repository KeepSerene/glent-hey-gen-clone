import type { Metadata } from "next";
import BillingRedirect from "~/components/BillingRedirect";

export const metadata: Metadata = {
  title: "Redirecting to Billing",
};

const BillingPage = () => (
  <main className="flex h-full flex-col items-center justify-center overflow-y-auto p-4">
    <BillingRedirect />
  </main>
);

export default BillingPage;
