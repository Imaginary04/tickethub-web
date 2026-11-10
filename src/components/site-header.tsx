"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, status, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
  try {
    await logout();
  } finally {
    router.replace("/login");
  }
}

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          TicketHub
        </Link>

        {/* Render nothing while we don't know yet, so the buttons don't flicker */}
        {status === "authenticated" && user && (
          <nav className="flex items-center gap-3">
            <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground">
              {user.name}
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </nav>
        )}

        {status === "anonymous" && (
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/login" />} nativeButton={false}>
              Log in
            </Button>
            <Button size="sm" render={<Link href="/register" />} nativeButton={false}>
              Sign up
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}