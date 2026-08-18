import { useEffect, useState } from "react";
import { TRACKING } from "@/lib/site";
import { captureAttribution, track } from "@/lib/tracking";
import {
  buildConsentModeState,
  CONSENT_CHANGED_EVENT,
  readMeasurementConsent,
  type MeasurementConsent,
} from "@/lib/consent";

export function TrackingHooks() {
  const [consent, setConsent] = useState<MeasurementConsent | null>(null);

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag || ((...args: unknown[]) => window.dataLayer.push({ arguments: args }));
    const initial = readMeasurementConsent();
    setConsent(initial);
    window.gtag("consent", "default", {
      ...buildConsentModeState(null),
      wait_for_update: 500,
    });
    if (initial) {
      window.gtag("consent", "update", buildConsentModeState(initial));
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
  const useGtm = mayLoadMeasurement && Boolean(TRACKING.gtmId);
  const useDirectGa4 =
    TRACKING.measurementOn && analyticsAllowed && !TRACKING.gtmId && Boolean(TRACKING.ga4Id);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments);};`,
        }}
      />
      {useGtm && TRACKING.gtmId ? (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':Date.now(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${TRACKING.gtmId}');`,
            }}
          />
          <noscript>
            <iframe
              title="Google Tag Manager"
              src={`https://www.googletagmanager.com/ns.html?id=${TRACKING.gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      ) : (
        <meta name="bit-gtm-hook" content="ready" />
      )}
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
