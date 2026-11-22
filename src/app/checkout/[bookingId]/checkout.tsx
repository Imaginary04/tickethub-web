"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { type Booking, getBooking, releaseHold } from "@/lib/bookings";
import { formatCategory, formatPrice, formatShowTime } from "@/lib/format";

import { Countdown } from "./countdown";

type LoadState = { kind: "loading" } | { kind: "ready"; booking: Booking } | { kind: "not-found" } | { kind: "failed" };

export function Checkout() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { status } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [now, setNow] = useState(() => Date.now());
  const [releasing, setReleasing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0); // bumping it re-runs the load effect ("Try again")

  // Logged out: log in first, then come straight back here
  useEffect(() => {
    if (status === "anonymous") {
      router.replace(`/login?next=/checkout/${bookingId}`);
    }
  }, [status, bookingId, router]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }
    let cancelled = false;
    getBooking(bookingId)
      .then((booking) => {
        if (!cancelled) setState({ kind: "ready", booking });
      })
      .catch((err) => {
        if (cancelled) return;
        // 404 = no such booking or not yours; 400 = the id isn't a number
        const missing = err instanceof ApiError && (err.status === 404 || err.status === 400);
        setState({ kind: missing ? "not-found" : "failed" });
      });
    return () => {
      cancelled = true;
    };
  }, [status, bookingId, attempt]);

  // One clock for the whole page, ticking every second
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (state.kind === "not-found") {
    return (
      <Notice title="Booking not found" text="The link may be wrong, or this booking belongs to another account.">
        <Button render={<Link href="/events" />} nativeButton={false}>
          Browse events
        </Button>
      </Notice>
    );
  }
  if (state.kind === "failed") {
    return (
      <Notice title="Couldn't load your booking" text="Something went wrong on our side. Please try again.">
        <Button onClick={() => setAttempt((n) => n + 1)}>Try again</Button>
      </Notice>
    );
  }
  if (state.kind === "loading") {
    return <div className="h-72 animate-pulse rounded-xl bg-muted" aria-busy="true" aria-label="Loading your booking" />;
  }

  const { booking } = state;
  const remainingMs = booking.holdExpiresAt ? Math.max(0, Date.parse(booking.holdExpiresAt) - now) : 0;
  // Derived from the clock: the page flips to "time's up" at 0:00 even before the expiry job runs
  const onHold = booking.status === "PENDING" && remainingMs > 0;

  async function changeSeats() {
    if (!window.confirm("Give these seats back and pick again?")) {
      return;
    }
    setReleasing(true);
    setMessage(null);
    try {
      await releaseHold(booking.bookingId);
    } catch (err) {
      // 409 = the hold had already ended: the seats are free anyway, so carry on
      if (!(err instanceof ApiError && err.status === 409)) {
        setReleasing(false);
        setMessage(err instanceof ApiError ? err.message : "Could not reach the server. Please try again.");
        return;
      }
    }
    router.push(`/shows/${booking.showId}`);
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="text-muted-foreground">
          {booking.eventTitle} · <time dateTime={booking.startTime}>{formatShowTime(booking.startTime)}</time> ·{" "}
          {booking.venueName}, {booking.city}
        </p>
      </div>

      {onHold ? (
        <Countdown remainingMs={remainingMs} />
      ) : (
        <EndedNotice status={booking.status} showId={booking.showId} />
      )}

      <section className="rounded-xl border">
        <ul className="divide-y">
          {booking.seats.map((seat) => (
            <li key={seat.seatId} className="flex justify-between px-4 py-3 text-sm">
              <span>
                Row {seat.row}, seat {seat.number}{" "}
                <span className="text-muted-foreground">· {formatCategory(seat.category)}</span>
              </span>
              <span>{formatPrice(seat.price)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t px-4 py-3 font-semibold">
          <span>Total</span>
          <span>{formatPrice(booking.totalAmount)}</span>
        </div>
      </section>

      {message && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {message}
        </p>
      )}

      {onHold && (
        <div className="grid gap-2 sm:flex sm:flex-row-reverse sm:justify-start">
          {/* Payment is the next step of the project; the button is a placeholder until then */}
          <Button disabled title="Payments are coming soon">
            Pay {formatPrice(booking.totalAmount)}
          </Button>
          <Button variant="outline" onClick={changeSeats} disabled={releasing}>
            {releasing ? "Releasing..." : "Change seats"}
          </Button>
        </div>
      )}
    </div>
  );
}

function EndedNotice({ status, showId }: { status: Booking["status"]; showId: number }) {
  const text =
    status === "CANCELLED"
      ? "You gave these seats back."
      : status === "CONFIRMED"
        ? "This booking is confirmed."
        : "Time's up: your seats were released so others can book them.";
  return (
    <div className="grid justify-items-start gap-3 rounded-lg border bg-muted/50 px-4 py-3">
      <p className="text-sm">{text}</p>
      {status !== "CONFIRMED" && (
        <Button render={<Link href={`/shows/${showId}`} />} nativeButton={false} size="sm">
          Pick seats again
        </Button>
      )}
    </div>
  );
}

function Notice({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="grid justify-items-start gap-3 py-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">{text}</p>
      {children}
    </div>
  );
}