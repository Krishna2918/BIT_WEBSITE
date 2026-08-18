import { createFileRoute } from "@tanstack/react-router";
import { handlePublicAssistantRequest } from "@/lib/public-assistant.server";

const methodNotAllowed = () =>
  Response.json(
    { status: "handoff", answer: "Method not allowed." },
    {
      status: 405,
      headers: { Allow: "POST", "Cache-Control": "no-store" },
    },
  );

export const Route = createFileRoute("/api/assistant")({
  server: {
    handlers: {
      GET: methodNotAllowed,
      POST: ({ request }) => handlePublicAssistantRequest(request),
    },
  },
});
