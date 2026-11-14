import Link from "next/link";

import { Button } from "@/components/ui/button";

// Shown when the page calls notFound(): unknown id, draft or cancelled event.
// It replaces the whole page, so it needs its own <main> for the same spacing.
export default function EventNotFound() {
  return (
    <main className="mx-auto grid w-full max-w-3xl flex-1 content-start justify-items-start gap-3 px-4 py-12">
      <h1 className="text-2xl font-semibold">Event not found</h1>
      <p className="text-muted-foreground">It may have been cancelled, or the link is wrong.</p>
      <Button render={<Link href="/events" />} nativeButton={false}>
        Browse events
      </Button>
    </main>
  );
}