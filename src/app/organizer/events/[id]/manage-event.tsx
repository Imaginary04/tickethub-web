"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { formatCategory, formatPrice, formatShowTime, formatTime } from "@/lib/format";
import {
  cancelEvent,
  deleteShow,
  getMyEvent,
  listMyVenues,
  publishEvent,
  type OrganizerEventDetails,
  type VenueSummary,
} from "@/lib/organizer";

import { StatusBadge } from "../../status-badge";

import { AddShowForm } from "./add-show-form";

export function ManageEvent() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<OrganizerEventDetails | null>(null);
  const [venues, setVenues] = useState<VenueSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // First load: the event and the organizer's venues (for the "Add a show" picker), in parallel
  useEffect(() => {
    let active = true;
    Promise.all([getMyEvent(id), listMyVenues()])
      .then(([details, myVenues]) => {
        if (!active) return;
        setEvent(details);
        setVenues(myVenues);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err instanceof ApiError && err.status === 404 ? "Event not found." : "Couldn't load this event.");
      });
    return () => {
      active = false;
    };
  }, [id]);

  // After every change, fetch the event again so the page shows what the backend now has
  async function reload() {
    setEvent(await getMyEvent(id));
  }

  // Runs one action (publish, cancel, delete show), then reloads so the page shows the new state.
  // The backend's rules come back as 409 messages, e.g. "Add at least one upcoming show before publishing".
  async function run(action: () => Promise<unknown>, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    setActionError(null);
    try {
      await action();
      await reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loadError) {
    return (
      <div className="grid justify-items-start gap-3">
        <p className="text-destructive">{loadError}</p>
        <Button variant="outline" render={<Link href="/organizer" />} nativeButton={false}>
          Back to dashboard
        </Button>
      </div>
    );
  }
  if (!event || !venues) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  const cancelled = event.status === "CANCELLED";

  return (
    <>
      <Link href="/organizer" className="w-fit text-sm text-muted-foreground hover:text-foreground">
        ← Dashboard
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          <StatusBadge status={event.status} />
          <h1 className="text-2xl font-semibold">{event.title}</h1>
          <p className="text-sm text-muted-foreground">{formatCategory(event.category)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {event.status === "PUBLISHED" && (
            <Button variant="outline" render={<Link href={`/events/${event.id}`} />} nativeButton={false}>
              View public page
            </Button>
          )}
          {event.status === "DRAFT" && (
            <Button disabled={busy} onClick={() => run(() => publishEvent(event.id))}>
              Publish
            </Button>
          )}
          {!cancelled && (
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => run(() => cancelEvent(event.id), "Cancel this event? This can't be undone.")}
            >
              Cancel event
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {actionError}
        </p>
      )}
      {cancelled && (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm">
          This event is cancelled. It&apos;s hidden from the public and can&apos;t be changed.
        </p>
      )}

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Shows</h2>
        {event.shows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No shows yet. Add one below, then publish.</p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {event.shows.map((show) => (
              <li key={show.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid gap-1">
                  <p className="font-medium">
                    {formatShowTime(show.startTime)} – {formatTime(show.endTime)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {show.venueName}, {show.city}
                  </p>
                  <p className="text-sm">
                    {show.prices.map((p) => `${formatCategory(p.category)} ${formatPrice(p.price)}`).join(" · ")}
                  </p>
                </div>
                {!cancelled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => run(() => deleteShow(event.id, show.id), "Delete this show?")}
                  >
                    Delete
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!cancelled && <AddShowForm eventId={event.id} venues={venues} onAdded={reload} />}
    </>
  );
}
