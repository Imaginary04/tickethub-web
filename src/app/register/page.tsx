import type { Metadata } from "next";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create account | TicketHub",
};

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <RegisterForm />
    </main>
  );
}