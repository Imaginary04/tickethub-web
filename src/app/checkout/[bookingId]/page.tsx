import type { Metadata } from "next";
import { Suspense } from "react";

import { Checkout } from "./checkout";

export const metadata: Metadata = {
  title: "Checkout | TicketHub",
};

// The booking belongs to one customer and needs their token, so it's loaded in the browser (see Checkout).
// Checkout reads the URL with useParams(): with cacheComponents that must sit inside <Suspense>,
// so the page shell can still be prerendered.
export default function CheckoutPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
      <Suspense fallback={<CheckoutSkeleton />}>
        <Checkout />
      </Suspense>
    </main>
  );
}

function CheckoutSkeleton() {
  return <div className="h-72 animate-pulse rounded-xl bg-muted" aria-busy="true" aria-label="Loading your booking" />;
}