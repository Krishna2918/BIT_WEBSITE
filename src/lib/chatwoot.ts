type PublicEnvironment = Record<string, string | boolean | undefined>;

type DisabledChatwootConfig = {
  enabled: false;
  reason: "feature-disabled" | "invalid-public-config";
};
type EnabledChatwootConfig = {
  enabled: true;
  baseUrl: string;
  sdkUrl: string;
  websiteToken: string;
};
export type ChatwootConfig = DisabledChatwootConfig | EnabledChatwootConfig;

const CANONICAL_BASE_URL = "https://livechat.bitsolution.ca";
const CANONICAL_SDK_PATH = "/packs/js/sdk.js";
const SDK_ELEMENT_ID = "bit-chatwoot-sdk";
const READY_EVENT = "chatwoot:ready";
const READY_TIMEOUT_MS = 8_000;
const WEBSITE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,128}$/;

declare global {
  interface Window {
    $chatwoot?: {
      toggle: (state: "open" | "close") => void;
      toggleBubbleVisibility?: (state: "show" | "hide") => void;
    };
    chatwootSDK?: { run: (options: { baseUrl: string; websiteToken: string }) => void };
    chatwootSettings?: { hideMessageBubble: boolean; position: "right" };
  }
}

function readString(environment: PublicEnvironment, name: string): string {
  const value = environment[name];
  return typeof value === "string" ? value.trim() : "";
}

export function getChatwootConfig(environment: PublicEnvironment): ChatwootConfig {
  if (readString(environment, "VITE_CHATWOOT_ENABLED") !== "true") {
    return { enabled: false, reason: "feature-disabled" };
  }
  const baseValue = readString(environment, "VITE_CHATWOOT_BASE_URL");
  const sdkPath = readString(environment, "VITE_CHATWOOT_SDK_PATH");
  const websiteToken = readString(environment, "VITE_CHATWOOT_WEBSITE_TOKEN");
  let baseUrl: URL;
  try {
    baseUrl = new URL(baseValue);
  } catch {
    return { enabled: false, reason: "invalid-public-config" };
  }
  const exactCanonicalBase =
    baseUrl.origin === CANONICAL_BASE_URL &&
    (baseUrl.pathname === "/" || baseUrl.pathname === "") &&
    baseUrl.username === "" &&
    baseUrl.password === "" &&
    baseUrl.search === "" &&
    baseUrl.hash === "";
  if (
    !exactCanonicalBase ||
    sdkPath !== CANONICAL_SDK_PATH ||
    !WEBSITE_TOKEN_PATTERN.test(websiteToken)
  ) {
    return { enabled: false, reason: "invalid-public-config" };
  }
  return {
    enabled: true,
    baseUrl: CANONICAL_BASE_URL,
    sdkUrl: `${CANONICAL_BASE_URL}${CANONICAL_SDK_PATH}`,
    websiteToken,
  };
}

function showChatwoot(): boolean {
  if (!window.$chatwoot) return false;
  window.$chatwoot.toggleBubbleVisibility?.("hide");
  window.$chatwoot.toggle("open");
  return true;
}

let initializationPromise: Promise<void> | null = null;

function initializeChatwoot(config: EnabledChatwootConfig): Promise<void> {
  if (showChatwoot()) return Promise.resolve();
  if (initializationPromise) return initializationPromise;
  initializationPromise = new Promise<void>((resolve, reject) => {
    let settled = false;
    let timeoutId: number | undefined;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      window.removeEventListener(READY_EVENT, onReady);
      if (error) reject(error);
      else resolve();
    };
    const onReady = () => {
      if (!showChatwoot()) {
        finish(new Error("Chatwoot did not expose its public widget API"));
        return;
      }
      finish();
    };
    const runSdk = () => {
      if (!window.chatwootSDK?.run) {
        finish(new Error("Chatwoot SDK is unavailable"));
        return;
      }
      window.addEventListener(READY_EVENT, onReady, { once: true });
      try {
        window.chatwootSettings = { hideMessageBubble: true, position: "right" };
        window.chatwootSDK.run({ baseUrl: config.baseUrl, websiteToken: config.websiteToken });
      } catch {
        finish(new Error("Chatwoot SDK initialization failed"));
      }
    };
    if (window.chatwootSDK?.run) {
      runSdk();
    } else {
      const existing = document.getElementById(SDK_ELEMENT_ID);
      if (existing && (!(existing instanceof HTMLScriptElement) || existing.src !== config.sdkUrl)) {
        finish(new Error("Chatwoot SDK element does not match the approved source"));
        return;
      }
      const script = existing ?? document.createElement("script");
      script.addEventListener("load", runSdk, { once: true });
      script.addEventListener("error", () => finish(new Error("Chatwoot SDK failed to load")), {
        once: true,
      });
      if (!existing) {
        script.id = SDK_ELEMENT_ID;
        script.src = config.sdkUrl;
        script.async = true;
        script.referrerPolicy = "strict-origin-when-cross-origin";
        document.head.append(script);
      }
    }
    timeoutId = window.setTimeout(
      () => finish(new Error("Chatwoot SDK readiness timed out")),
      READY_TIMEOUT_MS,
    );
  }).catch((error: unknown) => {
    initializationPromise = null;
    throw error;
  });
  return initializationPromise;
}

export async function openConfiguredChatwoot(
  environment: PublicEnvironment = import.meta.env,
): Promise<boolean> {
  const config = getChatwootConfig(environment);
  if (!config.enabled) return false;
  await initializeChatwoot(config);
  return true;
}
