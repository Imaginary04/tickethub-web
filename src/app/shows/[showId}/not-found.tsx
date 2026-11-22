import Link from "next/link";

import { Button } from "@/components/ui/button";

// Unknown show, event not published (draft/cancelled), or the show has already started
export default function ShowNotFound() {
  return (
    <main className="mx-auto grid w-full max-w-3xl flex-1 content-start justify-items-start gap-3 px-4 py-12">
      <h1 className="text-2xl font-semibold">This show can&apos;t be booked</h1>
      <p className="text-muted-foreground">It may have started already, been cancelled, or the link is wrong.</p>
      <Button render={<Link href="/events" />} nativeButton={false}>
        Browse events
      </Button>
    </main>
  );
}