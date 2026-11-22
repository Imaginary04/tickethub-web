import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getSeatMap } from "@/lib/events";
import { formatShowTime, formatTime } from "@/lib/format";

import { SeatPicker } from "./seat-picker";

type Params = PageProps<"/shows/[showId]">["params"];

export async function generateMetadata({ params }: PageProps<"/shows/[showId]">): Promise<Metadata> {
  const { showId } = await params;
  try {
    const map = await getSeatMap(showId);
    return { title: map ? `Select seats: ${map.eventTitle} | TicketHub` : "Show not available | TicketHub" };
  } catch {
    return { title: "TicketHub" };
  }
}

export default function ShowSeatsPage({ params }: PageProps<"/shows/[showId]">) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <Suspense fallback={<SeatsSkeleton />}>
        <ShowSeats params={params} />
      </Suspense>
    </main>
  );
}

// The first seat map comes from the server (fast first paint); the picker refreshes it in the browser
async function ShowSeats({ params }: { params: Params }) {
  const { showId } = await params;
  const map = await getSeatMap(showId); // a failure here is caught by error.tsx
  if (!map) {
    notFound();
  }

  return (
    <>
      <Link href={`/events/${map.eventId}`} className="w-fit text-sm text-muted-foreground hover:text-foreground">
        ← {map.eventTitle}
      </Link>
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold">{map.eventTitle}</h1>
        <p className="text-muted-foreground">
          <time dateTime={map.startTime}>{formatShowTime(map.startTime)}</time>
          {" – "}
          <time dateTime={map.endTime}>{formatTime(map.endTime)}</time>
          {" · "}
          {map.venueName}, {map.city}
        </p>
      </div>
      <SeatPicker initialMap={map} />
    </>
  );
}

function SeatsSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Loading seats">
      <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
      <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
      <div className="h-80 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}