export const SITE = {
  name: "BIT Solution",
  legalName: "BIT Solution",
  positioning:
    "Intelligent Infrastructure, Custom B2B Software & AI Workflows — Under One Flag.",
  tagline: "Your ONE stop IT solution.",
  trust: "Building Trust",
  phoneDisplay: "+1 905-867-6574",
  phoneTel: "+19058676574",
  phoneHref: "tel:+19058676574",
  whatsappDisplay: "+1 905-867-6574",
  whatsappHref: "https://wa.me/19058676574",
  email: "info@bitsolution.ca",
  supportEmail: "support@bitsolution.ca",
  address: "373 Steeles Ave W, Brampton, ON L6Y 0P8, Canada",
  region: "Ontario",
  coverage: "Entire Ontario",
  url: "https://bitsolution.ca",
  /** Set when COO sends the ticket desk URL. Empty = button stays pending. */
  ticketUrl: "",
} as const;

export const TRACKING = {
  gtmId: import.meta.env.VITE_GTM_ID as string | undefined,
  ga4Id: import.meta.env.VITE_GA4_ID as string | undefined,
  /** Marketing: off at launch. Do not load even if an ID appears. */
  clarityId: undefined as string | undefined,
  callrailSwap: undefined as string | undefined,
  /**
   * Preview stays dark. Turn on only after domain cutover, cookie consent,
   * privacy/security approval, and QA — via VITE_MEASUREMENT_ON=1 plus IDs.
   */
  measurementOn: import.meta.env.VITE_MEASUREMENT_ON === "1",
} as const;
