type PublicEnvironment = Record<string, string | boolean | undefined>;

type DisabledAssistantConfig = {
  enabled: false;
  reason: "feature-disabled" | "invalid-public-config";
};

type EnabledAssistantConfig = { enabled: true; endpoint: string };

export type PublicAssistantConfig = DisabledAssistantConfig | EnabledAssistantConfig;
export type PublicAssistantResult =
  | { kind: "answer"; mode: "ai" | "faq"; text: string }
  | { kind: "handoff"; text: string };

const ASSISTANT_PATH = "/api/assistant";
const MAX_MESSAGE_LENGTH = 2_000;
const MAX_RESPONSE_LENGTH = 16_384;
const REQUEST_TIMEOUT_MS = 10_000;
const HUMAN_REQUEST =
  /\b(human|agent|representative)\b|\b(talk|speak|chat|connect)\b.{0,24}\b(person|human|agent|representative)\b/iu;
const TICKET_REQUEST =
  /\b(ticket|broken|printer|password reset|pc is slow|computer is slow|not working|wifi|wi-fi|outage)\b/iu;

function readString(environment: PublicEnvironment, name: string): string {
  const value = environment[name];
  return typeof value === "string" ? value.trim() : "";
}

export function getPublicAssistantConfig(
  environment: PublicEnvironment,
): PublicAssistantConfig {
  if (readString(environment, "VITE_ASK_AI_ENABLED") !== "true") {
    return { enabled: false, reason: "feature-disabled" };
  }
  return { enabled: true, endpoint: ASSISTANT_PATH };
}

export function wantsHumanSupport(message: string): boolean {
  return HUMAN_REQUEST.test(message);
}

export function wantsTicketSupport(message: string): boolean {
  return TICKET_REQUEST.test(message);
}

function readResult(value: unknown): PublicAssistantResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Public assistant returned an invalid response");
  }
  const response = value as Record<string, unknown>;
  const text = typeof response.answer === "string" ? response.answer.trim() : "";
  if (text.length > 1_200) throw new Error("Public assistant response is too long");
  if (
    response.status === "answer" &&
    (response.mode === "ai" || response.mode === "faq") &&
    text
  ) {
    return { kind: "answer", mode: response.mode, text };
  }
  if (response.status === "handoff") {
    return {
      kind: "handoff",
      text:
        text ||
        "This needs a person. Open live chat and repeat your question; the Ask AI transcript is not transferred.",
    };
  }
  throw new Error("Public assistant returned an unsupported response");
}

export async function askPublicAssistant(
  message: string,
  consent: boolean,
  environment: PublicEnvironment = import.meta.env,
  fetchImplementation: typeof fetch = fetch,
): Promise<PublicAssistantResult> {
  const config = getPublicAssistantConfig(environment);
  if (!config.enabled) throw new Error("Public assistant is disabled");
  if (consent !== true) throw new Error("Public assistant processing consent is required");
  const cleanMessage = message.trim();
  if (!cleanMessage || cleanMessage.length > MAX_MESSAGE_LENGTH) {
    throw new Error("Public assistant message is invalid");
  }

  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImplementation(config.endpoint, {
      method: "POST",
      credentials: "omit",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "bitsolution-homepage",
        consent,
        message: cleanMessage,
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Public assistant request failed");
    const body = await response.text();
    if (!body || body.length > MAX_RESPONSE_LENGTH) {
      throw new Error("Public assistant response size is invalid");
    }
    return readResult(JSON.parse(body) as unknown);
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}
