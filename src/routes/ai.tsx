import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/ai")({
  component: AiPage,
  head: () => pageHead("/ai"),
});

const BEATS = [
  { n: "01", title: "Help that is always on", note: "Available now" },
  { n: "02", title: "Faster tickets and clear progress", note: "Available now" },
  { n: "03", title: "Secure remote checks", note: "Available now" },
  { n: "04", title: "Human steps in when needed", note: "Available now" },
  { n: "05", title: "Watches before things break", note: "Coming soon" },
  { n: "06", title: "Every action can be audited", note: "Coming soon" },
  { n: "07", title: "Careful with customer data", note: "Available now" },
  { n: "08", title: "We build the same AI for other companies", note: "Available now" },
];

function AiPage() {
  return (
    <main className="bg-bg">
      <section className="page-band">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">AI</p>
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[56px]">
          Help that stays on.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[19px] leading-snug text-muted sm:text-[21px]">
          BIT AI is there when people need it — and a person takes over when
          they should.
        </p>
      </section>
      <div className="page-hero-media mx-auto w-full max-w-5xl px-5">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/home/ai.jpg"
          aria-label="Ice-blue crystal field under moving light"
        >
          <source src="/videos/ai.mp4" type="video/mp4" />
        </video>
      </div>

      <section className="mx-auto max-w-2xl px-5 py-16">
        {BEATS.map((b) => (
          <div key={b.n} className="flex gap-6 border-t border-hairline py-7">
            <span className="w-10 shrink-0 text-[15px] font-medium tabular-nums text-link">{b.n}</span>
            <div>
              <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">{b.title}</h2>
              <p className="mt-1 text-[13px] text-muted">{b.note}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-bg-muted px-5 py-16 text-center">
        <p className="text-[21px] text-ink">Ask it something.</p>
        <p className="mx-auto mt-2 max-w-md text-[16px] text-muted">
          The bot in the corner is BIT AI — glossy shell, live face, a person
          when you need one.
        </p>
        <button
          type="button"
          className="cta-book mt-5"
          onClick={() => window.dispatchEvent(new Event("bit-ask-ai"))}
        >
          Ask AI
        </button>
      </section>

      <section className="bg-bg px-5 py-16 text-center">
        <p className="text-[21px] text-ink">AI is one of four parts.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-6 text-[17px]">
          <Link to="/software" className="text-link no-underline hover:underline">
            Software ›
          </Link>
          <Link to="/hardware" className="text-link no-underline hover:underline">
            Hardware ›
          </Link>
          <Link to="/security" className="text-link no-underline hover:underline">
            Security ›
          </Link>
        </div>
      </section>
    </main>
  );
}
