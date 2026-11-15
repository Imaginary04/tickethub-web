"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { EVENT_CATEGORIES, type EventCategory } from "@/lib/events";
import { formatCategory } from "@/lib/format";
import { createEvent } from "@/lib/organizer";

// Empty optional fields are sent as null, not "" (an empty posterUrl would fail the @URL check)
function optional(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text === "" ? null : text;
}

export function EventForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setPending(true);
    setError(null);
    setFieldErrors({});
    try {
      const created = await createEvent({
        title: String(form.get("title")),
        description: optional(form.get("description")),
        category: String(form.get("category")) as EventCategory,
        posterUrl: optional(form.get("posterUrl")),
      });
      // Straight to the manage page, where the organizer adds shows and publishes
      router.push(`/organizer/events/${created.id}`);
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
    <form onSubmit={handleSubmit} noValidate className="grid max-w-2xl gap-4">
      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <FormField name="title" label="Title" required error={fieldErrors.title} />

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          aria-invalid={fieldErrors.description ? true : undefined}
          className="rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
        />
        {fieldErrors.description && <p className="text-sm text-destructive">{fieldErrors.description}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          defaultValue="CONCERT"
          className="h-8 w-fit rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {EVENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {formatCategory(category)}
            </option>
          ))}
        </select>
      </div>

      <FormField
        name="posterUrl"
        label="Poster URL (optional)"
        type="url"
        placeholder="https://..."
        error={fieldErrors.posterUrl}
      />

      <p className="text-sm text-muted-foreground">
        New events start as a draft. You&apos;ll add shows and publish it in the next step.
      </p>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating event..." : "Create event"}
        </Button>
        <Button variant="ghost" render={<Link href="/organizer" />} nativeButton={false}>
          Cancel
        </Button>
      </div>
    </form>
  );
}