import { useEffect, useState } from "react";
import { TRACKING } from "@/lib/site";
import { captureAttribution, track } from "@/lib/tracking";
import { initializeGtag, syncGtmScript } from "@/lib/gtm-script";
import {
  buildConsentModeState,
  CONSENT_CHANGED_EVENT,
  readMeasurementConsent,
  type MeasurementConsent,
} from "@/lib/consent";

export function TrackingHooks() {
  const [consent, setConsent] = useState<MeasurementConsent | null>(null);

  useEffect(() => {
    initializeGtag(window);
    const initial = readMeasurementConsent();
    setConsent(initial);
    window.gtag?.("consent", "default", {
      ...buildConsentModeState(null),
      wait_for_update: 500,
    });
    if (initial) {
      window.gtag?.("consent", "update", buildConsentModeState(initial));
    }
    if (initial?.analytics) {
      captureAttribution();
    }

    const sync = (event: Event) => {
      const value = (event as CustomEvent<MeasurementConsent>).detail;
      setConsent(value);
      window.gtag?.("consent", "update", buildConsentModeState(value));
      if (value.analytics) captureAttribution();
      track(value.analytics || value.adsMeasurement ? "consent_granted" : "consent_denied", {
        analytics: value.analytics,
        ads_measurement: value.adsMeasurement,
      });
    };
    window.addEventListener(CONSENT_CHANGED_EVENT, sync);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, sync);
  }, []);

  const analyticsAllowed = consent?.analytics === true;
  const adsMeasurementAllowed = consent?.adsMeasurement === true;
  const mayLoadMeasurement = TRACKING.measurementOn && (analyticsAllowed || adsMeasurementAllowed);
  const useDirectGa4 =
    TRACKING.measurementOn && analyticsAllowed && !TRACKING.gtmId && Boolean(TRACKING.ga4Id);

  useEffect(() => {
    syncGtmScript(document, mayLoadMeasurement, TRACKING.gtmId);
  }, [mayLoadMeasurement]);

  return (
    <>
      <meta name="bit-gtm-hook" content="ready" />
      {useDirectGa4 && TRACKING.ga4Id ? (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${TRACKING.ga4Id}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `gtag('js',new Date());gtag('config','${TRACKING.ga4Id}',{anonymize_ip:true,allow_google_signals:false});`,
            }}
          />
        </>
      ) : (
        <meta name="bit-ga4-hook" content="ready" />
      )}
      {TRACKING.measurementOn && analyticsAllowed && TRACKING.clarityId ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${TRACKING.clarityId}");`,
          }}
        />
      ) : (
        <meta name="bit-clarity-hook" content="ready" />
      )}
      {TRACKING.measurementOn && adsMeasurementAllowed && TRACKING.callrailSwap ? (
        <script src={TRACKING.callrailSwap} async data-callrail="swap" />
      ) : (
        <meta name="bit-callrail-hook" content="ready" />
      )}
    </>
  );
}
