const timeFormat = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
});

// Just the time, e.g. "10:30 pm" (for a show's end time)
export function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso));
}