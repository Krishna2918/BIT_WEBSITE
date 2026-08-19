import {
  buildWhatsappTicketHref,
  ticketIngestUrl,
  TicketIntakeSchema,
  ticketPayload,
  ticketWorkId,
  type TicketApiSuccess,
} from "./ticket-intake.ts";

const BODY_LIMIT = 16_384;
const INGEST_RESPONSE_LIMIT = 16_384;

export function whatsappTicketFallback(intake: ReturnType<typeof TicketIntakeSchema.parse>): TicketApiSuccess {
  return { ok: true, door: "whatsapp", href: buildWhatsappTicketHref(intake) };
}

async function boundedJson(response: Response, limit: number) {
  const declared = response.headers.get("content-length");
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > limit)) return undefined;
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel();
        return undefined;
      }
      chunks.push(value);
    }
    const combined = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new TextDecoder("utf-8", { fatal: true }).decode(combined);
  } catch {
    return undefined;
  } finally {
    reader.releaseLock();
  }
}

export async function deliverTicketIntake(
  intake: ReturnType<typeof TicketIntakeSchema.parse>,
  ingestBaseUrl: string | undefined,
  fetchImplementation: typeof fetch = fetch,
): Promise<TicketApiSuccess> {
  const hook = ticketIngestUrl(ingestBaseUrl);
  if (!hook) return whatsappTicketFallback(intake);

  try {
    const delivered = await fetchImplementation(hook, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticketPayload(intake)),
      signal: AbortSignal.timeout(8000),
    });
    if (!delivered.ok) return whatsappTicketFallback(intake);
    const text = await boundedJson(delivered, INGEST_RESPONSE_LIMIT);
    if (text === undefined) return whatsappTicketFallback(intake);
    let value: unknown = {};
    if (text) {
      try {
        value = JSON.parse(text);
      } catch {
        return whatsappTicketFallback(intake);
      }
    }
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      "ok" in value &&
      (value as { ok?: unknown }).ok === false
    ) {
      return whatsappTicketFallback(intake);
    }
    const workId = ticketWorkId(value);
    return workId ? { ok: true, work_id: workId } : { ok: true };
  } catch {
    return whatsappTicketFallback(intake);
  }
}

export async function handleTicketRequest(
  request: Request,
  env: Record<string, string | undefined> = process.env,
  fetchImplementation: typeof fetch = fetch,
) {
  if (request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") {
    return Response.json({ ok: false, error: "unsupported_media_type" }, { status: 415 });
  }
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > BODY_LIMIT) {
    return Response.json({ ok: false, error: "body_too_large" }, { status: 413 });
  }
  let json: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > BODY_LIMIT) {
      return Response.json({ ok: false, error: "body_too_large" }, { status: 413 });
    }
    json = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const parsed = TicketIntakeSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const result = await deliverTicketIntake(
    parsed.data,
    env.BITOS_TICKET_INGEST_URL,
    fetchImplementation,
  );
  return Response.json(result);
}
