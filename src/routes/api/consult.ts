import { createFileRoute } from "@tanstack/react-router";

const gone = () =>
  Response.json(
    { ok: false, error: "gone" },
    {
      status: 410,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    },
  );

export const Route = createFileRoute("/api/consult")({
  server: {
    handlers: {
      GET: gone,
      POST: gone,
    },
  },
});
