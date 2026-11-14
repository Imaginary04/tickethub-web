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