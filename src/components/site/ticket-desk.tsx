import { Link } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { SITE } from "@/lib/site";
import { track } from "@/lib/tracking";
import {
  emptyDraft,
  looksLikeEmail,
  looksLikePassword,
  looksLikeSkip,
  nextChatNeed,
  promptFor,
  severityFrom,
  submitTicket,
  type TicketDraft,
} from "@/lib/ticket";

type Msg = { id: number; from: "bot" | "you"; text: string };

const STARTERS = ["Printer will not print", "Cannot log in", "Whole office is down"] as const;

let msgSeq = 1;

export function TicketDesk({ fromWhatsapp }: { fromWhatsapp: boolean }) {
  const [tab, setTab] = useState<"form" | "chat">("form");
  const [ticketId, setTicketId] = useState("");

  if (ticketId) {
    return <TicketReceipt id={ticketId} />;
  }

  return (
    <div className="ticket-desk">
      <div className="ticket-tabs" role="tablist" aria-label="How to raise a ticket">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "form"}
          className={tab === "form" ? "is-on" : undefined}
          onClick={() => setTab("form")}
        >
          Short form
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "chat"}
          className={tab === "chat" ? "is-on" : undefined}
          onClick={() => setTab("chat")}
        >
          Ask AI
        </button>
      </div>
      <div className="ticket-grid">
        <section className={tab === "form" ? "ticket-pane" : "ticket-pane ticket-pane-hide"}>
          <h2>Short form</h2>
          <p>Three required fields. No phone. No password.</p>
          <TicketForm fromWhatsapp={fromWhatsapp} onDone={setTicketId} />
        </section>
        <section className={tab === "chat" ? "ticket-pane ticket-chat-pane" : "ticket-pane ticket-chat-pane ticket-pane-hide"}>
          <h2>Ask AI</h2>
          <p>It asks only what is missing, then opens the same ticket.</p>
          <TicketChat fromWhatsapp={fromWhatsapp} onDone={setTicketId} />
        </section>
      </div>
    </div>
  );
}

function TicketReceipt({ id }: { id: string }) {
  return (
    <section className="ticket-receipt" aria-live="polite">
      <p className="ticket-kicker">BIT Helpdesk</p>
      <h2>Ticket {id}</h2>
      <p>BIT Helpdesk sees it. A person takes it from here.</p>
      <p className="ticket-receipt-actions">
        <a className="text-link callrail rTapNumber" href={SITE.phoneHref}>
          Call {SITE.phoneDisplay}
        </a>
        {" · "}
        <a className="text-link" href={SITE.whatsappHref} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
        {" · "}
        <Link to="/consult" className="text-link">
          Book consultation
        </Link>
      </p>
    </section>
  );
}

