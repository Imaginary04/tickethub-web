import Link from "next/link";

import { Button } from "@/components/ui/button";
import { toQueryString, type EventFilters } from "@/lib/events";

type PaginationProps = {
  filters: EventFilters;
  page: number; // 0-based, like the API
  totalPages: number;
};

// Previous/next links that keep the current filters in the URL
export function Pagination({ filters, page, totalPages }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }
  const hrefFor = (target: number) => `/events?${toQueryString({ ...filters, page: String(target) })}`;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-4">
      {page > 0 ? (
        <Button variant="outline" render={<Link href={hrefFor(page - 1)} />} nativeButton={false}>
          Previous
        </Button>
      ) : (
        <Button variant="outline" disabled>
          Previous
        </Button>
      )}
      <span className="text-sm text-muted-foreground">
        Page {page + 1} of {totalPages}
      </span>
      {page < totalPages - 1 ? (
        <Button variant="outline" render={<Link href={hrefFor(page + 1)} />} nativeButton={false}>
          Next
        </Button>
      ) : (
        <Button variant="outline" disabled>
          Next
        </Button>
      )}
    </nav>
  );
}