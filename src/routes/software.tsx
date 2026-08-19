import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/software")({
  component: SoftwarePage,
  head: () => pageHead("/software"),
});

const PRODUCTS = [
  { name: "Fleet", line: "Run the road side of the business." },
  { name: "College ERP", line: "Run the campus side." },
  { name: "Clinic", line: "Run appointments, billing, and the floor." },
  { name: "Vision", line: "Run the practice side." },
];

function SoftwarePage() {
  return (
    <main className="bg-bg">
      <section className="px-5 pb-8 pt-16 text-center">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">Software</p>
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[56px]">
          Built for how people work now.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[19px] leading-snug text-muted sm:text-[21px]">
          We respect what came before. We just build what comes next — modern,
          AI-ready, made to save time.
        </p>
      </section>
      <img
        src="/images/home/software.jpg"
        alt="Laptop on a studio sweep"
        className="mx-auto w-full max-w-5xl px-5"
      />

      <section className="mx-auto max-w-2xl px-5 py-16">
        {PRODUCTS.map((p) => (
          <div key={p.name} className="border-t border-hairline py-8">
            <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-ink">{p.name}</h2>
            <p className="mt-2 text-[17px] text-muted">{p.line}</p>
          </div>
        ))}
        <div className="border-t border-hairline py-8">
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-ink">Custom</h2>
          <p className="mt-2 text-[17px] text-muted">
            Need something that doesn’t exist yet? We build it in 1 — or you
            don’t pay for three.
          </p>
        </div>
        <div className="border-t border-b border-hairline py-8">
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-ink">AI for your business</h2>
          <p className="mt-2 text-[17px] text-muted">
            Intelligence built for your company, not a generic tool.
          </p>
        </div>
      </section>

      <section className="bg-bg-muted px-5 py-16 text-center">
        <p className="text-[21px] text-ink">Software needs hardware to run.</p>
        <p className="mt-1 text-[21px] text-muted">BIT’s got you covered.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-6 text-[17px]">
          <Link to="/hardware" className="text-link no-underline hover:underline">
            Hardware ›
          </Link>
          <Link to="/ai" className="text-link no-underline hover:underline">
            AI ›
          </Link>
          <Link to="/security" className="text-link no-underline hover:underline">
            Security ›
          </Link>
        </div>
      </section>
    </main>
  );
}
