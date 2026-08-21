import { useEffect } from "react";
import { TRACKING } from "@/lib/site";
import { captureAttribution } from "@/lib/tracking";

export function TrackingHooks() {
  useEffect(() => {
    captureAttribution();
    window.dataLayer = window.dataLayer || [];
  }, []);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments);};`,
        }}
      />
      {TRACKING.measurementOn && TRACKING.gtmId ? (
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
      {TRACKING.measurementOn && (TRACKING.ga4Id || TRACKING.adsId) ? (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${TRACKING.ga4Id || TRACKING.adsId}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `gtag('js',new Date());gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',wait_for_update:500});${TRACKING.ga4Id ? `gtag('config','${TRACKING.ga4Id}',{anonymize_ip:true,allow_google_signals:false});` : ""}${TRACKING.adsId ? `gtag('config','${TRACKING.adsId}');` : ""}`,
            }}
          />
        </>
      ) : (
        <meta name="bit-ga4-hook" content="ready" />
      )}
      {TRACKING.clarityId ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${TRACKING.clarityId}");`,
          }}
        />
      ) : (
        <meta name="bit-clarity-hook" content="ready" />
      )}
      {TRACKING.callrailSwap ? (
        <script
          src={TRACKING.callrailSwap}
          async
          data-callrail="swap"
        />
      ) : (
        <meta name="bit-callrail-hook" content="ready" />
      )}
    </>
  );
}
