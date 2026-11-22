// A customer's own bookings, used from the browser (login required: goes through apiFetch).
import { apiFetch } from "@/lib/api";
import type { SeatCategory } from "@/lib/events";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";

// Mirrors BookingResponse.java
export type Booking = {
  bookingId: number;
  status: BookingStatus;
  showId: number;
  eventId: number;
  eventTitle: string;
  venueName: string;
  city: string;
  startTime: string;
  totalAmount: number;
  holdExpiresAt: string | null; // only set while PENDING
  seats: { seatId: number; row: string; number: number; category: SeatCategory; price: number }[];
};

export function getBooking(bookingId: string): Promise<Booking> {
  return apiFetch<Booking>(`/api/bookings/${bookingId}`);
}

// "Change seats": gives the held seats back (204). 409 = the hold had already ended.
export function releaseHold(bookingId: number): Promise<void> {
  return apiFetch<void>(`/api/bookings/${bookingId}/hold`, { method: "DELETE" });
}