"use client"; // error boundaries must be Client Components

import { Button } from "@/components/ui/button";

// Shown when loading the event throws (e.g. the backend is down).
// It replaces the whole page, so it needs its own <main> for the same spacing.
export default function EventError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="mx-auto grid w-full max-w-3xl flex-1 content-start justify-items-start gap-3 px-4 py-12">
      <h1 className="text-2xl font-semibold">Couldn&apos;t load this event</h1>
      <p className="text-muted-foreground">Something went wrong on our side. Please try again.</p>
      <Button onClick={() => retry()}>Try again</Button>
    </main>
  );
}