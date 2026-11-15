import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organizer dashboard | TicketHub",
};

// Shared frame for every page under /organizer.
// It always renders {children}: each page wraps its own content in <OrganizerGuard>.
export default function OrganizerLayout({ children }: LayoutProps<"/organizer">) {
  return <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">{children}</main>;
}