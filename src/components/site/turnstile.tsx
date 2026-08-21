import { useEffect, useRef } from "react";

export const TURNSTILE_ENABLED = import.meta.env.VITE_TURNSTILE_ENABLED === "true";
const TURNSTILE_SITE_KEY =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) || "0x4AAAAAAETHN-YhhbIwjKbD";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          action: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!TURNSTILE_ENABLED || !TURNSTILE_SITE_KEY || !mountRef.current) return;
    let widgetId: string | undefined;
    let cancelled = false;

    const render = () => {
      if (cancelled || widgetId || !window.turnstile || !mountRef.current) return;
      widgetId = window.turnstile.render(mountRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        action: "consult",
        callback: onToken,
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    };

    const existing = document.querySelector<HTMLScriptElement>("script[data-bit-turnstile]");
    if (window.turnstile) {
      render();
    } else if (existing) {
      existing.addEventListener("load", render, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.bitTurnstile = "true";
      script.addEventListener("load", render, { once: true });
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      existing?.removeEventListener("load", render);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onToken]);

  if (!TURNSTILE_ENABLED) return null;
  if (!TURNSTILE_SITE_KEY) {
    return (
      <p className="form-err" role="alert">
        Online verification is not configured. Please call instead.
      </p>
    );
  }
  return <div className="turnstile-wrap" ref={mountRef} aria-label="Human verification" />;
}
