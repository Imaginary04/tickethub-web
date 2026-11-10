import type { Metadata } from "next";

import { AccountDetails } from "./account-details";

export const metadata: Metadata = {
  title: "Your account | TicketHub",
};

export default function AccountPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <AccountDetails />
    </main>
  );
}