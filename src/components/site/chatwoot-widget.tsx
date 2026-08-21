import { useEffect } from "react";

const TOKEN = import.meta.env.VITE_CHATWOOT_WEBSITE_TOKEN as string | undefined;
const BASE = (import.meta.env.VITE_CHATWOOT_BASE_URL as string | undefined) || "https://livechat.bitsolution.ca";

declare global {
  interface Window {
    chatwootSDK?: { run: (opts: { websiteToken: string; baseUrl: string }) => void };
    chatwootSettings?: Record<string, unknown>;
  }
}

export function ChatwootWidget() {
  useEffect(() => {
    if (!TOKEN) return;
    window.chatwootSettings = {
      hideMessageBubble: false,
      position: "right",
      type: "standard",
      launcherTitle: "Chat with BIT",
    };
    const existing = document.querySelector<HTMLScriptElement>("script[data-bit-chatwoot]");
    const run = () => {
      window.chatwootSDK?.run({ websiteToken: TOKEN, baseUrl: BASE });
    };
    if (existing) {
      existing.addEventListener("load", run, { once: true });
      return () => existing.removeEventListener("load", run);
    }
    const script = document.createElement("script");
    script.src = `${BASE}/packs/js/sdk.js`;
    script.async = true;
    script.defer = true;
    script.dataset.bitChatwoot = "true";
    script.addEventListener("load", run, { once: true });
    document.head.appendChild(script);
    return () => script.removeEventListener("load", run);
  }, []);
  if (!TOKEN) return null;
  return null;
}
