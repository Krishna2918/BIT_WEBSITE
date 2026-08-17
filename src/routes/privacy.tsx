import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/lib/site";

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
  }),
});

function PrivacyPage() {
  return (
    <main className="bg-bg">
      <article className="mx-auto max-w-2xl px-5 py-16 text-[16px] leading-relaxed text-ink">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Legal
        </p>
        <h1 className="text-[clamp(1.8rem,5vw,2.6rem)] font-semibold tracking-[-0.03em]">
          Privacy notice
        </h1>
        <p className="mt-4 text-muted">Last updated 15 August 2026.</p>

        <h2 className="mt-10 text-[22px] font-semibold">Who we are</h2>
        <p className="mt-3 text-muted">
          {SITE.legalName} (“BIT”, “we”) is an IT company at {SITE.address}.
          Contact {SITE.email} or {SITE.phoneDisplay}.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">What we collect</h2>
        <p className="mt-3 text-muted">
          Consultation forms collect your name, company, email, phone, the
          service you asked about, and an optional message. Fleet requests also
          ask for the number of power units, the ELD or telematics provider and
          the main dispatch bottleneck. Dental requests also ask for the number
          of operatories, practice-management software and backup frequency. We also store
          advertising click identifiers (such as GCLID or UTM values) if they
          are present in the page address, plus the page you came from. We do
          not ask for health records, driver files, or payment card numbers on
          this website.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">Why we collect it</h2>
        <p className="mt-3 text-muted">
          We use this information to respond to your request, to call or email
          you about that request, and — if you gave CASL consent — to follow up
          about BIT services. Identifiers help us understand which public page
          or advertisement brought you here. We do not sell personal
          information.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">CASL</h2>
        <p className="mt-3 text-muted">
          Commercial electronic messages are sent only if you check the consent
          box. You may withdraw consent by emailing {SITE.email} or using the
          unsubscribe method in a message.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">PIPEDA</h2>
        <p className="mt-3 text-muted">
          We handle personal information under Canada’s Personal Information
          Protection and Electronic Documents Act. Access, correction, and
          complaint requests: {SITE.email}.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">Cookies and measurement</h2>
        <p className="mt-3 text-muted">
          Essential storage supports core website functions. Optional analytics
          stays off unless you allow it through the privacy choices shown on
          this site. If Google Tag Manager or Google Analytics is later enabled,
          we use it to measure visits and consultation conversions without
          sending form or chat content. Microsoft Clarity and CallRail are not
          enabled at launch.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">Retention</h2>
        <p className="mt-3 text-muted">
          Consultation records are kept only as long as needed to handle the
          request and meet legal duties, then deleted or archived with access
          limited to staff who need them.
        </p>
      </article>
    </main>
  );
}
