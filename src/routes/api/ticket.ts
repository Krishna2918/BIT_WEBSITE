import { createFileRoute } from "@tanstack/react-router";
import { handleTicketRequest } from "@/lib/ticket-intake.server";

const methodNotAllowed = () =>
  Response.json({ ok: false, error: "method_not_allowed" }, { status: 405, headers: { Allow: "POST" } });

export const Route = createFileRoute("/api/ticket")({
  server: {
    handlers: {
      GET: methodNotAllowed,
      POST: ({ request }) => handleTicketRequest(request),
    },
  },
});
