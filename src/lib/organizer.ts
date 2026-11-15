// Organizer API, called from Client Components.
// Unlike lib/events.ts this needs the logged-in user's token, so it goes through apiFetch and the /api proxy.

import { apiFetch } from "@/lib/api";
import type { EventCategory, SeatCategory } from "@/lib/events";

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