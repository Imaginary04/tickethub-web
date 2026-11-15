import { OrganizerGuard } from "../../organizer-guard";

import { ManageEvent } from "./manage-event";

// /organizer/events/{id}: the id is read in the browser with useParams (see manage-event.tsx)
export default function ManageEventPage() {
  return (
    <OrganizerGuard>
      <ManageEvent />
    </OrganizerGuard>
  );
}
