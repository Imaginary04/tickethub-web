import { OrganizerGuard } from "../../organizer-guard";

import { VenueForm } from "./venue-form";

export default function NewVenuePage() {
  return (
    <OrganizerGuard>
      <h1 className="text-2xl font-semibold">New venue</h1>
      <VenueForm />
    </OrganizerGuard>
  );
}