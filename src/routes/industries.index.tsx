import { createFileRoute, Link } from "@tanstack/react-router";
import { INDUSTRIES } from "@/data/industries";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/industries/")({
  component: IndustriesIndex,
  head: () => pageHead("/industries"),
});

function IndustriesIndex() {
  return (
    <main className="bg-bg">
      <section className="page-band">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Sectors
        </p>
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[56px]">
          Who we cover.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[19px] leading-snug text-muted sm:text-[21px]">
          Across all of Ontario. Software, hardware, AI, and security
          on every floor.
        </p>
      </section>
      <section className="mx-auto grid max-w-5xl gap-8 px-5 pb-20 sm:grid-cols-2">
        {INDUSTRIES.map((item) => (
          <Link
            key={item.slug}
            to="/industries/$slug"
            params={{ slug: item.slug }}
            className="group text-ink no-underline"
          >
            <img
              src={item.image}
              alt=""
              className="aspect-[16/9] w-full object-cover"
            />
            <p className="mt-4 text-[12px] font-medium uppercase tracking-[0.12em] text-link">
              {item.compliance.join(" · ")}
            </p>
            <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.02em]">
              {item.name}
            </h2>
            <p className="mt-1 text-[16px] text-muted">{item.line}</p>
            <span className="mt-2 inline-block text-[16px] text-link group-hover:underline">
              How BIT runs it ›
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
