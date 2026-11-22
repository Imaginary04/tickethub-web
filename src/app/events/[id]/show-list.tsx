import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { Show } from "@/lib/events";
import { formatCategory, formatPrice, formatShowTime, formatTime } from "@/lib/format";

export function ShowList({ shows }: { shows: Show[] }) {
  if (shows.length === 0) {
    return <p className="text-muted-foreground">No upcoming shows right now. Check back later.</p>;
  }

  return (
    <ul className="divide-y rounded-xl border">
      {shows.map((show) => (
        <li key={show.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <p className="font-medium">
              <time dateTime={show.startTime}>{formatShowTime(show.startTime)}</time>
              {" – "}
              <time dateTime={show.endTime}>{formatTime(show.endTime)}</time>
            </p>
            <p className="text-sm text-muted-foreground">
              {show.venueName}, {show.city}
            </p>
            <p className="text-sm">
              {show.prices.map((p) => `${formatCategory(p.category)} ${formatPrice(p.price)}`).join(" · ")}
            </p>
          </div>
          <Button render={<Link href={`/shows/${show.id}`} />} nativeButton={false}>
            Select seats
          </Button>
        </li>
      ))}
    </ul>
  );
}