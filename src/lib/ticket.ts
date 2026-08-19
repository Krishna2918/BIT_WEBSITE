export type TicketSeverity = "" | "one" | "few" | "office";

export type TicketDraft = {
  company: string;
  email: string;
  broken: string;
  name: string;
  teamviewer_id: string;
  severity: TicketSeverity;
  source: "form" | "chat";
  fromWhatsapp: boolean;
};

export type TicketResult = { ok: true; id: string } | { ok: false; error: string };

export const SEVERITY_LABEL: Record<Exclude<TicketSeverity, "">, string> = {
  one: "One person",
  few: "A few people",
  office: "Whole office",
};

export function emptyDraft(fromWhatsapp = false): TicketDraft {
  return {
    company: "",
    email: "",
    broken: "",
    name: "",
    teamviewer_id: "",
    severity: "",
    source: "chat",
    fromWhatsapp,
  };
}

export function looksLikeDeviceIssue(text: string): boolean {
  return /\b(pc|computer|laptop|desktop|printer|workstation|login|log[\s-]?in|sign[\s-]?in|outlook|windows|keyboard|monitor|blue[\s-]?screen|bsod|dock|scanner)\b/i.test(
    text,
  );
}

export function looksLikeSkip(text: string): boolean {
  return /^(skip|n\/?a|no|none|nope|idk|don'?t know|not sure|later|just open( it)?|open it|pass|n\/a)\.?$/i.test(
    text.trim(),
  );
}

export function looksLikePassword(text: string): boolean {
  return /(password|passwd|pwd|passcode|pin)\s*[:=]/i.test(text) || /^\s*(password|passwd|pwd)\s+\S+/i.test(text);
}

export function looksLikeEmail(text: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim());
}

export function severityFrom(text: string): TicketSeverity {
  if (/(whole office|everyone|all (the )?(pcs|computers|staff)|entire (site|office|clinic|yard))/i.test(text)) {
    return "office";
  }
  if (/(a few|several people|half the|some of us|multiple)/i.test(text)) return "few";
  if (/(just me|only me|one person|my pc|my computer)/i.test(text)) return "one";
  return "";
}

export type ChatNeed = "broken" | "company" | "teamviewer" | "email" | "submit";

export function nextChatNeed(
  draft: TicketDraft,
  asked: { company: boolean; teamviewer: boolean; email: boolean },
): ChatNeed {
  if (draft.broken.trim().length < 4) return "broken";
  if (!draft.company.trim() && !asked.company) return "company";
  if (
    looksLikeDeviceIssue(draft.broken) &&
    !draft.teamviewer_id.trim() &&
    !asked.teamviewer
  ) {
    return "teamviewer";
  }
  if (!draft.email.trim() && !draft.fromWhatsapp && !asked.email) return "email";
  return "submit";
}

export function promptFor(need: ChatNeed, fromWhatsapp: boolean): string {
  switch (need) {
    case "broken":
      return fromWhatsapp
        ? "This WhatsApp chat is the contact. Tell me what is broken. Do not send passwords."
        : "Tell me what is broken. I will open a ticket for BIT Helpdesk. Do not send passwords. I will not ask for a phone number.";
    case "company":
      return "Which company is this for? Skip if you want — I can still open it.";
    case "teamviewer":
      return "Open TeamViewer and send Your ID — the number like 123 456 789. Skip if you cannot.";
    case "email":
      return "Work email for updates, or skip.";
    case "submit":
      return "Opening the ticket now.";
  }
}

export async function submitTicket(draft: TicketDraft): Promise<TicketResult> {
  try {
    const res = await fetch("/api/ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const json = (await res.json()) as { ok?: boolean; id?: string };
    if (!res.ok || !json.ok || !json.id) return { ok: false, error: "send" };
    return { ok: true, id: json.id };
  } catch {
    return { ok: false, error: "network" };
  }
}
