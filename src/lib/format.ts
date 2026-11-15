// Display helpers. Times come from the API in UTC; we always show them in India time.

const showTimeFormat = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

export function formatShowTime(iso: string): string {
  return showTimeFormat.format(new Date(iso));
}

const timeFormat = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
});

// Just the time, e.g. "10:30 pm" (for a show's end time)
export function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso));
}

// 1199 -> "₹1,199", 2499.5 -> "₹2,499.50"
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// "WORKSHOP" -> "Workshop"
export function formatCategory(category: string): string {
  return category.charAt(0) + category.slice(1).toLowerCase();
}