import { OrganizerGuard } from "../../organizer-guard";

import { EventForm } from "./event-form";

export default function NewEventPage() {
  return (
    <OrganizerGuard>
      <h1 className="text-2xl font-semibold">New event</h1>
      <EventForm />
    </OrganizerGuard>
  );
}