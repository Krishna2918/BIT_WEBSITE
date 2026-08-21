import { createFileRoute } from "@tanstack/react-router";
import { consultMethodNotAllowed, handleConsultPost } from "@/lib/consult-api.server";

export const Route = createFileRoute("/api/consult")({
  server: {
    handlers: {
      GET: consultMethodNotAllowed,
      POST: ({ request }) => handleConsultPost(request),
    },
  },
});
