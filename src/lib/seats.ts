// Seat map + holds, used from the browser (goes through the /api proxy).
import { apiFetch, ApiError } from "@/lib/api";
import type { SeatCategory } from "@/lib/events";

export type SeatStatus = "AVAILABLE" | "HELD" | "BOOKED";

export type SeatInfo = {
  id: number;
  number: number;
  category: SeatCategory;
  status: SeatStatus;
};

export type SeatRow = {
  label: string;
  seats: SeatInfo[];
};

// Mirrors SeatMapResponse.java
export type SeatMap = {
  showId: number;
  eventId: number;
  eventTitle: string;
  venueName: string;
  city: string;
  startTime: string;
  endTime: string;
  prices: { category: SeatCategory; price: number }[];
  rows: SeatRow[];
  availableSeats: number;
};

// Mirrors HoldResponse.java
export type Hold = {
  bookingId: number;
  showId: number;
  status: "PENDING";
  totalAmount: number;
  holdExpiresAt: string;
  seats: { seatId: number; row: string; number: number; category: SeatCategory; price: number }[];
};

// Same limit as app.booking.max-seats-per-hold in the backend
export const MAX_SEATS_PER_HOLD = 10;

// Public endpoint, but always fresh: seats change every second during a big sale
export async function fetchSeatMap(showId: number): Promise<SeatMap> {
  const res = await fetch(`/api/shows/${showId}/seats`, { cache: "no-store" });
  if (!res.ok) {
    throw new ApiError(res.status, "Could not load the seats");
  }
  return res.json();
}

// Needs a login: apiFetch adds the token (and refreshes it once if it expired)
export function holdSeats(showId: number, seatIds: number[]): Promise<Hold> {
  return apiFetch<Hold>(`/api/shows/${showId}/holds`, {
    method: "POST",
    body: JSON.stringify({ seatIds }),
  });
}