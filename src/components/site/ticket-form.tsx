import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import {
  isSafeWhatsappHref,
  TICKET_IMPACT_LABELS,
  TICKET_IMPACTS,
  TICKET_MESSAGE_MAX_LENGTH,
  TICKET_SOURCE,
  type TicketApiSuccess,
} from "@/lib/ticket-intake";
import { track } from "@/lib/tracking";

type Done =
  | { kind: "work"; workId: string }
  | { kind: "whatsapp"; href: string }
  | { kind: "helpdesk" };

export function TicketForm({ source }: { source: string }) {
  const formStarted = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  function markStarted() {
    if (formStarted.current) return;
    formStarted.current = true;
    track("ticket_form_start", { source });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setError("");
    const body = {
      company: String(data.get("company") || "").trim(),
      email: String(data.get("email") || "").trim(),
      name: String(data.get("name") || "").trim(),
      hostname: String(data.get("hostname") || "").trim(),
      impact: String(data.get("impact") || "").trim(),
      message: String(data.get("message") || "").trim(),
      source: TICKET_SOURCE,
    };
    try {
      const res = await fetch("/api/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await res.json().catch(() => null)) as TicketApiSuccess | { ok?: boolean } | null;
      if (!res.ok || !result?.ok) throw new Error("send");
      const success = result as TicketApiSuccess;
      track("ticket_form_submit", { source, door: success.door || "helpdesk" });
      if (success.door === "whatsapp" && success.href && isSafeWhatsappHref(success.href)) {
        window.open(success.href, "_blank", "noopener,noreferrer");
        setDone({ kind: "whatsapp", href: success.href });
        return;
      }
      if (success.work_id) {
        setDone({ kind: "work", workId: success.work_id });
        return;
      }
      setDone({ kind: "helpdesk" });
    } catch {
      setStatus("error");
      setError("We could not send that. Call or WhatsApp us.");
      track("form_error", { source, reason: "ticket-delivery" });
    }
  }

  if (done) {
    return (
      <div className="consult-form" role="status">
        <p className="text-[18px] font-semibold text-ink">
          {done.kind === "work"
            ? `Helpdesk has it. Work ID ${done.workId}.`
            : done.kind === "whatsapp"
              ? "Helpdesk has it. WhatsApp opened with your note."
              : "Helpdesk has it."}
        </p>
        <p className="form-fine">
          A person in Ontario will take it. If it is urgent, call or WhatsApp {SITE.phoneDisplay}.
        </p>
        {done.kind === "whatsapp" ? (
          <p>
            <a className="text-link" href={done.href} target="_blank" rel="noreferrer">
              Open WhatsApp again
            </a>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form className="consult-form" onSubmit={onSubmit} onFocusCapture={markStarted}>
      <label>
        Company
        <input name="company" type="text" required autoComplete="organization" maxLength={160} />
      </label>
      <label>
        Work email
        <input name="email" type="email" required autoComplete="email" maxLength={160} />
      </label>
      <label>
        Your name
        <input name="name" type="text" autoComplete="name" maxLength={120} />
        <span className="form-fine">Optional.</span>
      </label>
      <label>
        PC name / hostname
        <input name="hostname" type="text" autoComplete="off" maxLength={120} />
        <span className="form-fine">Optional. The name on the computer, if you know it.</span>
      </label>
      <label>
        How bad is it
        <select name="impact" defaultValue="">
          <option value="">Optional</option>
          {TICKET_IMPACTS.map((impact) => (
            <option key={impact} value={impact}>
              {TICKET_IMPACT_LABELS[impact]}
            </option>
          ))}
        </select>
        <span className="form-fine">One person, or the whole office.</span>
      </label>
      <label>
        What is broken
        <textarea
          name="message"
          rows={5}
          required
          maxLength={TICKET_MESSAGE_MAX_LENGTH}
          aria-describedby="ticket-message-warning"
        />
        <span id="ticket-message-warning" className="form-fine">
          Do not send passwords, access codes, or payment details.
        </span>
      </label>
      {error ? (
        <p id="ticket-form-error" className="form-err" role="alert" tabIndex={-1} ref={errorRef}>
          {error}{" "}
          <a href={SITE.phoneHref} className="callrail rTapNumber">
            {SITE.phoneDisplay}
          </a>
        </p>
      ) : null}
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send ticket"}
      </button>
      <p className="form-fine">
        We use this to open a Helpdesk ticket. See the <Link to="/privacy">privacy notice</Link>.
      </p>
    </form>
  );
}
