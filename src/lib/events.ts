// Public event API, called from Server Components.
// On the server there's no browser, so the /api proxy isn't involved: we call Spring Boot directly.

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

export const EVENT_CATEGORIES = [
  "MOVIE",
  "CONCERT",
  "COMEDY",
  "THEATRE",
  "SPORTS",
  "WORKSHOP",
  "OTHER",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export type EventCard = {
  id: number;
  title: string;
  category: EventCategory;
  posterUrl: string | null;
  nextShowTime: string | null;
  minPrice: number | null;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type EventFilters = {
  city?: string;
  date?: string;
  category?: string;
  q?: string;
  page?: string;
};

export const PAGE_SIZE = 12;

// Only non-empty filters go into the query string
export function toQueryString(filters: EventFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value && value.trim() !== "") {
      params.set(key, value.trim());
    }
  }
  return params.toString();
}

export type SeatCategory = "SILVER" | "GOLD" | "PLATINUM";

export type Show = {
  id: number;
  venueId: number;
  venueName: string;
  city: string;
  startTime: string;
  endTime: string;
  prices: { category: SeatCategory; price: number }[];
};

export type PublicEvent = {
  id: number;
  title: string;
  description: string | null;
  category: EventCategory;
  posterUrl: string | null;
  shows: Show[];
};

// null = no such public event (unknown id, draft or cancelled: the API answers 404 for all of them)
export async function getEvent(id: string): Promise<PublicEvent | null> {
  if (!/^\d+$/.test(id)) {
    return null; // "/events/abc" can't be an event
  }
  const res = await fetch(`${BACKEND_URL}/api/events/${id}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Loading event ${id} failed: ${res.status}`);
  }
  return res.json();
}

export async function searchEvents(filters: EventFilters): Promise<PageResponse<EventCard>> {
  const query = toQueryString({ ...filters, page: filters.page ?? "0" });
  const res = await fetch(`${BACKEND_URL}/api/events?${query}&size=${PAGE_SIZE}`);
  if (!res.ok) {
    throw new Error(`Event search failed: ${res.status}`);
  }
  return res.json();
}