import { Link } from "@tanstack/react-router";
import { ArrowUp, CircleHelp, Mail, MessageCircle, Phone, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { openConfiguredChatwoot } from "@/lib/chatwoot";
import {
  askPublicAssistant,
  getPublicAssistantConfig,
  wantsHumanSupport,
  wantsTicketSupport,
} from "@/lib/public-assistant";
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

const PUBLIC_ASSISTANT_CONFIG = getPublicAssistantConfig(import.meta.env);
const MODAL_FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
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
          track("ai_chat_open", { source: "globe" });
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
            to="/ticket"
            className="help-row"
            onClick={() => {
              setOpen(false);
              track("ticket_open", { source: "help" });
            }}
          >
            <CircleHelp size={16} strokeWidth={2.1} />
            <span>
              <strong>IT ticket</strong>
              AI sorts it · Helpdesk approves
            </span>
          </Link>
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
              track("ai_chat_open", { source: "help" });
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
  const [assistantConsent, setAssistantConsent] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [supportNote, setSupportNote] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    {
      id: 0,
      from: "bot",
      text: "Ask a general question. BIT AI uses approved public FAQ grounding; a person handles support.",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("bit-ask-ai", onOpen);
    return () => {
      window.removeEventListener("bit-ask-ai", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusId = window.setTimeout(() => {
      if (PUBLIC_ASSISTANT_CONFIG.enabled) inputRef.current?.focus();
      else closeButtonRef.current?.focus();
    }, 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(MODAL_FOCUSABLE)).filter(
        (element) => element.tabIndex >= 0 && element.getAttribute("aria-hidden") !== "true",
      );
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusId);
      window.removeEventListener("keydown", onKeyDown);
      const previousFocus = previousFocusRef.current;
      previousFocusRef.current = null;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, waiting, open]);

  const push = (from: Msg["from"], text: string) => {
    setMsgs((current) => [...current, { id: msgSeq++, from, text }]);
  };

  const openHumanChat = async (source: string): Promise<boolean> => {
    setSupportNote("");
    try {
      const opened = await openConfiguredChatwoot();
      if (!opened) {
        setSupportNote("Live chat is not configured here yet. Please call, WhatsApp, or email us.");
        return false;
      }
      setOpen(false);
      track("ai_chat_handoff_request", { source });
      return true;
    } catch {
      setSupportNote("Live chat is unavailable right now. Please call, WhatsApp, or email us.");
      return false;
    }
  };

  const ask = async (text: string) => {
    const clean = text.trim();
    if (!clean || waiting || !PUBLIC_ASSISTANT_CONFIG.enabled) return;
    if (!assistantConsent) {
      setSupportNote("Choose the Ask AI service-processing consent before sending a question.");
      return;
    }
    push("you", clean);
    setWaiting(true);
    setSupportNote("");
    try {
      if (wantsTicketSupport(clean)) {
        push(
          "bot",
          "That sounds like an IT ticket. Open the ticket form and BIT OS will sort client, work, and urgency. BIT Helpdesk approves before any PC work.",
        );
        window.location.assign("/ticket");
        return;
      }
      if (wantsHumanSupport(clean)) {
        const opened = await openHumanChat("ask-ai-explicit-human-request");
        if (!opened) push("bot", "A person should handle this, but live chat could not be opened.");
        return;
      }
      const result = await askPublicAssistant(clean, assistantConsent);
      push(
        "bot",
        result.kind === "answer" && result.mode === "faq"
          ? `Live AI could not decide, so this is the verified FAQ fallback: ${result.text}`
          : result.text,
      );
      if (result.kind === "handoff") {
        const opened = await openHumanChat("ask-ai-backend-handoff");
        if (!opened) push("bot", "Use one of the human support options below.");
      }
    } catch {
      push("bot", "The verified AI service is unavailable. No answer was generated.");
      const opened = await openHumanChat("ask-ai-request-error");
      if (!opened) push("bot", "Use one of the human support options below.");
    } finally {
      setWaiting(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const question = draft;
    setDraft("");
    void ask(question);
  };

  const started = msgs.some((message) => message.from === "you");

  if (!open) return null;

  if (!PUBLIC_ASSISTANT_CONFIG.enabled) {
    return (
      <div className="ask-ai ask-ai-open">
        <button
          type="button"
          className="ask-ai-scrim"
          aria-label="Close chat"
          onClick={() => setOpen(false)}
        />
        <section
          ref={panelRef}
          className="ask-ai-panel help-panel"
          role="dialog"
          aria-label="AI support unavailable"
          aria-modal="true"
          tabIndex={-1}
        >
          <header className="ask-ai-head">
            <div className="ask-ai-brand">
              <span className="ask-ai-avatar" aria-hidden>
                <img src="/images/bit-mark-official.png" alt="" width={22} height={22} />
              </span>
              <div>
                <p className="ask-ai-kicker">BIT AI</p>
                <p className="ask-ai-sub">Live AI is not active here yet</p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              className="ask-ai-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X size={16} strokeWidth={2.25} />
            </button>
          </header>
          <div className="help-body">
            <p className="help-lead">
              The server-side AI service is not configured for this website. No AI answer was
              generated. Choose a human support option and do not send passwords, access codes,
              payment details, or other secrets. Live chat is separate: no Ask AI transcript is
              transferred, so repeat your question there.
            </p>
            <button
              type="button"
              className="help-row"
              onClick={() => void openHumanChat("ask-ai-disabled-explicit-human-request")}
            >
              <MessageCircle size={16} strokeWidth={2.1} />
              <span>
                <strong>Live chat</strong>
                Talk to a person
              </span>
            </button>
            {supportNote ? <p className="help-lead" role="status">{supportNote}</p> : null}
            <a
              href={SITE.whatsappHref}
              className="help-row"
              target="_blank"
              rel="noreferrer"
              onClick={() => track("whatsapp_click", { source: "ask-ai-fallback" })}
            >
              <MessageCircle size={16} strokeWidth={2.1} />
              <span>
                <strong>WhatsApp</strong>
                {SITE.whatsappDisplay}
              </span>
            </a>
            <a
              href={SITE.phoneHref}
              className="help-row callrail rTapNumber"
              onClick={() => track("click_to_call", { source: "ask-ai-fallback" })}
            >
              <Phone size={16} strokeWidth={2.1} />
              <span>
                <strong>Call</strong>
                {SITE.phoneDisplay}
              </span>
            </a>
            <a href={`mailto:${SITE.supportEmail}`} className="help-row">
              <Mail size={16} strokeWidth={2.1} />
              <span>
                <strong>Email support</strong>
                {SITE.supportEmail}
              </span>
            </a>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="ask-ai ask-ai-open">
      <button
        type="button"
        className="ask-ai-scrim"
        aria-label="Close chat"
        onClick={() => setOpen(false)}
      />
      <section
        ref={panelRef}
        className="ask-ai-panel"
        role="dialog"
        aria-label="Ask BIT AI"
        aria-modal="true"
        tabIndex={-1}
      >
        <header className="ask-ai-head">
          <div className="ask-ai-brand">
            <span className="ask-ai-avatar" aria-hidden>
              <img src="/images/bit-mark-official.png" alt="" width={22} height={22} />
            </span>
            <div>
              <p className="ask-ai-kicker">BIT AI</p>
              <p className="ask-ai-sub">FAQ-grounded AI · human handoff available</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="ask-ai-close"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X size={16} strokeWidth={2.25} />
          </button>
        </header>

        <div className="ask-ai-log" ref={listRef} aria-live="polite">
          {msgs.map((message) =>
            message.from === "bot" ? (
              <div key={message.id} className="ask-ai-row ask-ai-row-bot">
                <span className="ask-ai-mini" aria-hidden>
                  <img src="/images/bit-mark-official.png" alt="" width={14} height={14} />
                </span>
                <p className="ask-ai-msg ask-ai-msg-bot">{message.text}</p>
              </div>
            ) : (
              <div key={message.id} className="ask-ai-row ask-ai-row-you">
                <p className="ask-ai-msg ask-ai-msg-you">{message.text}</p>
              </div>
            ),
          )}
          {waiting ? (
            <div className="ask-ai-row ask-ai-row-bot">
              <span className="ask-ai-mini" aria-hidden>
                <img src="/images/bit-mark-official.png" alt="" width={14} height={14} />
              </span>
              <p
                className="ask-ai-msg ask-ai-msg-bot ask-ai-typing"
                aria-label="Waiting for the verified assistant"
              >
                <i />
                <i />
                <i />
              </p>
            </div>
          ) : null}
        </div>

        {supportNote ? <p className="help-lead" role="status">{supportNote}</p> : null}

        {!started ? (
          <div className="ask-ai-chips" aria-label="Suggested questions">
            {STARTERS.map((starter) => (
              <button
                key={starter.id}
                type="button"
                disabled={!assistantConsent || waiting}
                onClick={() => void ask(starter.label)}
              >
                {starter.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="ask-ai-consent">
          <label>
            <input
              type="checkbox"
              checked={assistantConsent}
              onChange={(event) => {
                setAssistantConsent(event.currentTarget.checked);
                setSupportNote("");
              }}
            />
            <span>
              I agree that BIT Solution may process my question through its server FAQ service and
              use Vercel AI Gateway and OpenAI for a limited answer-or-handoff decision. This is
              service processing, not marketing consent.
            </span>
          </label>
          <p id="ask-ai-sensitive-warning">
            Do not include patient or health information, driver files, passwords, access codes,
            credentials, payment information, private client records, or sensitive security
            details. Human live chat uses Chatwoot separately. Your Ask AI transcript is not
            transferred; repeat your question in live chat.
          </p>
        </div>

        <form className="ask-ai-form" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="ask-ai-input">
            Ask BIT AI
          </label>
          <input
            id="ask-ai-input"
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask a general question…"
            autoComplete="off"
            maxLength={2000}
            disabled={!assistantConsent || waiting}
            aria-describedby="ask-ai-sensitive-warning"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!assistantConsent || !draft.trim() || waiting}
          >
            <ArrowUp size={16} strokeWidth={2.4} />
          </button>
        </form>

        <footer className="ask-ai-foot">
          <button
            type="button"
            className="ask-ai-book ask-ai-human"
            onClick={() => void openHumanChat("ask-ai-explicit-human-button")}
          >
            Chat with a person
          </button>
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
