import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  captureAttribution,
  recordCommittedConsultation,
  track,
  type Attribution,
} from "@/lib/tracking";
import { SITE } from "@/lib/site";
import {
  CONSULT_CONTACT_TIMES,
  CONSULT_REPLY_CHANNELS,
  CONSULT_SERVICE_DISPLAY_LABELS,
  CONSULT_SERVICE_OPTIONS,
} from "@/lib/consult-contract";
import { Turnstile, TURNSTILE_ENABLED } from "@/components/site/turnstile";
import { AMEETA_COORDINATOR_LABEL } from "@/lib/onboarding-contract";

export type ConsultIntent = "fleet" | "dental" | "general";

const INTEREST: Record<ConsultIntent, string> = {
  fleet: "Fleet operations — Ontario",
  dental: "Dental IT — Ontario",
  general: "General consultation",
};

export function ConsultForm({ intent, source }: { intent: ConsultIntent; source: string }) {
  const started = useRef(Date.now());
  const formStarted = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const servicesRef = useRef<HTMLFieldSetElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const submissionId = useRef("");
  const submissionInFlight = useRef(false);
  const [attr, setAttr] = useState<Attribution | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [servicesError, setServicesError] = useState(false);
  const [websiteError, setWebsiteError] = useState(false);
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
    if (submissionInFlight.current) return;
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
    const selectedServices = data.getAll("services").map(String);
    if (selectedServices.length === 0) {
      setServicesError(true);
      setError("Choose at least one service.");
      setStatus("error");
      servicesRef.current?.focus();
      track("form_error", { intent, source, reason: "services" });
      return;
    }
    setServicesError(false);
    if (data.get("service_inquiry_consent") !== "yes") {
      setError("Consent is required to contact you.");
      setStatus("error");
      track("form_error", { intent, source, reason: "consent" });
      return;
    }
    const preferredReply = String(data.get("preferred_reply") || "");
    const emailServiceUpdatesGranted = data.get("email_service_updates_consent") === "yes";
    const whatsappServiceUpdatesGranted = data.get("whatsapp_service_updates_consent") === "yes";
    if (preferredReply === "Email" && !emailServiceUpdatesGranted) {
      setError("Choose email service-update consent when your preferred reply is Email.");
      setStatus("error");
      track("form_error", { intent, source, reason: "preferred-channel-consent" });
      return;
    }
    if (preferredReply === "WhatsApp" && !whatsappServiceUpdatesGranted) {
      setError("Choose WhatsApp service-update consent when your preferred reply is WhatsApp.");
      setStatus("error");
      track("form_error", { intent, source, reason: "preferred-channel-consent" });
      return;
    }
    const websiteUrl = String(data.get("website_url") || "").trim();
    if (data.get("website_review_consent") === "yes" && !websiteUrl) {
      setWebsiteError(true);
      setError("Add the public website URL before authorizing a website review.");
      setStatus("error");
      websiteRef.current?.focus();
      track("form_error", { intent, source, reason: "website-review-consent" });
      return;
    }
    setWebsiteError(false);
    setStatus("sending");
    setError("");
    submissionInFlight.current = true;
    const body: Record<string, unknown> = Object.fromEntries(data.entries());
    body.services = selectedServices;
    body.service_inquiry_consent = true;
    body.service_callback_consent = data.get("service_callback_consent") === "yes";
    body.email_service_updates_consent = emailServiceUpdatesGranted;
    body.whatsapp_service_updates_consent = whatsappServiceUpdatesGranted;
    body.marketing_consent = data.get("marketing_consent") === "yes";
    body.website_review_consent = data.get("website_review_consent") === "yes";
    if (!websiteUrl) delete body.website_url;
    submissionId.current ||= window.crypto.randomUUID();
    body.submission_id = submissionId.current;
    body.turnstile_token = turnstileToken;
    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const responseBody = await res.json().catch(() => null);
      if (!res.ok) throw new Error("send");
      const result = recordCommittedConsultation(responseBody, {
        intent,
        source,
      });
      if (!result) throw new Error("send");
      if (result.qualified) track("qualified_form_submit", { intent, source });
      window.location.assign(`/thank-you?intent=${intent}`);
    } catch {
      submissionInFlight.current = false;
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
        <span className="form-fine">
          We collect a callback number so {AMEETA_COORDINATOR_LABEL} can help complete your request
          if needed. No automatic calls.
        </span>
      </label>
      <input type="hidden" name="interest" value={INTEREST[intent]} />
      <fieldset
        className="consult-qualification consult-services"
        ref={servicesRef}
        tabIndex={-1}
        aria-required="true"
        aria-invalid={servicesError}
        aria-describedby={servicesError ? "services-error" : undefined}
      >
        <legend>What can we help with? (choose one or more)</legend>
        <div className="consult-choice-grid">
          {CONSULT_SERVICE_OPTIONS.map((service) => (
            <label className="consult-choice" key={service}>
              <input
                type="checkbox"
                name="services"
                value={service}
                onChange={(event) => {
                  if (event.currentTarget.checked) setServicesError(false);
                }}
              />
              <span>{CONSULT_SERVICE_DISPLAY_LABELS[service]}</span>
            </label>
          ))}
        </div>
        {servicesError ? (
          <p id="services-error" className="form-err" role="alert">
            Choose at least one service.
          </p>
        ) : null}
      </fieldset>
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
        <textarea
          name="message"
          rows={4}
          maxLength={2000}
          aria-describedby="consult-message-sensitive-warning"
        />
        <span id="consult-message-sensitive-warning" className="form-fine">
          Do not include patient or health information, driver files, passwords, access codes,
          credentials, payment information, private client records, or sensitive security details.
        </span>
      </label>
      <fieldset className="consult-qualification">
        <legend>Website review (optional)</legend>
        <label>
          Public website URL
          <input
            ref={websiteRef}
            name="website_url"
            type="url"
            inputMode="url"
            autoComplete="url"
            maxLength={500}
            placeholder="https://example.com"
            aria-invalid={websiteError}
            aria-describedby={websiteError ? "website-url-error" : "website-review-scope"}
            onInput={() => setWebsiteError(false)}
          />
        </label>
        <label className="casl">
          <input
            type="checkbox"
            name="website_review_consent"
            value="yes"
            onChange={(event) => {
              if (!event.currentTarget.checked) setWebsiteError(false);
            }}
          />
          <span>
            You may review the public website I provide to prepare a high-level improvement note.
          </span>
        </label>
        {websiteError ? (
          <p id="website-url-error" className="form-err" role="alert">
            Add the public website URL before authorizing a website review.
          </p>
        ) : null}
        <p id="website-review-scope" className="form-fine">
          A URL alone does not authorize crawling, security scanning, or access to hidden/private
          information.
        </p>
      </fieldset>
      <div className="consult-preferences">
        <label>
          Preferred contact time
          <select name="preferred_contact_time" defaultValue="" required>
            <option value="" disabled>
              Choose a time
            </option>
            {CONSULT_CONTACT_TIMES.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>
        <label>
          Preferred reply
          <select name="preferred_reply" defaultValue="" required>
            <option value="" disabled>
              Choose a reply method
            </option>
            {CONSULT_REPLY_CHANNELS.map((channel) => (
              <option key={channel} value={channel}>
                {channel}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Turnstile onToken={receiveTurnstileToken} />
      <p className="form-fine">
        When enabled, Cloudflare Turnstile processes its verification token and the request IP to
        prevent automated abuse.
      </p>
      <input type="hidden" name="turnstile_token" value={turnstileToken} readOnly />
      <label className="casl">
        <input type="checkbox" name="service_inquiry_consent" value="yes" required />
        <span>
          I consent to BIT Solution contacting me about this service inquiry using my preferred
          reply method. {AMEETA_COORDINATOR_LABEL} is the initial coordinator. No automatic calls.
          I can withdraw consent any time. See the{" "}
          <Link to="/privacy">privacy notice</Link>.
        </span>
      </label>
      <label className="casl">
        <input type="checkbox" name="service_callback_consent" value="yes" required />
        <span>
          I agree that Ameeta may call the number I provided to help complete this service request
          if details are missing. This is not an automatic call or marketing consent.
        </span>
      </label>
      <label className="casl">
        <input type="checkbox" name="email_service_updates_consent" value="yes" />
        <span>
          I agree to receive email service updates for this request. This is not marketing.
        </span>
      </label>
      <label className="casl">
        <input type="checkbox" name="whatsapp_service_updates_consent" value="yes" />
        <span>
          I agree to receive WhatsApp service updates for this request. WhatsApp remains unavailable
          until BIT Solution’s approved business channel and message template are enabled. This is
          not marketing.
        </span>
      </label>
      <label className="casl">
        <input type="checkbox" name="marketing_consent" value="yes" />
        <span>
          I would like occasional BIT Solution marketing emails. This is optional and is not
          required for a service reply.
        </span>
      </label>
      {error ? (
        <p id="consult-form-error" className="form-err" role="alert" tabIndex={-1} ref={errorRef}>
          {error} <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a>
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "sending" || (TURNSTILE_ENABLED && !turnstileToken)}
      >
        {status === "sending" ? "Sending…" : "Book a consultation"}
      </button>
      <p className="form-fine">
        Service, callback, email-update, WhatsApp-update, website-review, and marketing permissions
        are recorded separately. We do not sell your information.
      </p>
    </form>
  );
}
