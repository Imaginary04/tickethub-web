import { Dashboard } from "./dashboard";
import { OrganizerGuard } from "./organizer-guard";

export default function OrganizerPage() {
  return (
    <OrganizerGuard>
      <Dashboard />
    </OrganizerGuard>
  );
}