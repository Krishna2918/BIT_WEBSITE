export const CONSULT_INTERESTS = [
  "General consultation",
  "Fleet operations — Ontario",
  "Dental IT — Ontario",
  "Digital marketing",
  "Procurement",
  "VoIP & phones",
  "Software",
  "Hardware",
  "AI",
  "Security",
  "Support",
] as const;

export const CONSULT_GENERAL_INTERESTS = [
  "General consultation",
  "Digital marketing",
  "Procurement",
  "VoIP & phones",
  "Software",
  "Hardware",
  "AI",
  "Security",
  "Support",
] as const;

export const CONSULT_SERVICE_OPTIONS = [
  "Hardware & connected devices",
  "Custom software",
  "AI workflows",
  "Cybersecurity",
  "Other",
] as const;

export const CONSULT_SERVICE_DISPLAY_LABELS: Record<ConsultService, string> = {
  "Hardware & connected devices": "Hardware/Connected Devices",
  "Custom software": "Custom Software",
  "AI workflows": "AI Workflows",
  Cybersecurity: "Cybersecurity",
  Other: "General/Other",
};

export type ConsultService = (typeof CONSULT_SERVICE_OPTIONS)[number];

export const CONSULT_CONTACT_TIMES = ["Morning", "Afternoon", "Evening", "Any time"] as const;

export type ConsultContactTime = (typeof CONSULT_CONTACT_TIMES)[number];

export const CONSULT_REPLY_CHANNELS = ["Phone", "Email", "WhatsApp"] as const;

export type ConsultReplyChannel = (typeof CONSULT_REPLY_CHANNELS)[number];

export function isAllowedPublicWebsiteHostname(hostname: string) {
  const normalized = hostname.trim().toLowerCase().replace(/^\[|\]$/g, "");
  if (!normalized) return false;
  if (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".internal") ||
    normalized.endsWith(".lan") ||
    normalized.endsWith(".home")
  ) {
    return false;
  }

  const ipv4 = normalized.split(".");
  if (ipv4.length === 4 && ipv4.every((part) => /^\d{1,3}$/.test(part))) {
    const octets = ipv4.map(Number);
    if (octets.some((octet) => octet > 255)) return false;
    const [first, second, third] = octets;
    return !(
      first === 0 ||
      first === 10 ||
      first === 127 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 0 && third === 0) ||
      (first === 192 && second === 0 && third === 2) ||
      (first === 192 && second === 168) ||
      (first === 198 && (second === 18 || second === 19)) ||
      (first === 198 && second === 51 && third === 100) ||
      (first === 203 && second === 0 && third === 113) ||
      first >= 224
    );
  }

  if (normalized.includes(":")) {
    const ipv6 = normalized.replace(/^::ffff:/, "");
    if (normalized.startsWith("::ffff:") && /^[0-9a-f:]+$/.test(ipv6)) {
      const groups = ipv6.split(":").filter(Boolean);
      if (groups.length <= 2) {
        const high = Number.parseInt(groups.at(-2) || "0", 16);
        const low = Number.parseInt(groups.at(-1) || "0", 16);
        if (Number.isFinite(high) && Number.isFinite(low) && high <= 0xffff && low <= 0xffff) {
          const mappedIpv4 = [high >> 8, high & 0xff, low >> 8, low & 0xff].join(".");
          return isAllowedPublicWebsiteHostname(mappedIpv4);
        }
      }
    }
    // Fail closed for literal IPv6. Public business sites should use a DNS
    // hostname; the CRM performs the final authoritative IP classification.
    return false;
  }
  const labels = normalized.split(".");
  return (
    labels.length >= 2 &&
    normalized.length <= 253 &&
    /^[a-z0-9.-]+$/.test(normalized) &&
    !/^\d+$/.test(labels.at(-1) || "") &&
    labels.every(
      (label) =>
        label.length > 0 &&
        label.length <= 63 &&
        !label.startsWith("-") &&
        !label.endsWith("-"),
    )
  );
}

export const CONSULT_CONSENT_VERSION = "canadian-consult-service-v2";
export const CONSULT_CONTRACT_VERSION = "bitos.form-ai.crm:v2";
export const CONSULT_OPERATION = "UPSERT_GOOGLE_LEADS_AI_SERVICE_INTAKE";
export const CONSULT_SOURCE_CHANNEL = "canadian-website-consult";

