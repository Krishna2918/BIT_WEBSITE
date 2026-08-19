import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Schema = z.object({
  company: z.string().trim().max(160).optional().default(""),
  email: z.string().trim().max(160).optional().default(""),
  broken: z.string().trim().min(4).max(4000),
  name: z.string().trim().max(120).optional().default(""),
  hostname: z.string().trim().max(120).optional().default(""),
  severity: z.enum(["", "one", "few", "office"]).optional().default(""),
  source: z.enum(["form", "chat"]).optional().default("form"),
  fromWhatsapp: z.boolean().optional().default(false),
  company_website: z.string().max(200).optional(),
});

function ticketId() {
  const d = new Date();
  const y = String(d.getFullYear()).slice(2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const n = String(Math.floor(1000 + Math.random() * 9000));
  return `BIT-${y}${m}${day}-${n}`;
}

export const Route = createFileRoute("/api/ticket")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let json: unknown;
        try {
          json = await request.json();
        } catch {
          return Response.json({ ok: false }, { status: 400 });
        }
        const parsed = Schema.safeParse(json);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid" }, { status: 400 });
        }
        const id = ticketId();
        if (parsed.data.company_website) {
          return Response.json({ ok: true, id });
        }
        if (parsed.data.source === "form") {
          if (!parsed.data.company || !parsed.data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.data.email)) {
            return Response.json({ ok: false, error: "invalid" }, { status: 400 });
          }
        } else if (parsed.data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.data.email)) {
          return Response.json({ ok: false, error: "invalid" }, { status: 400 });
        }
        const hook = process.env.TICKET_WEBHOOK_URL;
        if (hook) {
          try {
            await fetch(hook, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...parsed.data,
                id,
                received_at: new Date().toISOString(),
              }),
            });
          } catch {
            return Response.json({ ok: false }, { status: 502 });
          }
        }
        return Response.json({ ok: true, id });
      },
    },
  },
});
