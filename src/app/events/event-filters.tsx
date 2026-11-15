import Form from "next/form";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EVENT_CATEGORIES, type EventFilters as Filters } from "@/lib/events";
import { formatCategory } from "@/lib/format";

// A GET form: submitting puts the filters in the URL (/events?city=Pune&category=CONCERT).
// next/form turns that into a client-side navigation, and it still works without JavaScript.
export function EventFilters({ filters }: { filters: Filters }) {
  return (
    <Form action="/events" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
      <Input name="q" placeholder="Search events" defaultValue={filters.q} aria-label="Search events" />
      <Input name="city" placeholder="City" defaultValue={filters.city} aria-label="City" />
      <Input name="date" type="date" defaultValue={filters.date} aria-label="Date" />
      <select
        name="category"
        defaultValue={filters.category ?? ""}
        aria-label="Category"
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">All categories</option>
        {EVENT_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {formatCategory(category)}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <Button type="submit">Search</Button>
        <Button variant="ghost" render={<Link href="/events" />} nativeButton={false}>
          Clear
        </Button>
      </div>
    </Form>
  );
}