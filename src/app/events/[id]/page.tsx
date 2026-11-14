import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getEvent, type PublicEvent } from "@/lib/events";
import { formatCategory } from "@/lib/format";

import { ShowList } from "./show-list";

type Params = PageProps<"/events/[id]">["params"];

// Each event gets its own browser title and search-engine description.
// getEvent is called here AND in the page, but Next.js de-duplicates the fetch: the backend sees one request.
export async function generateMetadata({ params }: PageProps<"/events/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    const event = await getEvent(id);
    if (!event) {
      return { title: "Event not found | TicketHub" };
    }
    return {
      title: `${event.title} | TicketHub`,
      description: event.description ?? `Book tickets for ${event.title} on TicketHub.`,
    };
  } catch {
    return { title: "TicketHub" }; // the page itself shows the error
  }
}

export default function EventPage({ params }: PageProps<"/events/[id]">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <Link href="/events" className="w-fit text-sm text-muted-foreground hover:text-foreground">
        ← All events
      </Link>
      <Suspense fallback={<DetailsSkeleton />}>
        <EventDetails params={params} />
      </Suspense>
    </main>
  );
}

async function EventDetails({ params }: { params: Params }) {
  const { id } = await params;
  const event = await getEvent(id); // a failure here is caught by error.tsx
  if (!event) {
    notFound(); // shows not-found.tsx
  }

  return (
    <>
      <EventJsonLd event={event} />
      <div className="grid gap-2">
        <span className="w-fit rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {formatCategory(event.category)}
        </span>
        <h1 className="text-3xl font-semibold">{event.title}</h1>
        {event.description && <p className="text-muted-foreground">{event.description}</p>}
      </div>
      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Upcoming shows</h2>
        <ShowList shows={event.shows} />
      </section>
    </>
  );
}

// Structured data: tells Google these are events (date, place, price) so it can show rich results
function EventJsonLd({ event }: { event: PublicEvent }) {
  const data = event.shows.map((show) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description ?? undefined,
    startDate: show.startTime,
    endDate: show.endTime,
    location: { "@type": "Place", name: show.venueName, address: show.city },
    offers: show.prices.map((p) => ({ "@type": "Offer", price: p.price, priceCurrency: "INR", name: p.category })),
  }));
  return (
    <script
      type="application/ld+json"
      // "<" escaped so a title like "</script>" can't break out of the tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

function DetailsSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Loading event">
      <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
      <div className="h-9 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-40 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}