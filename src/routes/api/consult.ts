import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Schema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(7).max(40),
  interest: z.string().trim().min(2).max(160),
  message: z.string().trim().max(2000).optional().default(""),
  casl: z.literal("yes"),
  intent: z.string().max(40).optional(),
  source: z.string().max(120).optional(),
  gclid: z.string().max(200).optional(),
  utm_source: z.string().max(120).optional(),
  utm_medium: z.string().max(120).optional(),
  utm_campaign: z.string().max(160).optional(),
  utm_term: z.string().max(160).optional(),
  utm_content: z.string().max(160).optional(),
  msclkid: z.string().max(200).optional(),
  fbclid: z.string().max(200).optional(),
  landing_page: z.string().max(200).optional(),
  referrer: z.string().max(400).optional(),
  company_website: z.string().max(200).optional(),
});

export const Route = createFileRoute("/api/consult")({
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
        if (parsed.data.company_website) {
          return Response.json({ ok: true });
        }
        const hook = process.env.CONSULT_WEBHOOK_URL;
        if (hook) {
          try {
            await fetch(hook, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...parsed.data,
                received_at: new Date().toISOString(),
              }),
            });
          } catch {
            return Response.json({ ok: false }, { status: 502 });
          }
        }
        return Response.json({ ok: true });
      },
    },
  },
});
