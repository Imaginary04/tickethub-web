// Organizer API, called from Client Components.
// Unlike lib/events.ts this needs the logged-in user's token, so it goes through apiFetch and the /api proxy.

import { apiFetch } from "@/lib/api";
import type { EventCategory, SeatCategory, Show } from "@/lib/events";

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";

export type VenueSummary = {
  id: number;
  name: string;
  city: string;
  address: string;
  totalSeats: number;
  createdAt: string;
};

export type OrganizerEvent = {
  id: number;
  title: string;
  description: string | null;
  category: EventCategory;
  posterUrl: string | null;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
};

export type RowInput = { label: string; seatCount: number; category: SeatCategory };

export type CreateVenueInput = { name: string; city: string; address: string; rows: RowInput[] };

export type EventInput = {
  title: string;
  description: string | null;
  category: EventCategory;
  posterUrl: string | null;
};

export function listMyVenues(): Promise<VenueSummary[]> {
  return apiFetch<VenueSummary[]>("/api/organizer/venues");
}

export function createVenue(input: CreateVenueInput): Promise<VenueSummary> {
  return apiFetch<VenueSummary>("/api/organizer/venues", { method: "POST", body: JSON.stringify(input) });
}

export function listMyEvents(): Promise<OrganizerEvent[]> {
  return apiFetch<OrganizerEvent[]>("/api/organizer/events");
}

export function createEvent(input: EventInput): Promise<OrganizerEvent> {
  return apiFetch<OrganizerEvent>("/api/organizer/events", { method: "POST", body: JSON.stringify(input) });
}

// --- Managing one event (Phase 10) ---

// Organizer view of an event: all its shows, including past ones (Java: EventDetailsResponse)
export type OrganizerEventDetails = OrganizerEvent & { shows: Show[] };

// One venue with its rows (Java: VenueDetailsResponse)
export type VenueDetails = VenueSummary & {
  rows: { label: string; category: SeatCategory; seatCount: number }[];
};

// null = left empty in the form; the backend answers with a "must not be null" field error
export type ShowInput = {
  venueId: number | null;
  startTime: string | null; // ISO with offset, e.g. "2026-12-20T19:00:00+05:30"
  endTime: string | null;
  prices: { category: SeatCategory; price: number | null }[];
};

export function getMyEvent(eventId: string): Promise<OrganizerEventDetails> {
  return apiFetch<OrganizerEventDetails>(`/api/organizer/events/${eventId}`);
}

export function getMyVenue(venueId: number): Promise<VenueDetails> {
  return apiFetch<VenueDetails>(`/api/organizer/venues/${venueId}`);
}

export function addShow(eventId: number, input: ShowInput): Promise<Show> {
  return apiFetch<Show>(`/api/organizer/events/${eventId}/shows`, { method: "POST", body: JSON.stringify(input) });
}

export function deleteShow(eventId: number, showId: number): Promise<void> {
  return apiFetch<void>(`/api/organizer/events/${eventId}/shows/${showId}`, { method: "DELETE" });
}

export function publishEvent(eventId: number): Promise<OrganizerEvent> {
  return apiFetch<OrganizerEvent>(`/api/organizer/events/${eventId}/publish`, { method: "POST" });
}

export function cancelEvent(eventId: number): Promise<OrganizerEvent> {
  return apiFetch<OrganizerEvent>(`/api/organizer/events/${eventId}/cancel`, { method: "POST" });
}