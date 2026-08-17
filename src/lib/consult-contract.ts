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

export const CONSULT_CONSENT_VERSION = "canadian-consult-casl-v1";
export const CONSULT_CONTRACT_VERSION = "bitos.form-ai.crm:v1";
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
