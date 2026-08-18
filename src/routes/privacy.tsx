import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy notice — BIT Solution" },
      {
        name: "description",
        content: "Privacy information for the informational BIT Solution website.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/privacy` }],
  }),
});

function PrivacyPage() {
  return (
    <main className="bg-bg">
      <article className="mx-auto max-w-2xl px-5 py-16 text-[16px] leading-relaxed text-ink">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">Legal</p>
        <h1 className="text-[clamp(1.8rem,5vw,2.6rem)] font-semibold tracking-[-0.03em]">
          Privacy notice
        </h1>
        <p className="mt-4 text-muted">Last updated 18 August 2026.</p>

        <h2 className="mt-10 text-[22px] font-semibold">Current website scope</h2>
        <p className="mt-3 text-muted">
          This owner-approved release is informational and phone-only. It does not provide website
          forms, chat, email links, analytics, advertising tags, or customer-account services. A
          qualified Privacy and Legal review is still pending before any broader online processing
          is activated.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">Hosting and security</h2>
        <p className="mt-3 text-muted">
          Vercel and Cloudflare may process limited IP address, request, and security metadata to
          host, deliver, protect, and troubleshoot the website. Their infrastructure may process
          this limited technical information outside Canada. The website does not use that
          information for marketing.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">Phone inquiries</h2>
        <p className="mt-3 text-muted">
          If you call us, information you choose to provide is used to respond to your inquiry. The
          website does not record calls, and call recording is off. Please avoid sharing passwords,
          access codes, payment information, health information, private client records, or other
          sensitive details unless an authorized BIT Solution representative provides a suitable
          secure channel.
        </p>

        <h2 className="mt-10 text-[22px] font-semibold">Access, correction, and complaints</h2>
        <p className="mt-3 text-muted">
          You may ask about personal information held by BIT Solution, request a correction, or make
          a privacy complaint by calling or writing to:
        </p>
        <address className="mt-4 not-italic text-muted">
          Privacy Officer, BIT Solution
          <br />
          373 Steeles Ave W, Brampton, Ontario L6Y 0P8
          <br />
          <a className="text-link" href={SITE.phoneHref}>{SITE.phoneDisplay}</a>
        </address>
      </article>
    </main>
  );
}
