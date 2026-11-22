"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import type { SeatCategory } from "@/lib/events";
import { formatCategory, formatPrice } from "@/lib/format";
import { fetchSeatMap, holdSeats, MAX_SEATS_PER_HOLD, type SeatMap } from "@/lib/seats";
import { cn } from "@/lib/utils";

import { CATEGORY_STYLES, SeatGrid, SELECTED_STYLE, TAKEN_STYLE } from "./seat-grid";

const REFRESH_EVERY_MS = 15_000;

export function SeatPicker({ initialMap }: { initialMap: SeatMap }) {
  const { status } = useAuth();
  const router = useRouter();
  const [map, setMap] = useState(initialMap);
  const [pickedIds, setPickedIds] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const showId = map.showId;

  // Seat id -> seat (with its row label), rebuilt only when a new map arrives
  const seatsById = useMemo(
    () => new Map(map.rows.flatMap((row) => row.seats.map((seat) => [seat.id, { ...seat, row: row.label }] as const))),
    [map],
  );
  const priceOf = (category: SeatCategory) => map.prices.find((p) => p.category === category)?.price;

  // Derived, not stored: if a refresh shows someone else took a picked seat, it simply drops out
  const selected = pickedIds.map((id) => seatsById.get(id)).filter((seat) => seat?.status === "AVAILABLE")
    .map((seat) => seat!);
  const lostCount = pickedIds.length - selected.length;
  const total = selected.reduce((sum, seat) => sum + (priceOf(seat.category) ?? 0), 0);

  // Keep the map fresh while the customer is choosing, so seats others take turn grey
  useEffect(() => {
    const timer = setInterval(() => {
      fetchSeatMap(showId).then(setMap).catch(() => {}); // keep the old map if a refresh fails
    }, REFRESH_EVERY_MS);
    return () => clearInterval(timer);
  }, [showId]);

  function toggle(seatId: number) {
    setMessage(null);
    const current = selected.map((seat) => seat.id); // also forgets seats that were taken meanwhile
    if (current.includes(seatId)) {
      setPickedIds(current.filter((id) => id !== seatId));
    } else if (current.length >= MAX_SEATS_PER_HOLD) {
      setMessage(`You can pick at most ${MAX_SEATS_PER_HOLD} seats.`);
    } else {
      setPickedIds([...current, seatId]);
    }
  }

  async function refresh() {
    try {
      setMap(await fetchSeatMap(showId));
    } catch {
      // keep showing the old map
    }
  }

  async function hold() {
    if (status !== "authenticated") {
      router.push(`/login?next=/shows/${showId}`);
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      const result = await holdSeats(showId, selected.map((seat) => seat.id));
      router.push(`/checkout/${result.bookingId}`); // stays "pending" while the next page loads
    } catch (err) {
      setPending(false);
      if (err instanceof ApiError && err.status === 401) {
        router.push(`/login?next=/shows/${showId}`); // session ended
      } else if (err instanceof ApiError) {
        setMessage(err.message); // e.g. 409 "These seats were just taken: A2"
        if (err.status === 409) {
          await refresh(); // the taken seats turn grey and drop out of the selection
        }
      } else {
        setMessage("Could not reach the server. Please try again.");
      }
    }
  }

  return (
    <div className="grid gap-4">
      <Legend prices={map.prices} />
      <SeatGrid
        rows={map.rows}
        selectedIds={new Set(selected.map((seat) => seat.id))}
        priceOf={priceOf}
        onToggle={toggle}
      />
      <p className="text-sm text-muted-foreground">{map.availableSeats} seats available</p>

      {/* Sticky summary: always visible, even on a long seat map */}
      <div className="sticky bottom-0 -mx-4 grid gap-2 border-t bg-background px-4 py-3 sm:flex sm:items-center sm:justify-between">
        <div className="grid gap-0.5 text-sm" aria-live="polite">
          {selected.length === 0 ? (
            <p className="text-muted-foreground">Pick up to {MAX_SEATS_PER_HOLD} seats.</p>
          ) : (
            <p>
              <span className="font-medium">
                {selected.length} {selected.length === 1 ? "seat" : "seats"}:
              </span>{" "}
              {selected.map((seat) => `${seat.row}${seat.number}`).join(", ")} ·{" "}
              <span className="font-medium">{formatPrice(total)}</span>
            </p>
          )}
          {lostCount > 0 && (
            <p className="text-amber-700">
              {lostCount === 1 ? "A seat you picked was" : `${lostCount} seats you picked were`} just taken by someone else.
            </p>
          )}
          {message && (
            <p role="alert" className="text-destructive">
              {message}
            </p>
          )}
        </div>
        <Button onClick={hold} disabled={selected.length === 0 || pending || status === "loading"}>
          {pending ? "Holding seats..." : status === "anonymous" ? "Log in to continue" : "Hold seats"}
        </Button>
      </div>
    </div>
  );
}

function Legend({ prices }: { prices: SeatMap["prices"] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
      {prices.map((p) => (
        <li key={p.category} className="flex items-center gap-1.5">
          <span className={cn("size-4 rounded-sm border", CATEGORY_STYLES[p.category])} />
          {formatCategory(p.category)} {formatPrice(p.price)}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className={cn("size-4 rounded-sm border", SELECTED_STYLE)} />
        Selected
      </li>
      <li className="flex items-center gap-1.5">
        <span className={cn("size-4 rounded-sm border", TAKEN_STYLE)} />
        Taken
      </li>
    </ul>
  );
}