function TicketForm({
  fromWhatsapp,
  onDone,
}: {
  fromWhatsapp: boolean;
  onDone: (id: string) => void;
}) {
  const started = useRef(Date.now());
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (String(data.get("company_website") || "").trim()) {
      onDone("BIT-000000-0000");
      return;
    }
    if (Date.now() - started.current < 1200) {
      setError("Please take a moment to review.");
      setStatus("error");
      return;
    }
    const company = String(data.get("company") || "").trim();
    const email = String(data.get("email") || "").trim();
    const broken = String(data.get("broken") || "").trim();
    const nextErr: Record<string, string> = {};
    if (!company) nextErr.company = "Company is required.";
    if (!email) nextErr.email = "Work email is required.";
    else if (!looksLikeEmail(email)) nextErr.email = "Use a work email.";
    if (broken.length < 4) nextErr.broken = "Tell us what is broken.";
    if (looksLikePassword(broken)) nextErr.broken = "Do not send passwords.";
    setFieldErr(nextErr);
    if (Object.keys(nextErr).length) {
      setError("Fix the highlighted fields.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    const draft: TicketDraft = {
      company,
      email,
      broken,
      name: String(data.get("name") || "").trim(),
      hostname: String(data.get("hostname") || "").trim(),
      severity: (String(data.get("severity") || "") as TicketDraft["severity"]) || "",
      source: "form",
      fromWhatsapp,
    };
    const result = await submitTicket(draft);
    if (!result.ok) {
      setStatus("error");
      setError(`We could not open the ticket. Call or WhatsApp ${SITE.phoneDisplay}.`);
      return;
    }
    track("ticket_submit", { source: "form" });
    onDone(result.id);
  }

  return (
    <form className="consult-form ticket-form" onSubmit={onSubmit} noValidate>
      <div className="hp" aria-hidden="true">
        <label htmlFor="company_website">Website</label>
        <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      <label>
        Company
        <input
          name="company"
          type="text"
          required
          autoComplete="organization"
          maxLength={160}
          aria-invalid={fieldErr.company ? true : undefined}
          placeholder="The floor we already know"
        />
        {fieldErr.company ? <span className="form-err">{fieldErr.company}</span> : null}
      </label>
      <label>
        Work email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={160}
          aria-invalid={fieldErr.email ? true : undefined}
          placeholder="you@company.ca"
        />
        {fieldErr.email ? <span className="form-err">{fieldErr.email}</span> : null}
      </label>
      <label>
        What is broken
        <textarea
          name="broken"
          rows={4}
          required
          maxLength={4000}
          aria-invalid={fieldErr.broken ? true : undefined}
          placeholder="What stopped working. No passwords."
        />
        {fieldErr.broken ? <span className="form-err">{fieldErr.broken}</span> : null}
      </label>
      <label>
        Your name <span className="ticket-opt">optional</span>
        <input name="name" type="text" autoComplete="name" maxLength={120} placeholder="If you want it on the ticket" />
      </label>
      <label>
        PC name / hostname <span className="ticket-opt">optional</span>
        <input name="hostname" type="text" maxLength={120} autoComplete="off" placeholder="Only if this is a PC, printer, or login" />
      </label>
      <fieldset className="ticket-sev">
        <legend>
          How bad is it <span className="ticket-opt">optional</span>
        </legend>
        <label>
          <input type="radio" name="severity" value="one" />
          One person
        </label>
        <label>
          <input type="radio" name="severity" value="few" />
          A few people
        </label>
        <label>
          <input type="radio" name="severity" value="office" />
          Whole office
        </label>
      </fieldset>
      {error ? (
        <p className="form-err" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Opening…" : "Open ticket"}
      </button>
      <p className="form-fine">Do not send passwords. BIT Helpdesk in Ontario sees the ticket.</p>
    </form>
  );
}

function TicketChat({
  fromWhatsapp,
  onDone,
}: {
  fromWhatsapp: boolean;
  onDone: (id: string) => void;
}) {
  const [draft, setDraft] = useState(() => {
    const d = emptyDraft(fromWhatsapp);
    d.source = "chat";
    return d;
  });
  const [asked, setAsked] = useState({ company: false, hostname: false, email: false });
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    { id: 0, from: "bot", text: promptFor("broken", fromWhatsapp) },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  const push = (from: Msg["from"], text: string) => {
    setMsgs((m) => [...m, { id: msgSeq++, from, text }]);
  };

  const openIt = async (next: TicketDraft) => {
    setBusy(true);
    const result = await submitTicket(next);
    setBusy(false);
    if (!result.ok) {
      push("bot", `I could not open it. Call or WhatsApp ${SITE.phoneDisplay}.`);
      return;
    }
    track("ticket_submit", { source: "chat" });
    push("bot", `Ticket ${result.id}. BIT Helpdesk sees it.`);
    window.setTimeout(() => onDone(result.id), 700);
  };

  const handle = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    push("you", text);

    if (looksLikePassword(text)) {
      push("bot", "Do not send passwords. Tell me what is broken without the secret.");
      return;
    }

    const need = nextChatNeed(draft, asked);
    const next = { ...draft };
    const nextAsked = { ...asked };

    if (need === "broken") {
      if (looksLikeSkip(text) || text.length < 4) {
        push("bot", "I need what is broken to open a ticket. Skip the extras later if you want.");
        return;
      }
      next.broken = text;
      if (!next.severity) next.severity = severityFrom(text);
    } else if (need === "company") {
      nextAsked.company = true;
      if (!looksLikeSkip(text)) next.company = text;
    } else if (need === "hostname") {
      nextAsked.hostname = true;
      if (!looksLikeSkip(text)) next.hostname = text;
    } else if (need === "email") {
      if (looksLikeSkip(text)) {
        nextAsked.email = true;
      } else if (looksLikeEmail(text)) {
        nextAsked.email = true;
        next.email = text;
      } else {
        push("bot", "That does not look like an email. Skip, or send a work email.");
        return;
      }
    }

    if (looksLikeEmail(text) && !next.email) next.email = text;

    setDraft(next);
    setAsked(nextAsked);

    const follow = nextChatNeed(next, nextAsked);
    if (follow === "submit") {
      push("bot", "Opening the ticket now.");
      await openIt(next);
      return;
    }
    push("bot", promptFor(follow, fromWhatsapp));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = input;
    setInput("");
    void handle(value);
  };

  const started = msgs.some((m) => m.from === "you");

  return (
    <div className="ticket-chat">
      <div className="ticket-chat-log" ref={listRef}>
        {msgs.map((m) =>
          m.from === "bot" ? (
            <div key={m.id} className="ask-ai-row ask-ai-row-bot">
              <span className="ask-ai-mini" aria-hidden>
                <img src="/images/bit-mark-official.png" alt="" width={14} height={14} />
              </span>
              <p className="ask-ai-msg ask-ai-msg-bot">{m.text}</p>
            </div>
          ) : (
            <div key={m.id} className="ask-ai-row ask-ai-row-you">
              <p className="ask-ai-msg ask-ai-msg-you">{m.text}</p>
            </div>
          ),
        )}
        {busy ? (
          <div className="ask-ai-row ask-ai-row-bot">
            <span className="ask-ai-mini" aria-hidden>
              <img src="/images/bit-mark-official.png" alt="" width={14} height={14} />
            </span>
            <p className="ask-ai-msg ask-ai-msg-bot ask-ai-typing" aria-label="Opening ticket">
              <i />
              <i />
              <i />
            </p>
          </div>
        ) : null}
      </div>
      {!started ? (
        <div className="ask-ai-chips" aria-label="Suggested issues">
          {STARTERS.map((s) => (
            <button key={s} type="button" onClick={() => void handle(s)}>
              {s}
            </button>
          ))}
        </div>
      ) : null}
      <form className="ask-ai-form" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="ticket-chat-input">
          Message BIT AI
        </label>
        <input
          id="ticket-chat-input"
          ref={fieldRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What is broken…"
          autoComplete="off"
        />
        <button type="submit" aria-label="Send" disabled={!input.trim() || busy}>
          <ArrowUp size={16} strokeWidth={2.4} />
        </button>
      </form>
    </div>
  );
}
