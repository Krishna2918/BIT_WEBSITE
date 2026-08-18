import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/lib/site";

const PRIVACY_LEGAL_STATUS = "OWNER_ATTESTED_PRIVACY_LEGAL_APPROVED" as const;

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy notice — BIT Solution" },
      {
        name: "description",
        content:
          "How BIT Solution collects and uses consultation information under PIPEDA and CASL.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/privacy` }],
  }),
});

function PrivacyPage() {
  return (
    <main className="bg-bg">
      <article
        data-privacy-legal-status={PRIVACY_LEGAL_STATUS}
        className="mx-auto max-w-2xl px-5 py-16 text-[16px] leading-relaxed text-ink"
      >
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">Legal</p>
        <h1 className="text-[clamp(1.8rem,5vw,2.6rem)] font-semibold tracking-[-0.03em]">
          Privacy notice
        </h1>
        <p className="mt-4 text-muted">Last updated 18 August 2026.</p>

        <h2 className="mt-10 text-[22px] font-semibold">Who we are</h2>
        <p className="mt-3 text-muted">
          {SITE.legalName} (“BIT”, “we”) is an IT company at {SITE.address}. Contact {SITE.email} or{" "}
          {SITE.phoneDisplay}.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">What we collect</h2>
        <p className="mt-3 text-muted">
          Consultation forms collect your name, company, email, phone, the services you select,
          preferred contact time and reply method, and an optional message. If you provide a public
          website URL, we also record whether you separately authorized a high-level public-site
          review. A URL by itself does not authorize crawling, security scanning, or access to
          hidden information. Fleet requests also ask for the number of power units, the ELD or
          telematics provider and the main dispatch bottleneck. Dental requests also ask for the
          number of operatories, practice-management software and backup frequency. We also store
          advertising click identifiers (such as GCLID or UTM values) if they are present in the
          page address, plus the page you came from. Consultation notes and Ask AI are free-text
          fields. Do not include patient or health information, driver files, passwords, access
          codes, credentials, payment information, private client records, or sensitive security
          details.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">Why we collect it</h2>
        <p className="mt-3 text-muted">
          We use this information to route and respond to your service request using your preferred
          contact method. Website-review permission, service-update permission, and optional
          marketing permission are recorded separately. Identifiers help us understand which public
          page or advertisement brought you here. We do not sell personal information.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">CASL</h2>
        <p className="mt-3 text-muted">
          Contact about the service inquiry requires its own consent. Email service updates and
          WhatsApp service updates each require their own separate, initially unchecked consent.
          Marketing messages require the separate optional marketing checkbox, which is unchecked
          by default. You may withdraw consent by emailing {SITE.email} or using the unsubscribe
          method in a message.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">PIPEDA</h2>
        <p className="mt-3 text-muted">
          We handle personal information under Canada’s Personal Information Protection and
          Electronic Documents Act. Access, correction, and complaint requests: {SITE.email}.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">Service providers and processing locations</h2>
        <p className="mt-3 text-muted">
          Cloudflare and Vercel help host and secure this website. When separately enabled after
          technical verification, Cloudflare Turnstile, Vercel AI Gateway, OpenAI, Chatwoot, our
          CRM delivery service, Microsoft Teams and Resend process only the information needed for
          the stated service purpose. Processing may occur outside Canada. Access is restricted to
          authorized personnel and providers, and inquiry information is not reused for marketing
          without the separate optional marketing consent.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">Ask AI and human live chat</h2>
        <p className="mt-3 text-muted">
          Ask AI is off until you affirm its separate service-processing consent. When you consent
          and submit a question, our server FAQ service processes the submitted chat text and limited
          technical routing information to find approved public information. Vercel AI Gateway and
          OpenAI then process the question and grounded result only to make a limited answer-or-human
          handoff decision. This service processing is not marketing consent and the content is not
          reused for marketing.
        </p>
        <p className="mt-3 text-muted">
          Human live chat is a separate Chatwoot service. If you choose live chat or Ask AI cannot
          safely answer, the Ask AI transcript is not transferred to Chatwoot. You must repeat your
          question in live chat. An authorized support team member can review and reply only to the
          information you submit in that separate live-chat conversation. Do not include patient or
          health information, driver files, passwords, access codes, credentials, payment
          information, private client records, or sensitive security details in Ask AI or live chat.
        </p>
        <p className="mt-3 text-muted">
          BIT Solution’s owner has attested that the Privacy and Legal terms for this launch are
          approved. This records the owner’s decision; it does not claim or document independent
          legal advice or a named reviewer opinion. Each provider and integration remains
          fail-closed until its separate technical binding, Security review and canary gate passes.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">Automated-abuse prevention</h2>
        <p className="mt-3 text-muted">
          When consultation-form abuse protection is enabled, Cloudflare Turnstile processes the
          verification token and request IP to prevent automated abuse. This processing may occur
          outside Canada. Turnstile remains disabled until its separate technical binding and
          canary gate passes.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">Cookies and measurement</h2>
        <p className="mt-3 text-muted">
          Essential storage supports core website functions. Optional analytics stays off unless you
          allow it through the privacy choices shown on this site. If Google Tag Manager or Google
          Analytics is later enabled, we use it to measure visits and consultation conversions
          without sending form or chat content. Microsoft Clarity and CallRail are not enabled at
          launch.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">Retention</h2>
        <p className="mt-3 text-muted">
          Failed or unsubmitted intake data is retained for no more than 30 days. Service inquiry
          and CRM records are retained for no more than 24 months after the last activity. Consent
          and suppression evidence remains active while required and is retained for 24 months
          after withdrawal. Send and audit metadata is retained for 24 months. Raw analytics
          identifiers are retained for no more than 14 months when measurement is separately
          enabled. A legal hold may override scheduled deletion. Call recording is off. Access is
          limited to staff and providers who need the information for the stated purpose.
        </p>
      </article>
    </main>
  );
}
