import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CONSENT_CHANGED_EVENT,
  CONSENT_OPEN_EVENT,
  readAnalyticsConsent,
  writeAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/consent";

export function CookieConsent() {
  const [choice, setChoice] = useState<AnalyticsConsent>(null);
  const [open, setOpen] = useState(false);
  const [manage, setManage] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const saved = readAnalyticsConsent();
    setChoice(saved);
    setAnalytics(saved === "granted");
    setOpen(saved === null);

    const reopen = () => {
      const current = readAnalyticsConsent();
      setAnalytics(current === "granted");
      setManage(true);
      setOpen(true);
    };
    const sync = (event: Event) => {
      const value = (event as CustomEvent<"granted" | "denied">).detail;
      setChoice(value);
      setAnalytics(value === "granted");
    };
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    window.addEventListener(CONSENT_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
      window.removeEventListener(CONSENT_CHANGED_EVENT, sync);
    };
  }, []);

  function save(value: "granted" | "denied") {
    writeAnalyticsConsent(value);
    setChoice(value);
    setAnalytics(value === "granted");
    setManage(false);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <section
      className="cookie-consent"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-copy"
    >
      <div className="cookie-consent-inner">
        <div>
          <p className="cookie-consent-kicker">Privacy choices</p>
          <h2 id="cookie-consent-title">
            {manage ? "Manage cookies" : "Your choice comes first."}
          </h2>
          <p id="cookie-consent-copy">
            Essential storage keeps the site working. Optional analytics will
            stay off unless you allow it. We never send form or chat content to
            analytics. <Link to="/privacy">Read the privacy notice</Link>.
          </p>
        </div>

        {manage ? (
          <div className="cookie-consent-options">
            <label>
              <span>
                <strong>Essential</strong>
                <small>Required for core website functions.</small>
              </span>
              <input type="checkbox" checked disabled aria-label="Essential cookies enabled" />
            </label>
            <label>
              <span>
                <strong>Analytics</strong>
                <small>Helps us measure visits and consultation conversions.</small>
              </span>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
                aria-label="Allow analytics cookies"
              />
            </label>
          </div>
        ) : null}

        <div className="cookie-consent-actions">
          {manage ? (
            <button type="button" onClick={() => save(analytics ? "granted" : "denied")}>
              Save choices
            </button>
          ) : (
            <>
              <button type="button" className="cookie-secondary" onClick={() => save("denied")}>
                Reject optional
              </button>
              <button type="button" className="cookie-secondary" onClick={() => setManage(true)}>
                Manage preferences
              </button>
              <button type="button" onClick={() => save("granted")}>
                Accept analytics
              </button>
            </>
          )}
        </div>
        <span className="sr-only" aria-live="polite">
          {choice ? `Analytics consent ${choice}.` : "No analytics choice saved."}
        </span>
      </div>
    </section>
  );
}

