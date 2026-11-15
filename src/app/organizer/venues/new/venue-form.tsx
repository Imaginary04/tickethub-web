"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import type { SeatCategory } from "@/lib/events";
import { formatCategory } from "@/lib/format";
import { createVenue } from "@/lib/organizer";

const SEAT_CATEGORIES: SeatCategory[] = ["SILVER", "GOLD", "PLATINUM"];
const MAX_ROWS = 26;

type RowState = { seatCount: string; category: SeatCategory };

// Rows are labelled by position: the first is A, the second B...
// Removing a row re-letters the rest, so labels are always unique and in order.
const rowLabel = (index: number) => String.fromCharCode(65 + index);

export function VenueForm() {
  const router = useRouter();
  const [rows, setRows] = useState<RowState[]>([
    { seatCount: "10", category: "PLATINUM" },
    { seatCount: "15", category: "GOLD" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const totalSeats = rows.reduce((sum, row) => sum + (Number(row.seatCount) || 0), 0);

  function updateRow(index: number, change: Partial<RowState>) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...change } : row)));
  }

  function addRow() {
    // A new row copies the category of the last row (rows near the back are usually cheaper)
    setRows((current) => [...current, { seatCount: "10", category: current.at(-1)?.category ?? "SILVER" }]);
  }

  function removeRow(index: number) {
    setRows((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setPending(true);
    setError(null);
    setFieldErrors({});
    try {
      await createVenue({
        name: String(form.get("name")),
        city: String(form.get("city")),
        address: String(form.get("address")),
        rows: rows.map((row, i) => ({
          label: rowLabel(i),
          seatCount: Number(row.seatCount),
          category: row.category,
        })),
      });
      router.push("/organizer");
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

  return (
    <form onSubmit={handleSubmit} noValidate className="grid max-w-2xl gap-6">
      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField name="name" label="Venue name" required error={fieldErrors.name} />
        <FormField name="city" label="City" required error={fieldErrors.city} />
        <div className="sm:col-span-2">
          <FormField name="address" label="Address" required error={fieldErrors.address} />
        </div>
      </div>

      <fieldset className="grid gap-3">
        <legend className="mb-2 font-medium">Seat layout</legend>
        {fieldErrors.rows && <p className="text-sm text-destructive">{fieldErrors.rows}</p>}
        {rows.map((row, i) => {
          const rowError = fieldErrors[`rows[${i}].seatCount`] ?? fieldErrors[`rows[${i}].category`];
          return (
            <div key={i} className="grid gap-1">
              <div className="flex items-center gap-3">
                <span className="w-14 text-sm font-medium">Row {rowLabel(i)}</span>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={row.seatCount}
                  onChange={(e) => updateRow(i, { seatCount: e.target.value })}
                  aria-label={`Seats in row ${rowLabel(i)}`}
                  aria-invalid={rowError ? true : undefined}
                  className="w-24"
                />
                <select
                  value={row.category}
                  onChange={(e) => updateRow(i, { category: e.target.value as SeatCategory })}
                  aria-label={`Category of row ${rowLabel(i)}`}
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {SEAT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {formatCategory(category)}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRow(i)}
                  disabled={rows.length === 1}
                  aria-label={`Remove row ${rowLabel(i)}`}
                >
                  Remove
                </Button>
              </div>
              {rowError && <p className="ml-17 text-sm text-destructive">{rowError}</p>}
            </div>
          );
        })}
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" size="sm" onClick={addRow} disabled={rows.length >= MAX_ROWS}>
            Add row
          </Button>
          <span className="text-sm text-muted-foreground">
            {rows.length} {rows.length === 1 ? "row" : "rows"}, {totalSeats} seats
          </span>
        </div>
      </fieldset>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating venue..." : "Create venue"}
        </Button>
        <Button variant="ghost" render={<Link href="/organizer" />} nativeButton={false}>
          Cancel
        </Button>
      </div>
    </form>
  );
}