export const CONSULT_SOURCE_BY_INTENT = {
  fleet: "fleet-operations-ontario",
  dental: "dental-it-ontario",
  general: "consult-page",
} as const;

export const CONSULT_INTEREST_BY_INTENT = {
  fleet: "Fleet operations — Ontario",
  dental: "Dental IT — Ontario",
  general: "General consultation",
} as const;

export const CONSULT_SCOPE_BY_INTENT = {
  fleet: `${CONSULT_SOURCE_CHANNEL}:fleet`,
  dental: `${CONSULT_SOURCE_CHANNEL}:dental`,
  general: `${CONSULT_SOURCE_CHANNEL}:general`,
} as const;

export function validateSelectedServices(values: readonly string[]): ConsultService[] {
  if (values.length < 1 || values.length > CONSULT_SERVICE_OPTIONS.length) {
    throw new Error("at least one approved service is required");
  }
  const selected = new Set(
    values.map((value) => {
      if (!CONSULT_SERVICE_OPTIONS.includes(value as ConsultService)) {
        throw new Error("unknown service selection");
      }
      return value as ConsultService;
    }),
  );
  if (selected.size !== values.length) {
    throw new Error("duplicate service selection");
  }
  return CONSULT_SERVICE_OPTIONS.filter((service) => selected.has(service));
}

export const CONSULT_CHANNEL_BY_REPLY: Record<ConsultReplyChannel, "email" | "whatsapp" | "phone"> = {
  Email: "email",
  WhatsApp: "whatsapp",
  Phone: "phone",
};

export const CONSULT_TIME_WINDOW_BY_CONTACT_TIME: Record<
  ConsultContactTime,
  "as_soon_as_possible" | "weekday_morning" | "weekday_afternoon" | "weekday_evening"
> = {
  "Any time": "as_soon_as_possible",
  Morning: "weekday_morning",
  Afternoon: "weekday_afternoon",
  Evening: "weekday_evening",
};

const BEANT_OWNED_SERVICES = new Set<ConsultService>([
  "Hardware & connected devices",
  "Cybersecurity",
  "Other",
]);

const CONSULTANT_OWNED_SERVICES = new Set<ConsultService>(["Custom software", "AI workflows"]);

export function resolveConsultRouting(values: readonly string[]) {
  const services = validateSelectedServices(values);
  const hasBeantService = services.some((service) => BEANT_OWNED_SERVICES.has(service));
  const hasConsultantService = services.some((service) => CONSULTANT_OWNED_SERVICES.has(service));
  return {
    accountable_owner_key: hasBeantService ? ("beant_singh_ceo" as const) : ("consultant" as const),
    collaboration_owner_key:
      hasBeantService && hasConsultantService ? ("consultant" as const) : null,
    route_reason:
      hasBeantService && hasConsultantService
        ? ("mixed_services" as const)
        : hasBeantService
          ? ("beant_owned_services" as const)
          : ("software_ai_only" as const),
  };
}

export const SOFTWARE_PRIMARY_WELCOME_COPY =
  "BIT Solution builds custom software around your workflow. Your consultation will confirm the right scope, timeline, and next step.";

export function buildCommercialPositioning(values: readonly string[]) {
  const services = validateSelectedServices(values);
  const customSoftwareSelected = services.includes("Custom software");
  return {
    crm_flags: customSoftwareSelected
      ? (["SOFTWARE_PRIMARY_RECOMMENDATION", "OFFER_ELIGIBILITY_REVIEW"] as const)
      : ([] as const),
    primary_recommendation: customSoftwareSelected
      ? ("BIT_SOLUTION_CUSTOM_SOFTWARE" as const)
      : null,
    welcome_copy: customSoftwareSelected ? SOFTWARE_PRIMARY_WELCOME_COPY : null,
    offer_review: customSoftwareSelected
      ? {
          offer_key: "THIRTY_DAY_DEPLOYMENT_PLACEHOLDER" as const,
          status: "HOLD_PENDING_OPERATIONS_FINANCE_LEGAL" as const,
          external_language_authorized: false as const,
          automatic_offer_authorized: false as const,
        }
      : null,
  };
}
