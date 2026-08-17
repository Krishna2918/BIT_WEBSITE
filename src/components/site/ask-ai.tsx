import { Link } from "@tanstack/react-router";
import { ArrowUp, CircleHelp, Mail, MessageCircle, Phone, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { SITE } from "@/lib/site";
import { track } from "@/lib/tracking";

type Msg = { id: number; from: "bot" | "you"; text: string };

const STARTERS = [
  { id: "what", label: "What does BIT do?" },
  { id: "software", label: "Software" },
  { id: "hardware", label: "Hardware" },
  { id: "ai", label: "AI" },
  { id: "security", label: "Security" },
  { id: "book", label: "Book a consult" },
] as const;

function replyFor(input: string): string {
  const q = input.toLowerCase();
  if (/(book|consult|call|meeting|quote)/.test(q)) {
    return `I can get you to a person. Book a consult, call, or WhatsApp ${SITE.phoneDisplay}. We cover all of Ontario.`;
  }
  if (/(software|app|fleet|erp|clinic)/.test(q)) {
    return "Software is the first door. Fleet, college ERP, clinic systems, and custom builds — same team that runs the hardware under it.";
  }
  if (/(hardware|server|camera|phone|network|pc)/.test(q)) {
    return "Hardware is the machines: cameras, private servers, PCs, network, phones. We assemble and stay with them.";
  }
  if (/(security|cyber|firewall|backup)/.test(q)) {
    return "Security is the shell around the rest. Watches, locks devices, keeps copies, and recovers when something breaks.";
  }
  if (/(ai|bot|chat|ticket|support)/.test(q)) {
    return "BIT AI stays on for tickets and checks. A person steps in when they should. That is the product — not a toy chatbot.";
  }
  if (/(price|cost|how much)/.test(q)) {
    return "Pricing depends on the floor. Tell us the site and the stack and we will price a real consult — not a menu.";
  }
  if (/(where|brampton|gta|ontario|location)/.test(q)) {
    return `${SITE.address}. We cover all of Ontario from Brampton HQ.`;
  }
  if (/(hipaa|phipa|pipeda|compliance|dental|fleet)/.test(q)) {
    return "Compliance sits on the sector pages — PHIPA, PIPEDA, MTO / CVOR, and the rest. Open Sectors, or book a consult and we walk the floor.";
  }
  return "Four parts, one flag: software, hardware, AI, and security. Pick a door below, or book a consult and a person will take it from here.";
}

let msgSeq = 1;

export function openAskAi() {
  window.dispatchEvent(new Event("bit-ask-ai"));
}

export function openHelp() {
  window.dispatchEvent(new Event("bit-help"));
}

function Spark({ className }: { className?: string }) {
  return <Sparkles className={className} size={14} strokeWidth={2.2} />;
}

function GlobeButton({
  children,
  icon,
  onClick,
  to,
}: {
  children: string;
  icon: ReactNode;
  onClick?: () => void;
  to?: "/consult";
}) {
  const inner = (
    <span className="globe-btn-inner">
      <span className="globe-btn-icon" aria-hidden>
        {icon}
      </span>
      <span className="globe-btn-label">{children}</span>
    </span>
  );
  if (to) {
    return (
      <Link to={to} className="globe-btn" onClick={onClick}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className="globe-btn" onClick={onClick}>
      {inner}
    </button>
  );
}

export function HeroGlobeActions() {
  return (
    <div className="globe-btns">
      <GlobeButton
        to="/consult"
        icon={<Mail size={14} strokeWidth={2.2} />}
        onClick={() => track("book_consult_click", { source: "globe-contact" })}
      >
        Contact us
      </GlobeButton>
      <GlobeButton
        icon={<CircleHelp size={14} strokeWidth={2.2} />}
        onClick={() => {
          openHelp();
          track("help_open", { source: "globe" });
        }}
      >
        Help
      </GlobeButton>
      <GlobeButton
        icon={<Spark />}
        onClick={() => {
          openAskAi();
          track("ask_ai_open", { source: "globe" });
        }}
      >
        Ask AI
      </GlobeButton>
    </div>
  );
}

export function HelpSheet() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("bit-help", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("bit-help", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="ask-ai ask-ai-open">
      <button
        type="button"
        className="ask-ai-scrim"
        aria-label="Close help"
        onClick={() => setOpen(false)}
      />
      <section className="ask-ai-panel help-panel" role="dialog" aria-label="Help" aria-modal="true">
        <header className="ask-ai-head">
          <div className="ask-ai-brand">
            <span className="ask-ai-avatar" aria-hidden>
              <img src="/images/bit-mark-official.png" alt="" width={22} height={22} />
            </span>
            <div>
              <p className="ask-ai-kicker">Help</p>
              <p className="ask-ai-sub">
                <span className="ask-ai-live" />
                A person in Ontario · 24/7
              </p>
            </div>
          </div>
          <button type="button" className="ask-ai-close" onClick={() => setOpen(false)} aria-label="Close">
            <X size={16} strokeWidth={2.25} />
          </button>
        </header>
        <div className="help-body">
          <p className="help-lead">
            Need a hand with software, hardware, AI, or security? Talk to us — or ask BIT AI
            for a quick pointer.
          </p>
          <a
            href={SITE.phoneHref}
            className="help-row callrail rTapNumber"
            onClick={() => track("click_to_call", { source: "help" })}
          >
            <Phone size={16} strokeWidth={2.1} />
            <span>
              <strong>Call</strong>
              {SITE.phoneDisplay}
            </span>
          </a>
          <a
            href={SITE.whatsappHref}
            className="help-row"
            target="_blank"
            rel="noreferrer"
            onClick={() => track("whatsapp_click", { source: "help" })}
          >
            <MessageCircle size={16} strokeWidth={2.1} />
            <span>
              <strong>WhatsApp</strong>
              {SITE.whatsappDisplay}
            </span>
          </a>
          <a
            href={`mailto:${SITE.email}`}
            className="help-row"
            onClick={() => track("email_click", { source: "help" })}
          >
            <Mail size={16} strokeWidth={2.1} />
            <span>
              <strong>Email</strong>
              {SITE.email}
            </span>
          </a>
          <Link
            to="/consult"
            className="help-row"
            onClick={() => {
              setOpen(false);
              track("book_consult_click", { source: "help" });
            }}
          >
            <CircleHelp size={16} strokeWidth={2.1} />
            <span>
              <strong>Contact us</strong>
              Book a consultation
            </span>
          </Link>
          <button
            type="button"
            className="help-row"
            onClick={() => {
              setOpen(false);
              openAskAi();
              track("ask_ai_open", { source: "help" });
            }}
          >
            <Spark />
            <span>
              <strong>Ask BIT AI</strong>
              Instant answers
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}

export function AskAiChat() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    {
      id: 0,
      from: "bot",
      text: "Hi — I am BIT AI. I can point you to the right door. A person takes over when it matters.",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("bit-ask-ai", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("bit-ask-ai", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, open]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const push = (from: Msg["from"], text: string) => {
    setMsgs((m) => [...m, { id: msgSeq++, from, text }]);
  };

  const ask = (text: string) => {
    const clean = text.trim();
    if (!clean || typing) return;
    push("you", clean);
    setTyping(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      push("bot", replyFor(clean));
      setTyping(false);
    }, 480);
    track("ask_ai", { source: "widget" });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(draft);
    setDraft("");
  };

  const started = msgs.some((m) => m.from === "you");

  if (!open) return null;

  return (
    <div className="ask-ai ask-ai-open">
      <button
        type="button"
        className="ask-ai-scrim"
        aria-label="Close chat"
        onClick={() => setOpen(false)}
      />
      <section className="ask-ai-panel" role="dialog" aria-label="Ask BIT AI" aria-modal="true">
        <header className="ask-ai-head">
          <div className="ask-ai-brand">
            <span className="ask-ai-avatar" aria-hidden>
              <img src="/images/bit-mark-official.png" alt="" width={22} height={22} />
            </span>
            <div>
              <p className="ask-ai-kicker">BIT AI</p>
              <p className="ask-ai-sub">
                <span className="ask-ai-live" />
                Online · a person when it matters
              </p>
            </div>
          </div>
          <button type="button" className="ask-ai-close" onClick={() => setOpen(false)} aria-label="Close">
            <X size={16} strokeWidth={2.25} />
          </button>
        </header>

        <div className="ask-ai-log" ref={listRef}>
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
          {typing ? (
            <div className="ask-ai-row ask-ai-row-bot">
              <span className="ask-ai-mini" aria-hidden>
                <img src="/images/bit-mark-official.png" alt="" width={14} height={14} />
              </span>
              <p className="ask-ai-msg ask-ai-msg-bot ask-ai-typing" aria-label="BIT AI is typing">
                <i />
                <i />
                <i />
              </p>
            </div>
          ) : null}
        </div>

        {!started ? (
          <div className="ask-ai-chips" aria-label="Suggested questions">
            {STARTERS.map((s) => (
              <button key={s.id} type="button" onClick={() => ask(s.label)}>
                {s.label}
              </button>
            ))}
          </div>
        ) : null}

        <form className="ask-ai-form" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="ask-ai-input">
            Ask BIT AI
          </label>
          <input
            id="ask-ai-input"
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about software, hardware, AI…"
            autoComplete="off"
          />
          <button type="submit" aria-label="Send" disabled={!draft.trim() || typing}>
            <ArrowUp size={16} strokeWidth={2.4} />
          </button>
        </form>

        <footer className="ask-ai-foot">
          <Link
            to="/consult"
            className="ask-ai-book"
            onClick={() => track("book_consult_click", { source: "ask-ai" })}
          >
            Book a consultation
          </Link>
          <span className="ask-ai-dot" aria-hidden>
            ·
          </span>
          <a href={SITE.phoneHref} className="ask-ai-call callrail rTapNumber">
            {SITE.phoneDisplay}
          </a>
          <span className="ask-ai-dot" aria-hidden>
            ·
          </span>
          <a
            href={SITE.whatsappHref}
            className="ask-ai-call"
            target="_blank"
            rel="noreferrer"
            onClick={() => track("whatsapp_click", { source: "ask-ai" })}
          >
            WhatsApp
          </a>
        </footer>
      </section>
    </div>
  );
}
