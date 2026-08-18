import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/security")({
  component: SecurityPage,
  head: () => pageHead("/security"),
});

const BEATS = [
  { n: "01", title: "Watches around the clock" },
  { n: "02", title: "Stops threats at the edge" },
  { n: "03", title: "Locks down every device" },
  { n: "04", title: "Keeps encrypted copies" },
  { n: "05", title: "Recovers when something breaks" },
  { n: "06", title: "Trains people and sets the rules" },
];

function SecurityPage() {
  return (
    <main className="bg-bg">
      <section className="px-5 pb-8 pt-16 text-center">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">Security</p>
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[56px]">
          The layer that holds the rest.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[19px] leading-snug text-muted sm:text-[21px]">
          Quiet protection around software, hardware, and AI. Not a scare
          story — a shell that stays closed.
        </p>
      </section>
      <div className="page-hero-media mx-auto w-full max-w-5xl px-5">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/home/security.jpg"
          aria-label="Glass security shell turning in a white studio"
        >
          <source src="/videos/security.mp4" type="video/mp4" />
        </video>
      </div>

      <section className="mx-auto max-w-2xl px-5 py-16">
        {BEATS.map((b) => (
          <div key={b.n} className="flex gap-6 border-t border-hairline py-7 last:border-b">
            <span className="w-10 shrink-0 text-[15px] font-medium tabular-nums text-link">{b.n}</span>
            <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">{b.title}</h2>
          </div>
        ))}
      </section>

      <section className="bg-band-dark px-5 py-20 text-center text-band-dark-fg">
        <p className="text-[28px] font-semibold tracking-[-0.02em]">Building trust.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-[17px]">
          <Link to="/software" className="text-link no-underline hover:underline">
            Software ›
          </Link>
          <Link to="/hardware" className="text-link no-underline hover:underline">
            Hardware ›
          </Link>
          <Link to="/ai" className="text-link no-underline hover:underline">
            AI ›
          </Link>
        </div>
      </section>
    </main>
  );
}
