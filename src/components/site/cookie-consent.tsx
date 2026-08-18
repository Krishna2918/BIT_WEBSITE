import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CONSENT_CHANGED_EVENT,
  CONSENT_OPEN_EVENT,
  readMeasurementConsent,
  writeMeasurementConsent,
  type MeasurementConsent,
} from "@/lib/consent";

export function CookieConsent() {
  const [choice, setChoice] = useState<MeasurementConsent | null>(null);
  const [open, setOpen] = useState(false);
  const [manage, setManage] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [adsMeasurement, setAdsMeasurement] = useState(false);

  useEffect(() => {
    const saved = readMeasurementConsent();
    setChoice(saved);
    setAnalytics(saved?.analytics === true);
    setAdsMeasurement(saved?.adsMeasurement === true);
    setOpen(saved === null);

    const reopen = () => {
      const current = readMeasurementConsent();
      setAnalytics(current?.analytics === true);
      setAdsMeasurement(current?.adsMeasurement === true);
      setManage(true);
      setOpen(true);
    };
    const sync = (event: Event) => {
      const value = (event as CustomEvent<MeasurementConsent>).detail;
      setChoice(value);
      setAnalytics(value.analytics);
      setAdsMeasurement(value.adsMeasurement);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    window.addEventListener(CONSENT_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
      window.removeEventListener(CONSENT_CHANGED_EVENT, sync);
    };
  }, []);

  function save(value: MeasurementConsent) {
    writeMeasurementConsent(value);
    setChoice(value);
    setAnalytics(value.analytics);
    setAdsMeasurement(value.adsMeasurement);
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
            Essential storage keeps the site working. Analytics and Ads conversion/call measurement
            are separate optional choices and stay off unless you allow them. Ads personalization
            always stays off. We never send form or chat content to measurement.{" "}
            <Link to="/privacy">Read the privacy notice</Link>.
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
            <label>
              <span>
                <strong>Ads conversion and call measurement</strong>
                <small>
                  Measures consultation conversions and calls. It does not enable personalized ads.
                </small>
              </span>
              <input
                type="checkbox"
                checked={adsMeasurement}
                onChange={(event) => setAdsMeasurement(event.target.checked)}
                aria-label="Allow Ads conversion and call measurement"
              />
            </label>
          </div>
        ) : null}

        <div className="cookie-consent-actions">
          {manage ? (
            <button type="button" onClick={() => save({ analytics, adsMeasurement })}>
              Save choices
            </button>
          ) : (
            <>
              <button
                type="button"
                className="cookie-secondary"
                onClick={() => save({ analytics: false, adsMeasurement: false })}
              >
                Reject optional
              </button>
              <button type="button" className="cookie-secondary" onClick={() => setManage(true)}>
                Manage preferences
              </button>
              <button
                type="button"
                onClick={() => save({ analytics: true, adsMeasurement: false })}
              >
                Accept analytics only
              </button>
            </>
          )}
        </div>
        <span className="sr-only" aria-live="polite">
          {choice
            ? "Analytics " +
              (choice.analytics ? "allowed" : "denied") +
              ". Ads measurement " +
              (choice.adsMeasurement ? "allowed" : "denied") +
              ". Ads personalization denied."
            : "No optional measurement choice saved."}
        </span>
      </div>
    </section>
  );
}
