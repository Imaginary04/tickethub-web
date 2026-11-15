"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatCategory } from "@/lib/format";
import { listMyEvents, listMyVenues, type OrganizerEvent, type VenueSummary } from "@/lib/organizer";

const STATUS_STYLES: Record<OrganizerEvent["status"], string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export function Dashboard() {
  const [events, setEvents] = useState<OrganizerEvent[] | null>(null);
  const [venues, setVenues] = useState<VenueSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    // Both lists load at the same time, not one after the other
    Promise.all([listMyEvents(), listMyVenues()])
      .then(([myEvents, myVenues]) => {
        if (!active) return;
        setEvents(myEvents);
        setVenues(myVenues);
      })
      .catch(() => {
        if (active) setError("Couldn't load your dashboard. Please try again.");
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }
  if (!events || !venues) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">Organizer dashboard</h1>

      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My events</h2>
          <Button size="sm" render={<Link href="/organizer/events/new" />} nativeButton={false}>
            New event
          </Button>
        </div>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events yet. Create your first one.</p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {events.map((event) => (
              <li key={event.id} className="flex items-center justify-between gap-3 p-4">
                <div className="grid gap-0.5">
                  <span className="font-medium">{event.title}</span>
                  <span className="text-sm text-muted-foreground">{formatCategory(event.category)}</span>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[event.status]}`}>
                  {formatCategory(event.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My venues</h2>
          <Button size="sm" variant="outline" render={<Link href="/organizer/venues/new" />} nativeButton={false}>
            New venue
          </Button>
        </div>
        {venues.length === 0 ? (
          <p className="text-sm text-muted-foreground">No venues yet. Add one before creating shows.</p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {venues.map((venue) => (
              <li key={venue.id} className="flex items-center justify-between gap-3 p-4">
                <div className="grid gap-0.5">
                  <span className="font-medium">{venue.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {venue.city} · {venue.address}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{venue.totalSeats} seats</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}