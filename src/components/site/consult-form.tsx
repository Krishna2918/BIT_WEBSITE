import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { captureAttribution, track, type Attribution } from "@/lib/tracking";
import { SITE } from "@/lib/site";
import { CONSULT_INTERESTS } from "@/lib/consult-contract";
import { Turnstile, TURNSTILE_ENABLED } from "@/components/site/turnstile";

export type ConsultIntent = "fleet" | "dental" | "general";

const INTEREST: Record<ConsultIntent, string> = {
  fleet: "Fleet operations — Ontario",
  dental: "Dental IT — Ontario",
  general: "General consultation",
};

export function ConsultForm({
  intent,
  source,
}: {
  intent: ConsultIntent;
  source: string;
}) {
  const started = useRef(Date.now());
  const formStarted = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const submissionId = useRef("");
  const [attr, setAttr] = useState<Attribution | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const receiveTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  useEffect(() => {
    setAttr(captureAttribution());
  }, []);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  function markStarted() {
    if (formStarted.current) return;
    formStarted.current = true;
    track("consultation_form_start", { intent, source });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (String(data.get("company_website") || "").trim()) {
      window.location.assign("/thank-you");
      return;
    }
    if (Date.now() - started.current < 1600) {
      setError("Please take a moment to review your details.");
      setStatus("error");
      track("form_error", { intent, source, reason: "timing" });
      return;
    }
    if (data.get("casl") !== "yes") {
      setError("Consent is required to contact you.");
      setStatus("error");
      track("form_error", { intent, source, reason: "consent" });
      return;
    }
    setStatus("sending");
    setError("");
    const body = Object.fromEntries(data.entries());
    submissionId.current ||= window.crypto.randomUUID();
    body.submission_id = submissionId.current;
    body.turnstile_token = turnstileToken;
    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await res.json().catch(() => null)) as
        | { ok?: boolean; qualified?: boolean }
        | null;
      if (!res.ok || !result?.ok) throw new Error("send");
      track("consultation_form_submit", { intent, source });
      if (result.qualified) track("qualified_form_submit", { intent, source });
      window.location.assign(`/thank-you?intent=${intent}`);
    } catch {
      setStatus("error");
      setError("We could not deliver your request. Nothing was recorded. Please call us.");
      track("form_error", { intent, source, reason: "delivery" });
    }
  }

  return (
    <form
      className="consult-form"
      onSubmit={onSubmit}
      onFocusCapture={markStarted}
      onInvalid={() => track("form_error", { intent, source, reason: "validation" })}
      noValidate={false}
    >
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="gclid" value={attr?.gclid ?? ""} />
      <input type="hidden" name="utm_source" value={attr?.utm_source ?? ""} />
      <input type="hidden" name="utm_medium" value={attr?.utm_medium ?? ""} />
      <input type="hidden" name="utm_campaign" value={attr?.utm_campaign ?? ""} />
      <input type="hidden" name="utm_term" value={attr?.utm_term ?? ""} />
      <input type="hidden" name="utm_content" value={attr?.utm_content ?? ""} />
      <input type="hidden" name="msclkid" value={attr?.msclkid ?? ""} />
      <input type="hidden" name="fbclid" value={attr?.fbclid ?? ""} />
      <input type="hidden" name="landing_page" value={attr?.landing_page ?? ""} />
      <input type="hidden" name="referrer" value={attr?.referrer ?? ""} />

      <div className="hp" aria-hidden="true">
        <label htmlFor="company_website">Website</label>
        <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>

      <label>
        Full name
        <input name="name" type="text" required autoComplete="name" maxLength={120} />
      </label>
      <label>
        Company
        <input name="company" type="text" required autoComplete="organization" maxLength={160} />
      </label>
      <label>
        Work email
        <input name="email" type="email" required autoComplete="email" maxLength={160} />
      </label>
      <label>
        Phone
        <input name="phone" type="tel" required autoComplete="tel" maxLength={40} />
      </label>
      <label>
        What do you need
        <select name="interest" defaultValue={INTEREST[intent]} required>
          {CONSULT_INTERESTS.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </label>
      {intent === "fleet" ? (
        <fieldset className="consult-qualification">
          <legend>Fleet details</legend>
          <label>
            Number of power units
            <input name="power_units" type="number" min={1} max={10000} required />
          </label>
          <label>
            ELD or telematics provider
            <input name="eld_telematics_provider" type="text" required maxLength={160} />
          </label>
          <label>
            Main dispatch bottleneck
            <textarea name="dispatch_bottlenecks" rows={3} required maxLength={500} />
          </label>
        </fieldset>
      ) : null}
      {intent === "dental" ? (
        <fieldset className="consult-qualification">
          <legend>Practice details</legend>
          <label>
            Number of operatories
            <input name="operatory_count" type="number" min={1} max={1000} required />
          </label>
          <label>
            Practice-management software
            <input name="practice_software" type="text" required maxLength={160} />
          </label>
          <label>
            Current backup frequency
            <input name="backup_frequency" type="text" required maxLength={160} />
          </label>
        </fieldset>
      ) : null}
      <label>
        Anything we should know
        <textarea name="message" rows={4} maxLength={2000} />
      </label>
      <Turnstile onToken={receiveTurnstileToken} />
      <input type="hidden" name="turnstile_token" value={turnstileToken} readOnly />
      <label className="casl">
        <input type="checkbox" name="casl" value="yes" required />
        <span>
          I consent to BIT Solution contacting me about this request by email or
          phone. I can withdraw consent any time. See the{" "}
          <Link to="/privacy">privacy notice</Link>.
        </span>
      </label>
      {error ? (
        <p className="form-err" role="alert" tabIndex={-1} ref={errorRef}>
          {error}{" "}
          <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a>
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "sending" || (TURNSTILE_ENABLED && !turnstileToken)}
      >
        {status === "sending" ? "Sending…" : "Book a consultation"}
      </button>
      <p className="form-fine">
        Canadian Anti-Spam Legislation (CASL) consent. We do not sell your
        information.
      </p>
    </form>
  );
}
