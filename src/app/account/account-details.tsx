"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiFetch, type User } from "@/lib/api";

export function AccountDetails() {
  const { status } = useAuth();
  const router = useRouter();
  const [me, setMe] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Protected page: not logged in = go to /login.
  useEffect(() => {
    if (status === "anonymous") {
      router.replace("/login");
    }
  }, [status, router]);

  // Loads the user from the protected endpoint. apiFetch adds the Bearer token
  // and refreshes it automatically if it has expired.
  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    apiFetch<User>("/api/users/me")
      .then((user) => {
        if (active) setMe(user);
      })
      .catch(() => {
        if (active) setError("Could not load your account.");
      });
    return () => {
      active = false;
    };
  }, [status]);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }
  if (!me) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Your account</CardTitle>
        <CardDescription>Loaded from GET /api/users/me</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Name</dt>
          <dd>{me.name}</dd>
          <dt className="text-muted-foreground">Email</dt>
          <dd>{me.email}</dd>
          <dt className="text-muted-foreground">Role</dt>
          <dd>{me.role}</dd>
          <dt className="text-muted-foreground">Member since</dt>
          <dd>{new Date(me.createdAt).toLocaleDateString()}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}