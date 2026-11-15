"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

// Wraps every /organizer page: only ORGANIZER and ADMIN accounts see the content.
// This is for a good experience only; the real protection is the backend (/api/organizer/** needs the role).
export function OrganizerGuard({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated" || !user) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (user.role !== "ORGANIZER" && user.role !== "ADMIN") {
    return (
      <div className="grid justify-items-start gap-3 py-12">
        <h1 className="text-2xl font-semibold">Organizers only</h1>
        <p className="text-muted-foreground">This area is for event organizers.</p>
        <Button variant="outline" render={<Link href="/events" />} nativeButton={false}>
          Browse events
        </Button>
      </div>
    );
  }

  return children;
}