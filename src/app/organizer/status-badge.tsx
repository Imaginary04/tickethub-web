import { formatCategory } from "@/lib/format";
import type { EventStatus } from "@/lib/organizer";

const STATUS_STYLES: Record<EventStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

// Used by the dashboard list and the manage page
export function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {formatCategory(status)}
    </span>
  );
}