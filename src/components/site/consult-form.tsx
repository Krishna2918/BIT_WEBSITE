import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { captureAttribution, setMeasurementConsent, type Attribution } from "@/lib/tracking";

export type ConsultIntent = "fleet" | "dental" | "general";

const INTEREST: Record<ConsultIntent, string> = {
  fleet: "Fleet operations — Ontario",
  dental: "Dental IT — Ontario",
  general: "General consultation",
};

const INTEREST_OPTIONS = [
  INTEREST.general,
  INTEREST.fleet,
  INTEREST.dental,
  "Digital marketing",
  "Procurement",
  "VoIP & phones",
  "Software",
  "Hardware",
  "AI",
  "Security",
  "Support",
];

export function ConsultForm({
  intent,
  source,
}: {
  intent: ConsultIntent;
  source: string;
}) {
  const started = useRef(Date.now());
  const [attr, setAttr] = useState<Attribution | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    setAttr(captureAttribution());
  }, []);

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
      return;
    }
    if (data.get("casl") !== "yes") {
      setError("Consent is required to contact you.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    const body = Object.fromEntries(data.entries());
    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("send");
      const json = (await res.json()) as { ok?: boolean; transaction_id?: string };
      const measure = data.get("measure") === "yes";
      setMeasurementConsent(measure);
      const qs = new URLSearchParams({ intent });
      if (measure) qs.set("measure", "1");
      if (json.transaction_id) qs.set("tid", json.transaction_id);
      window.location.assign(`/thank-you?${qs.toString()}`);
    } catch {
      setStatus("error");
      setError("We could not send that. Call us or try again.");
    }
  }

  return (
    <form className="consult-form" onSubmit={onSubmit} noValidate={false}>
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
          {INTEREST_OPTIONS.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </label>
      <label>
        Anything we should know
        <textarea name="message" rows={4} maxLength={2000} />
      </label>
      <label className="casl">
        <input type="checkbox" name="casl" value="yes" required />
        <span>
          I consent to BIT Solution contacting me about this request by email or
          phone. I can withdraw consent any time. See the{" "}
          <Link to="/privacy">privacy notice</Link>.
        </span>
      </label>
      <label className="casl">
        <input type="checkbox" name="measure" value="yes" />
        <span>
          Allow conversion measurement cookies so we can tell if an advertisement
          brought you here. Optional. Off unless you tick this box.
        </span>
      </label>
      {error ? (
        <p className="form-err" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Book a consultation"}
      </button>
      <p className="form-fine">
        Canadian Anti-Spam Legislation (CASL) consent. We do not sell your
        information.
      </p>
    </form>
  );
}
