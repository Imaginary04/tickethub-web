"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import type { SeatCategory } from "@/lib/events";
import { formatCategory } from "@/lib/format";
import { addShow, getMyVenue, type VenueSummary } from "@/lib/organizer";

// Display order for price inputs (cheapest first, like everywhere else)
const CATEGORY_ORDER: SeatCategory[] = ["SILVER", "GOLD", "PLATINUM"];

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// <input type="datetime-local"> gives "2026-12-20T19:00" with no time zone.
// Organizers enter India time, so we attach +05:30 before sending.
function toIndiaTime(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "");
  return text === "" ? null : `${text}:00+05:30`;
}

type AddShowFormProps = {
  eventId: number;
  venues: VenueSummary[];
  onAdded: () => Promise<void>;
};

export function AddShowForm({ eventId, venues, onAdded }: AddShowFormProps) {
  const [venueId, setVenueId] = useState("");
  const [categories, setCategories] = useState<SeatCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  // Picking a venue loads its rows, so we ask for exactly one price per seat category it has
  async function handleVenueChange(id: string) {
    setVenueId(id);
    setCategories(null);
    // A new venue means a fresh attempt: clear errors from the previous one
    setError(null);
    setFieldErrors({});
    if (id === "") return;
    try {
      const venue = await getMyVenue(Number(id));
      const present = new Set(venue.rows.map((row) => row.category));
      setCategories(CATEGORY_ORDER.filter((c) => present.has(c)));
    } catch {
      setError("Couldn't load that venue's seat categories.");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    setPending(true);
    setError(null);
    setFieldErrors({});
    try {
      await addShow(eventId, {
        venueId: venueId === "" ? null : Number(venueId),
        startTime: toIndiaTime(form.get("start")),
        endTime: toIndiaTime(form.get("end")),
        prices: (categories ?? []).map((category) => {
          const value = String(form.get(`price-${category}`) ?? "");
          return { category, price: value === "" ? null : Number(value) };
        }),
      });
      formElement.reset();
      setVenueId("");
      setCategories(null);
      await onAdded();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError("Could not reach the server. Please try again.");
      }
    } finally {
      setPending(false);
    }
  }

  if (venues.length === 0) {
    return <p className="text-sm text-muted-foreground">Create a venue first, then come back to add shows.</p>;
  }

  const startError = fieldErrors.startTime;
  const endError = fieldErrors.endTime ?? fieldErrors.endTimeAfterStart;

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4 rounded-xl border p-4">
      <h3 className="font-semibold">Add a show</h3>
      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-2">
        <Label htmlFor="venue">Venue</Label>
        <select
          id="venue"
          value={venueId}
          onChange={(e) => handleVenueChange(e.target.value)}
          aria-invalid={fieldErrors.venueId ? true : undefined}
          className={`${selectClass} w-fit`}
        >
          <option value="">Choose a venue</option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}, {venue.city}
            </option>
          ))}
        </select>
        {fieldErrors.venueId && <p className="text-sm text-destructive">{fieldErrors.venueId}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="start">Starts (India time)</Label>
          <Input id="start" name="start" type="datetime-local" aria-invalid={startError ? true : undefined} />
          {startError && <p className="text-sm text-destructive">{startError}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="end">Ends (India time)</Label>
          <Input id="end" name="end" type="datetime-local" aria-invalid={endError ? true : undefined} />
          {endError && <p className="text-sm text-destructive">{endError}</p>}
        </div>
      </div>

      {categories && (
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-medium">Prices (₹)</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {categories.map((category, i) => {
              const priceError = fieldErrors[`prices[${i}].price`];
              return (
                <div key={category} className="grid gap-1">
                  <Label htmlFor={`price-${category}`}>{formatCategory(category)}</Label>
                  <Input
                    id={`price-${category}`}
                    name={`price-${category}`}
                    type="number"
                    min={0}
                    step="0.01"
                    aria-invalid={priceError ? true : undefined}
                  />
                  {priceError && <p className="text-sm text-destructive">{priceError}</p>}
                </div>
              );
            })}
          </div>
        </fieldset>
      )}

      <Button type="submit" disabled={pending || venueId === "" || categories === null} className="w-fit">
        {pending ? "Adding show..." : "Add show"}
      </Button>
    </form>
  );
}
