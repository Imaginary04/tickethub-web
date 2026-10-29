import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">TicketHub</CardTitle>
          <CardDescription>
            Book seats for concerts, shows and events.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button render={<Link href="/login" />} nativeButton={false}>
            Log in
          </Button>
          <Button
            variant="outline"
            render={<Link href="/register" />}
            nativeButton={false}
          >
            Create account
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}