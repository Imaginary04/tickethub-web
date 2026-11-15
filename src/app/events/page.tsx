import type { Metadata } from "next";
import { Suspense } from "react";

import { searchEvents, toQueryString, type EventCard as EventCardData, type EventFilters as Filters, type PageResponse } from "@/lib/events";

import { EventCard } from "./event-card";
import { EventFilters } from "./event-filters";
import { Pagination } from "./pagination";

export const metadata: Metadata = {
  title: "Events | TicketHub",
  description: "Find concerts, comedy, theatre and more near you.",
};

type SearchParams = PageProps<"/events">["searchParams"];

// The heading is static and prerendered; everything that depends on the URL streams in inside <Suspense>
export default function EventsPage({ searchParams }: PageProps<"/events">) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Upcoming events</h1>
        <p className="text-sm text-muted-foreground">Concerts, comedy, theatre and more.</p>
      </div>
      <Suspense fallback={<ResultsSkeleton />}>
        <EventResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

// ?city=a&city=b gives an array; we only use the first value
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function EventResults({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters: Filters = {
    q: first(params.q),
    city: first(params.city),
    date: first(params.date),
    category: first(params.category),
  };
  const page = Math.max(0, Number(first(params.page)) || 0);

  let result: PageResponse<EventCardData> | null = null;
  try {
    result = await searchEvents({ ...filters, page: String(page) });
  } catch {
    // Backend down or bad filter: show a message instead of crashing the page
  }

  return (
    <>
      {/* key: a new search remounts the form, so the inputs show the new URL's values */}
      <EventFilters key={toQueryString(filters)} filters={filters} />

      {result === null ? (
        <p className="text-sm text-destructive">Couldn&apos;t load events. Please try again.</p>
      ) : result.content.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No events match your search.</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {result.totalElements} {result.totalElements === 1 ? "event" : "events"}
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.content.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
          <Pagination filters={filters} page={result.page} totalPages={result.totalPages} />
        </>
      )}
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading events">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}