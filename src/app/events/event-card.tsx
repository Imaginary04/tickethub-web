import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { EventCard as EventCardData } from "@/lib/events";
import { formatCategory, formatPrice, formatShowTime } from "@/lib/format";

export function EventCard({ event }: { event: EventCardData }) {
  return (
    <Link href={`/events/${event.id}`} className="group block rounded-xl focus-visible:outline-2">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader>
          <span className="w-fit rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {formatCategory(event.category)}
          </span>
          <CardTitle className="text-lg leading-snug">{event.title}</CardTitle>
          {event.nextShowTime && (
            <CardDescription>
              <time dateTime={event.nextShowTime}>{formatShowTime(event.nextShowTime)}</time>
            </CardDescription>
          )}
        </CardHeader>
        {event.minPrice !== null && (
          <CardContent className="mt-auto text-sm">
            from <span className="font-semibold">{formatPrice(event.minPrice)}</span>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}