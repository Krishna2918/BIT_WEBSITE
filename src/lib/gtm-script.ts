export const GTM_SCRIPT_ID = "bit-gtm-script";

type GtmRuntimeWindow = {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

export function initializeGtag(windowRef: GtmRuntimeWindow) {
  windowRef.dataLayer = windowRef.dataLayer || [];
  windowRef.gtag =
    windowRef.gtag ||
    function gtag(..._args: unknown[]) {
      windowRef.dataLayer?.push(arguments);
    };
  return windowRef.gtag;
}

export function syncGtmScript(
  documentRef: Document,
  enabled: boolean,
  containerId: string | undefined,
) {
  const existing = documentRef.getElementById(GTM_SCRIPT_ID);
  if (!enabled || !containerId) {
    existing?.remove();
    return false;
  }
  if (existing) return true;

  const script = documentRef.createElement("script");
  script.id = GTM_SCRIPT_ID;
  script.dataset.bitGtm = "true";
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
  script.async = true;
  documentRef.head.appendChild(script);
  return true;
}
